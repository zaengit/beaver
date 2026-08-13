import { generateId, getCurrentTimestamp, slugify } from "zadm/pkg/utils/index"
import type { CreateRoleInput, UpdateRoleInput } from "zadm/app/validations/roles"
import {
  findRoleByIdRecord,
  findRoleBySlugRecord,
  listRolesWithUserCountRecords,
  listAllPermissionRecords,
  listPermissionGroupsRecord,
  createRoleRecord,
  updateRoleRecord,
  deleteRoleRecord,
  getRolePermissionIdsRecord,
  type RoleRow,
} from "zadm/app/repositories/roles"
import type { ServiceResult } from "zadm/pkg/types"
import { serviceSuccess, serviceNotFound, serviceConflict, serviceForbidden } from "zadm/app/services/utils"

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

export function listPermissionsService(): ServiceResult<Record<string, unknown[]>> {
  const grouped = listPermissionGroupsRecord()
  return serviceSuccess(grouped, "Permissions retrieved.")
}

// ─── Create Role ─────────────────────────────────────────────────────────────

export function createRole(data: CreateRoleInput): ServiceResult<RoleRow> {
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
    permissionIds: data.permissionIds,
    createdAt: now,
    updatedAt: now,
  })

  return serviceSuccess(created, "Role created.")
}

// ─── Update Role ─────────────────────────────────────────────────────────────

export function updateRole(id: string, data: UpdateRoleInput): ServiceResult<RoleRow> {
  const existing = findRoleByIdRecord(id)
  if (!existing) return serviceNotFound("Role")

  // Prevent modifying system roles
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be modified.")

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
  if (data.permissionIds !== undefined) updateData.permissionIds = data.permissionIds

  const updated = updateRoleRecord(id, updateData)
  if (!updated) return serviceNotFound("Role")

  return serviceSuccess(updated, "Role updated.")
}

// ─── Delete Role ─────────────────────────────────────────────────────────────

export function deleteRole(id: string): ServiceResult<null> {
  const existing = findRoleByIdRecord(id)
  if (!existing) return serviceNotFound("Role")

  // Prevent deleting system roles
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be deleted.")

  deleteRoleRecord(id)
  return serviceSuccess(null, "Role deleted.")
}

// ─── Duplicate Role ──────────────────────────────────────────────────────────

export function duplicateRole(id: string): ServiceResult<RoleRow> {
  const existing = findRoleByIdRecord(id)
  if (!existing) return serviceNotFound("Role")

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

export function bulkDeleteRoles(ids: string[]): ServiceResult<{ id: string; success: boolean; error?: string }[]> {
  const results: { id: string; success: boolean; error?: string }[] = []
  for (const id of ids) {
    const result = deleteRole(id)
    results.push({ id, success: result.success, error: !result.success ? result.error.message : undefined })
  }
  return serviceSuccess(results, "Bulk delete completed.")
}

export function bulkDuplicateRoles(ids: string[]): ServiceResult<{ id: string; success: boolean; newId?: string }[]> {
  const results: { id: string; success: boolean; newId?: string }[] = []
  for (const id of ids) {
    const result = duplicateRole(id)
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id })
    } else {
      results.push({ id, success: false })
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.")
}
