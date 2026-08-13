import { adminCreated, adminError, adminSuccess } from "zadm/app/admin/api-response"
import { mapServiceError } from "zadm/app/handlers/error-mapper"
import { requireAuth, requirePermission, requireAnyPermission } from "zadm/app/handlers/guard"
import { parseWithSchema } from "zadm/app/handlers/utils"
import type { Session } from "zadm/app/handlers/types"
import { listAllPermissionRecords } from "zadm/app/repositories/roles"
import {
  bulkDeleteRoles,
  bulkDuplicateRoles,
  createRole,
  deleteRole,
  duplicateRole,
  getRole,
  listRolesService,
  updateRole,
} from "zadm/app/services/roles"
import { createRoleSchema, updateRoleSchema } from "zadm/app/validations/roles"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_EDIT_PERMS = ["roles.edit", "roles.manage"]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export function handleListRoles(filters?: { search?: string; sortBy?: string; sortOrder?: string }) {
  const rolesResult = listRolesService(filters)
  return adminSuccess({
    roles: rolesResult.success ? rolesResult.data : [],
    permissions: listAllPermissionRecords(),
  })
}

export async function handleCreateRole(session: Session, body: unknown) {
  const perm = await requirePermission(session, "roles.create")
  if (perm) return perm

  const parsed = parseWithSchema(createRoleSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = createRole(parsed.data)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export function handleGetRole(id: string) {
  const result = getRole(id)
  if (!result.success) return adminError(result.error.message, 404)
  return adminSuccess({ role: result.data, permissions: listAllPermissionRecords() })
}

export async function handleUpdateRole(session: Session, id: string, body: unknown) {
  const perm = await requireAnyPermission(session, ROLE_EDIT_PERMS)
  if (perm) return perm

  const parsed = parseWithSchema(updateRoleSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = updateRole(id, parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDuplicateRole(session: Session, id: string) {
  const perm = await requirePermission(session, "roles.create")
  if (perm) return perm

  const result = duplicateRole(id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleDeleteRole(session: Session, id: string) {
  const perm = await requirePermission(session, "roles.delete")
  if (perm) return perm

  const result = deleteRole(id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

// ---------------------------------------------------------------------------
// Bulk handlers
// ---------------------------------------------------------------------------

export async function handleBulkDeleteRoles(session: Session, ids: string[]) {
  const unauth = requireAuth(session)
  if (unauth) return unauth
  if (ids.length === 0) return adminError("At least one role id is required.", 400)
  const result = bulkDeleteRoles(ids)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkDuplicateRoles(session: Session, ids: string[]) {
  const unauth = requireAuth(session)
  if (unauth) return unauth
  if (ids.length === 0) return adminError("At least one role id is required.", 400)
  const result = bulkDuplicateRoles(ids)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}
