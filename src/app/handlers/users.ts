import { adminCreated, adminError, adminSuccess } from "zadm/app/admin/api-response"
import { requireAuth, requireAnyPermission, requirePermission } from "zadm/app/handlers/guard"
import { mapServiceError } from "zadm/app/handlers/error-mapper"
import { parseWithSchema } from "zadm/app/handlers/utils"
import type { Session } from "zadm/app/handlers/types"
import {
  bulkDeleteUsers,
  bulkDuplicateUsers,
  createUser,
  deleteUser,
  duplicateUser,
  getUser,
  listUsersPaginated,
  updateUser,
} from "zadm/app/services/users"
import { createUserSchema, updateUserSchema } from "zadm/app/validations/users"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INSUFFICIENT = "Insufficient permissions."
const USER_CREATE_PERMS = ["users.create", "users.manage"]
const USER_EDIT_PERMS = ["users.edit", "users.manage"]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleListUsers(filters?: {
  search?: string
  roleId?: string
  sortBy?: string
  sortOrder?: string
}) {
  const result = listUsersPaginated(filters ?? {})
  return result.success ? adminSuccess(result.data) : adminError(result.error.message, 500)
}

export async function handleCreateUser(session: Session, body: unknown) {
  const perm = await requireAnyPermission(session, USER_CREATE_PERMS)
  if (perm) return perm

  const parsed = parseWithSchema(createUserSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await createUser(parsed.data)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleGetUser(id: string) {
  const result = getUser(id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404)
}

export async function handleUpdateUser(session: Session, id: string, body: unknown) {
  const perm = await requireAnyPermission(session, USER_EDIT_PERMS)
  if (perm) return perm

  const parsed = parseWithSchema(updateUserSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await updateUser(id, parsed.data, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDuplicateUser(session: Session, id: string) {
  const perm = await requireAnyPermission(session, USER_CREATE_PERMS)
  if (perm) return perm

  const result = duplicateUser(id, session!.user.id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleDeleteUser(session: Session, id: string) {
  const perm = await requirePermission(session, "users.manage")
  if (perm) return perm

  const result = deleteUser(id, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

// ---------------------------------------------------------------------------
// Bulk handlers
// ---------------------------------------------------------------------------

export function handleBulkDeleteUsers(session: Session, ids: string[]) {
  const unauth = requireAuth(session)
  if (unauth) return unauth
  if (ids.length === 0) return adminError("At least one user id is required.", 400)
  const result = bulkDeleteUsers(ids, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export function handleBulkDuplicateUsers(session: Session, ids: string[]) {
  const unauth = requireAuth(session)
  if (unauth) return unauth
  if (ids.length === 0) return adminError("At least one user id is required.", 400)
  const result = bulkDuplicateUsers(ids, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}
