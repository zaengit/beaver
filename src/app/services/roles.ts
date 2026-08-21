import { generateId, getCurrentTimestamp, slugify } from "@zbeaver/beaver/pkg/utils/index"
import type { CreateRoleInput, UpdateRoleInput } from "@zbeaver/beaver/app/validations/roles"
import {
  findRoleByIdRecord,
  findRoleBySlugRecord,
  listRolesWithUserCountRecords,
  createRoleRecord,
  updateRoleRecord,
  deleteRoleRecord,
  getRolePermissionIdsRecord,
  type RoleRow,
} from "@zbeaver/beaver/app/repositories/roles"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { serviceSuccess, serviceNotFound, serviceConflict, serviceForbidden } from "@zbeaver/beaver/app/services/utils"
import { canAssignPermissionIds, canManageExistingRole, hasAnyAdminPermission, loadAdminActor } from "@zbeaver/beaver/app/admin/authorization"
import { deleteRefreshSessionsForRole } from "@zbeaver/beaver/app/admin/session-store"
import { getPermissionDefinitions } from "@zbeaver/beaver/app/admin/permission-catalog"
import { syncPermissionRecords, type SyncPermissionsResult } from "@zbeaver/beaver/app/repositories/permissions"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateRoleSlug(name: string): string {
  return slugify(name) || "role"
}

// ─── List Roles ──────────────────────────────────────────────────────────────

export function listRolesService(filters?: { search?: string; sortBy?: string; sortOrder?: string }): ServiceResult<(RoleRow & { userCount: number; permissionIds: string[] })[]> {
  const rolesWithCount = listRolesWithUserCountRecords(filters)
  const enriched = rolesWithCount.map((role) => ({
    ...role,
    permissionIds: getRolePermissionIdsRecord(role.id),
  }))
  return serviceSuccess(enriched, "Roles retrieved.")
}

// ─── Get Role ────────────────────────────────────────────────────────────────

export function getRole(id: string): ServiceResult<RoleRow & { permissionIds: string[] }> {
  const role = findRoleByIdRecord(id)
  if (!role) return serviceNotFound("Role")
  return serviceSuccess({ ...role, permissionIds: getRolePermissionIdsRecord(id) }, "Role retrieved.")
}

// ─── List Permissions ────────────────────────────────────────────────────────

export async function syncPermissions(actorId: string): Promise<ServiceResult<SyncPermissionsResult>> {
  const actor = await loadAdminActor(actorId)
  if (!actor || !hasAnyAdminPermission(actor, ["roles.manage"])) return serviceForbidden("Insufficient permissions.")

  const result = syncPermissionRecords(getPermissionDefinitions())
  return serviceSuccess(result, "Permissions synced.")
}

// ─── Create Role ─────────────────────────────────────────────────────────────

export async function createRole(data: CreateRoleInput, actorId: string): Promise<ServiceResult<RoleRow>> {
  const actor = await loadAdminActor(actorId)
  if (!actor || !hasAnyAdminPermission(actor, ["roles.create", "roles.manage"])) return serviceForbidden("Insufficient permissions.")
  if (!canAssignPermissionIds(actor, data.permissionIds)) return serviceForbidden("You cannot assign these permissions.")

  const slug = data.slug ?? generateRoleSlug(data.name)

  // Check slug uniqueness
  const existing = findRoleBySlugRecord(slug)
  if (existing) return serviceConflict("slug", "A role with this slug already exists.")

  const id = generateId()
  const now = getCurrentTimestamp()

  const created = createRoleRecord({
    id,
    name: data.name,
    slug,
    description: data.description ?? null,
    permissionIds: [...new Set(data.permissionIds)],
    createdAt: now,
    updatedAt: now,
  })

  return serviceSuccess(created, "Role created.")
}

// ─── Update Role ─────────────────────────────────────────────────────────────

export async function updateRole(id: string, data: UpdateRoleInput, actorId: string): Promise<ServiceResult<RoleRow>> {
  const actor = await loadAdminActor(actorId)
  if (!actor || !hasAnyAdminPermission(actor, ["roles.edit", "roles.manage"])) return serviceForbidden("Insufficient permissions.")

  const existing = findRoleByIdRecord(id)
  if (!existing) return serviceNotFound("Role")

  // Prevent modifying system roles
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be modified.")
  if (!canManageExistingRole(actor, id)) return serviceForbidden("You cannot manage this role.")
  if (data.permissionIds !== undefined && !canAssignPermissionIds(actor, data.permissionIds)) {
    return serviceForbidden("You cannot assign these permissions.")
  }

  // Slug uniqueness check
  if (data.name !== undefined) {
    const newSlug = generateRoleSlug(data.name)
    const conflict = findRoleBySlugRecord(newSlug)
    if (conflict && conflict.id !== id) return serviceConflict("slug", "A role with this slug already exists.")
  }

  const now = getCurrentTimestamp()
  const updateData: {
    name?: string
    slug?: string
    description?: string | null
    permissionIds?: string[]
    updatedAt: number
  } = { updatedAt: now }

  if (data.name !== undefined) {
    updateData.name = data.name
    updateData.slug = generateRoleSlug(data.name)
  }
  if (data.description !== undefined) updateData.description = data.description
  if (data.permissionIds !== undefined) updateData.permissionIds = [...new Set(data.permissionIds)]

  const updated = updateRoleRecord(id, updateData)
  if (!updated) return serviceNotFound("Role")

  deleteRefreshSessionsForRole(id)

  return serviceSuccess(updated, "Role updated.")
}

// ─── Delete Role ─────────────────────────────────────────────────────────────

export async function deleteRole(id: string, actorId: string): Promise<ServiceResult<null>> {
  const actor = await loadAdminActor(actorId)
  if (!actor || !hasAnyAdminPermission(actor, ["roles.delete", "roles.manage"])) return serviceForbidden("Insufficient permissions.")

  const existing = findRoleByIdRecord(id)
  if (!existing) return serviceNotFound("Role")

  // Prevent deleting system roles
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be deleted.")
  if (actor.roleId === id) return serviceForbidden("You cannot delete your own role.")
  if (!canManageExistingRole(actor, id)) return serviceForbidden("You cannot manage this role.")

  deleteRefreshSessionsForRole(id)
  deleteRoleRecord(id)
  return serviceSuccess(null, "Role deleted.")
}

// ─── Duplicate Role ──────────────────────────────────────────────────────────

export async function duplicateRole(id: string, actorId: string): Promise<ServiceResult<RoleRow>> {
  const actor = await loadAdminActor(actorId)
  if (!actor || !hasAnyAdminPermission(actor, ["roles.create", "roles.manage"])) return serviceForbidden("Insufficient permissions.")

  const existing = findRoleByIdRecord(id)
  if (!existing) return serviceNotFound("Role")
  if (!canManageExistingRole(actor, id)) return serviceForbidden("You cannot duplicate this role.")

  const newId = generateId()
  const now = getCurrentTimestamp()
  let newSlug = `${existing.slug}-copy`
  let counter = 1
  while (findRoleBySlugRecord(newSlug)) {
    newSlug = `${existing.slug}-copy-${counter}`
    counter++
  }

  try {
    const created = createRoleRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      slug: newSlug,
      description: existing.description ? `${existing.description} (Copy)` : null,
      permissionIds: getRolePermissionIdsRecord(existing.id),
      createdAt: now,
      updatedAt: now,
    })
    return serviceSuccess(created, "Role duplicated.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate role." } }
  }
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export async function bulkDeleteRoles(ids: string[], actorId: string): Promise<ServiceResult<{ id: string; success: boolean; error?: string }[]>> {
  const results: { id: string; success: boolean; error?: string }[] = []
  for (const id of ids) {
    const result = await deleteRole(id, actorId)
    results.push({ id, success: result.success, error: !result.success ? result.error.message : undefined })
  }
  return serviceSuccess(results, "Bulk delete completed.")
}

export async function bulkDuplicateRoles(ids: string[], actorId: string): Promise<ServiceResult<{ id: string; success: boolean; newId?: string }[]>> {
  const results: { id: string; success: boolean; newId?: string }[] = []
  for (const id of ids) {
    const result = await duplicateRole(id, actorId)
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id })
    } else {
      results.push({ id, success: false })
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.")
}
