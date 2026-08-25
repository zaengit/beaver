import { adminCreated, adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { requireAnyPermission, requirePermission } from "@zbeaver/beaver/app/handlers/guard"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { parseBulkIds, parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import {
  bulkDeleteUsers,
  bulkDuplicateUsers,
  createUser,
  deleteUser,
  disableUserTwoFactor,
  duplicateUser,
  getUser,
  listUsersPaginated,
  updateUser,
} from "@zbeaver/beaver/app/services/users"
import { createUserSchema, updateUserSchema } from "@zbeaver/beaver/app/validations/users"
import type { StaticRole } from "@zbeaver/beaver/pkg/types/roles"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_CREATE_PERMS = ["users.create", "users.manage"]
const USER_EDIT_PERMS = ["users.edit", "users.manage"]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleListUsers(session: Session, filters?: {
  search?: string
  role?: StaticRole
  sortBy?: string
  sortOrder?: string
}) {
  const perm = await requirePermission(session, "users.view")
  if (perm) return perm

  const result = await listUsersPaginated(filters ?? {})
  return result.success ? adminSuccess(result.data) : adminError(result.error.message, 500)
}

export async function handleCreateUser(session: Session, body: unknown) {
  const perm = await requireAnyPermission(session, USER_CREATE_PERMS)
  if (perm) return perm

  const parsed = parseWithSchema(createUserSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await createUser(parsed.data, session!.user.id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleGetUser(session: Session, id: string) {
  const perm = await requirePermission(session, "users.view")
  if (perm) return perm

  const result = await getUser(id)
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

  const result = await duplicateUser(id, session!.user.id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleDeleteUser(session: Session, id: string) {
  const perm = await requireAnyPermission(session, ["users.delete", "users.manage"])
  if (perm) return perm

  const result = await deleteUser(id, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDisableUserTwoFactor(session: Session, id: string) {
  const perm = await requirePermission(session, "users.manage")
  if (perm) return perm

  const result = await disableUserTwoFactor(id, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

// ---------------------------------------------------------------------------
// Bulk handlers
// ---------------------------------------------------------------------------

export async function handleBulkDeleteUsers(session: Session, ids: string[]) {
  const perm = await requireAnyPermission(session, ["users.delete", "users.manage"])
  if (perm) return perm
  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return adminError(parsedIds.message, 400)
  const result = await bulkDeleteUsers(parsedIds.ids, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkDuplicateUsers(session: Session, ids: string[]) {
  const perm = await requireAnyPermission(session, USER_CREATE_PERMS)
  if (perm) return perm
  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return adminError(parsedIds.message, 400)
  const result = await bulkDuplicateUsers(parsedIds.ids, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}
