import { hashPassword } from "@zbeaver/beaver/app/auth"
import { generateId, getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"
import type { CreateUserInput, UpdateUserInput } from "@zbeaver/beaver/app/validations/users"
import {
  findUserByIdRecord,
  findUserByEmailRecord,
  findSafeUserByIdRecord,
  listUsersPaginatedRecord,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
  type UserListItem,
  type UserSafe,
} from "@zbeaver/beaver/app/repositories/users"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { serviceSuccess, serviceNotFound, serviceConflict, serviceForbidden, serviceValidation } from "@zbeaver/beaver/app/services/utils"
import { canAssignRole, canManageSensitiveUserFields, hasAdminPermission, hasAnyAdminPermission, loadAdminActor } from "@zbeaver/beaver/app/admin/authorization"
import { deleteRefreshSessionsForUser } from "@zbeaver/beaver/app/admin/session-store"
import type { StaticRole } from "@zbeaver/beaver/pkg/types/roles"
import type { UserRecord } from "@zbeaver/beaver/app/models/user"
import { isSuperAdminUserId } from "@zbeaver/beaver/app/admin/super-admin"
import { deleteTwoFactorRecord, findTwoFactorRecord } from "@zbeaver/beaver/app/repositories/two-factor"
import { isTwoFactorEnabled } from "@zbeaver/beaver/app/services/two-factor"

// ─── Get User ─────────────────────────────────────────────────────────────────

export async function getUser(id: string): Promise<ServiceResult<UserSafe & { twoFactorEnabled: boolean }>> {
  const user = await findSafeUserByIdRecord(id)
  if (!user) return serviceNotFound("User")
  return serviceSuccess({ ...user, twoFactorEnabled: await isTwoFactorEnabled(id) }, "OK")
}

// ─── Disable User Two-Factor Authentication ─────────────────────────────────

export async function disableUserTwoFactor(
  id: string,
  currentUserId: string,
): Promise<ServiceResult<{ enabled: false }>> {
  const actor = await loadAdminActor(currentUserId)
  if (!actor || !hasAdminPermission(actor, "users.manage")) {
    return serviceForbidden("Insufficient permissions.")
  }

  if (isSuperAdminUserId(id)) {
    return serviceForbidden("Super Admin two-factor authentication is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET.")
  }

  if (id === currentUserId) {
    return serviceForbidden("Use your profile page to disable your own two-factor authentication.")
  }

  const existing = await findUserByIdRecord(id)
  if (!existing) return serviceNotFound("User")

  const record = await findTwoFactorRecord(id)
  if (!record || record.enabled !== 1) {
    return serviceValidation("Two-factor authentication is not enabled.")
  }

  await deleteTwoFactorRecord(id)
  await deleteRefreshSessionsForUser(id)
  return serviceSuccess({ enabled: false }, "Two-factor authentication disabled.")
}

// ─── Get User With Email (returns raw user for auth purposes) ─────────────────

export async function getUserByEmail(email: string): Promise<ServiceResult<UserRecord>> {
  const user = await findUserByEmailRecord(email)
  if (!user) return serviceNotFound("User")
  return serviceSuccess(user, "OK")
}

// ─── List Users ──────────────────────────────────────────────────────────────

// ─── List Users Paginated ────────────────────────────────────────────────────

export async function listUsersPaginated(filters: {
  page?: number
  perPage?: number
  search?: string
  role?: StaticRole
  sortBy?: string
  sortOrder?: string
} = {}): Promise<ServiceResult<{
  data: UserListItem[]
  meta: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
    from: number
    to: number
  }
}>> {
  const result = await listUsersPaginatedRecord(filters)
  return serviceSuccess(result, "OK")
}

// ─── Create User ─────────────────────────────────────────────────────────────

export async function createUser(data: CreateUserInput, actorId: string): Promise<ServiceResult<UserSafe>> {
  const actor = await loadAdminActor(actorId)
  if (!actor || !hasAnyAdminPermission(actor, ["users.create", "users.manage"])) return serviceForbidden("Insufficient permissions.")
  if (!await canAssignRole(actor, data.role)) return serviceForbidden("You cannot assign this role.")

  // Check email uniqueness
  const existing = await findUserByEmailRecord(data.email)
  if (existing) return serviceConflict("email", "A user with this email already exists.")

  const id = generateId()
  const now = getCurrentTimestamp()
  const passwordHash = await hashPassword(data.password)

  const created = await createUserRecord({
    id,
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    createdAt: now,
    updatedAt: now,
  })

  return serviceSuccess(created, "User created.")
}

// ─── Update User ─────────────────────────────────────────────────────────────

export async function updateUser(
  id: string,
  data: UpdateUserInput,
  currentUserId: string,
): Promise<ServiceResult<UserSafe>> {
  if (isSuperAdminUserId(id)) {
    return serviceForbidden("Super Admin is managed by ADMIN_* environment variables.")
  }

  const actor = await loadAdminActor(currentUserId)
  if (!actor || !hasAnyAdminPermission(actor, ["users.edit", "users.manage"])) return serviceForbidden("Insufficient permissions.")

  const existing = await findUserByIdRecord(id)
  if (!existing) return serviceNotFound("User")

  const isSelf = id === currentUserId
  const changesSensitiveFields = data.email !== undefined || data.password !== undefined || data.role !== undefined
  if (!isSelf && changesSensitiveFields) {
    if (!canManageSensitiveUserFields(actor, id) || !await canAssignRole(actor, existing.role)) {
      return serviceForbidden("You cannot manage this user.")
    }
  }

  // Email uniqueness check
  if (data.email !== undefined && data.email !== (existing as Record<string, unknown>).email) {
    const conflict = await findUserByEmailRecord(data.email)
    if (conflict) return serviceConflict("email", "A user with this email already exists.")
  }

  // Prevent self-role-change
  if (data.role !== undefined) {
    if (isSelf) return serviceForbidden("You cannot change your own role.")
    if (!await canAssignRole(actor, data.role)) return serviceForbidden("You cannot assign this role.")
  }

  const now = getCurrentTimestamp()
  const updateData: {
    name?: string
    email?: string
    passwordHash?: string
    role?: StaticRole
    updatedAt: number
  } = { updatedAt: now }

  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.password !== undefined) updateData.passwordHash = await hashPassword(data.password)
  if (data.role !== undefined) updateData.role = data.role

  const updated = await updateUserRecord(id, updateData)
  if (!updated) return serviceNotFound("User")

  if (data.email !== undefined || data.password !== undefined || data.role !== undefined) {
    await deleteRefreshSessionsForUser(id)
  }

  return serviceSuccess(updated, "User updated.")
}

// ─── Delete User ─────────────────────────────────────────────────────────────

export async function deleteUser(
  id: string,
  currentUserId: string,
): Promise<ServiceResult<null>> {
  if (isSuperAdminUserId(id)) {
    return serviceForbidden("Super Admin is managed by ADMIN_* environment variables.")
  }

  const actor = await loadAdminActor(currentUserId)
  if (!actor || !hasAnyAdminPermission(actor, ["users.delete", "users.manage"])) return serviceForbidden("Insufficient permissions.")

  const existing = await findUserByIdRecord(id)
  if (!existing) return serviceNotFound("User")

  // Prevent self-deletion
  if (id === currentUserId) return serviceForbidden("You cannot delete your own account.")
  if (!await canAssignRole(actor, existing.role)) return serviceForbidden("You cannot manage this user.")

  await deleteUserRecord(id)
  await deleteTwoFactorRecord(id)
  return serviceSuccess(null, "User deleted.")
}

// ─── Duplicate User ──────────────────────────────────────────────────────────

export async function duplicateUser(id: string, currentUserId: string): Promise<ServiceResult<UserSafe>> {
  if (isSuperAdminUserId(id)) {
    return serviceForbidden("Super Admin is managed by ADMIN_* environment variables.")
  }

  const actor = await loadAdminActor(currentUserId)
  if (!actor || !hasAnyAdminPermission(actor, ["users.create", "users.manage"])) return serviceForbidden("Insufficient permissions.")

  const existing = await findUserByIdRecord(id)
  if (!existing) return serviceNotFound("User")
  if (!await canAssignRole(actor, existing.role)) return serviceForbidden("You cannot assign this role.")

  const newId = generateId()
  const now = getCurrentTimestamp()

  // Generate unique email
  let newEmail = `duplicated_${existing.email}`
  if (await findUserByEmailRecord(newEmail)) {
    const ts = now.toString(36).slice(-4)
    newEmail = `duplicated_${ts}_${existing.email}`
  }

  try {
    const created = await createUserRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      email: newEmail,
      passwordHash: existing.password, // duplicate password hash
      role: existing.role,
      createdAt: now,
      updatedAt: now,
    })
    return serviceSuccess(created, "User duplicated.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate user." } }
  }
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export async function bulkDeleteUsers(ids: string[], currentUserId: string): Promise<ServiceResult<{ id: string; success: boolean; error?: string }[]>> {
  const results: { id: string; success: boolean; error?: string }[] = []
  for (const id of ids) {
    const result = await deleteUser(id, currentUserId)
    results.push({ id, success: result.success, error: !result.success ? result.error.message : undefined })
  }
  return serviceSuccess(results, "Bulk delete completed.")
}

export async function bulkDuplicateUsers(ids: string[], currentUserId: string): Promise<ServiceResult<{ id: string; success: boolean; newId?: string }[]>> {
  const results: { id: string; success: boolean; newId?: string }[] = []
  for (const id of ids) {
    const result = await duplicateUser(id, currentUserId)
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id })
    } else {
      results.push({ id, success: false })
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.")
}
