import { adminCreated, adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { requireAnyPermission, requirePermission } from "@zbeaver/beaver/app/handlers/guard"
import { parseBulkIds, parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { listAllPermissionRecords } from "@zbeaver/beaver/app/repositories/roles"
import {
  bulkDeleteRoles,
  bulkDuplicateRoles,
  createRole,
  deleteRole,
  duplicateRole,
  getRole,
  listRolesService,
  syncPermissions,
  updateRole,
} from "@zbeaver/beaver/app/services/roles"
import { createRoleSchema, updateRoleSchema } from "@zbeaver/beaver/app/validations/roles"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_EDIT_PERMS = ["roles.edit", "roles.manage"]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleListRoles(session: Session, filters?: { search?: string; sortBy?: string; sortOrder?: string }) {
  const perm = await requirePermission(session, "roles.view")
  if (perm) return perm

  const rolesResult = listRolesService(filters)
  return adminSuccess({
    roles: rolesResult.success ? rolesResult.data : [],
    permissions: listAllPermissionRecords(),
  })
}

export async function handleSyncPermissions(session: Session) {
  const perm = await requirePermission(session, "roles.manage")
  if (perm) return perm

  const result = await syncPermissions(session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleCreateRole(session: Session, body: unknown) {
  const perm = await requireAnyPermission(session, ["roles.create", "roles.manage"])
  if (perm) return perm

  const parsed = parseWithSchema(createRoleSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await createRole(parsed.data, session!.user.id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleGetRole(session: Session, id: string) {
  const perm = await requirePermission(session, "roles.view")
  if (perm) return perm

  const result = getRole(id)
  if (!result.success) return adminError(result.error.message, 404)
  return adminSuccess({ role: result.data, permissions: listAllPermissionRecords() })
}

export async function handleUpdateRole(session: Session, id: string, body: unknown) {
  const perm = await requireAnyPermission(session, ROLE_EDIT_PERMS)
  if (perm) return perm

  const parsed = parseWithSchema(updateRoleSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await updateRole(id, parsed.data, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDuplicateRole(session: Session, id: string) {
  const perm = await requireAnyPermission(session, ["roles.create", "roles.manage"])
  if (perm) return perm

  const result = await duplicateRole(id, session!.user.id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleDeleteRole(session: Session, id: string) {
  const perm = await requireAnyPermission(session, ["roles.delete", "roles.manage"])
  if (perm) return perm

  const result = await deleteRole(id, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

// ---------------------------------------------------------------------------
// Bulk handlers
// ---------------------------------------------------------------------------

export async function handleBulkDeleteRoles(session: Session, ids: string[]) {
  const perm = await requireAnyPermission(session, ["roles.delete", "roles.manage"])
  if (perm) return perm
  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return adminError(parsedIds.message, 400)
  const result = await bulkDeleteRoles(parsedIds.ids, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkDuplicateRoles(session: Session, ids: string[]) {
  const perm = await requireAnyPermission(session, ["roles.create", "roles.manage"])
  if (perm) return perm
  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return adminError(parsedIds.message, 400)
  const result = await bulkDuplicateRoles(parsedIds.ids, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}
