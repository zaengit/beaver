import { hashPassword } from "@zbeaver/beaver/app/auth"
import { generateId, getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"
import type { CreateUserInput, UpdateUserInput } from "@zbeaver/beaver/app/validations/users"
import {
  findUserByIdRecord,
  findUserByEmailRecord,
  listUsersPaginatedRecord,
  userCountByRoleRecord,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
  type UserSafe,
} from "@zbeaver/beaver/app/repositories/users"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { serviceSuccess, serviceNotFound, serviceConflict, serviceForbidden } from "@zbeaver/beaver/app/services/utils"

// ─── Get User ─────────────────────────────────────────────────────────────────

export function getUser(id: string): ServiceResult<UserSafe> {
  const user = findUserByIdRecord(id)
  if (!user) return serviceNotFound("User")
  const { password, ...safe } = user as ReturnType<typeof findUserByIdRecord> & { password?: string }
  return serviceSuccess(safe as UserSafe, "OK")
}

// ─── Get User With Email (returns raw user for auth purposes) ─────────────────

export function getUserByEmail(email: string): ServiceResult<typeof import("@zbeaver/beaver/app/db/schema").users.$inferSelect> {
  const user = findUserByEmailRecord(email)
  if (!user) return serviceNotFound("User")
  return serviceSuccess(user, "OK")
}

// ─── List Users ──────────────────────────────────────────────────────────────

export function listUsersAction(filters: {
  page?: number
  perPage?: number
  search?: string
  roleId?: string
  sortBy?: string
  sortOrder?: string
} = {}): ServiceResult<UserSafe[]> {
  const result = listUsersPaginatedRecord(filters)
  return serviceSuccess(result.data, "OK")
}

// ─── List Users Paginated ────────────────────────────────────────────────────

export function listUsersPaginated(filters: {
  page?: number
  perPage?: number
  search?: string
  roleId?: string
  sortBy?: string
  sortOrder?: string
} = {}): ServiceResult<{
  data: UserSafe[]
  meta: {
    currentPage: number
    perPage: number
    total: number
    lastPage: number
    from: number
    to: number
  }
}> {
  const result = listUsersPaginatedRecord(filters)
  return serviceSuccess(result, "OK")
}

// ─── Create User ─────────────────────────────────────────────────────────────

export async function createUser(data: CreateUserInput): Promise<ServiceResult<UserSafe>> {
  // Check email uniqueness
  const existing = findUserByEmailRecord(data.email)
  if (existing) return serviceConflict("email", "A user with this email already exists.")

  const id = generateId()
  const now = getCurrentTimestamp()
  const passwordHash = await hashPassword(data.password)

  const created = createUserRecord({
    id,
    name: data.name,
    email: data.email,
    passwordHash,
    roleId: data.roleId ?? null,
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
  const existing = findUserByIdRecord(id)
  if (!existing) return serviceNotFound("User")

  // Email uniqueness check
  if (data.email !== undefined && data.email !== (existing as Record<string, unknown>).email) {
    const conflict = findUserByEmailRecord(data.email)
    if (conflict) return serviceConflict("email", "A user with this email already exists.")
  }

  // Prevent self-role-change
  if (data.roleId !== undefined && id === currentUserId) return serviceForbidden("You cannot change your own role.")

  const now = getCurrentTimestamp()
  const updateData: {
    name?: string
    email?: string
    passwordHash?: string
    roleId?: string | null
    updatedAt: number
  } = { updatedAt: now }

  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.password !== undefined) updateData.passwordHash = await hashPassword(data.password)
  if (data.roleId !== undefined) updateData.roleId = data.roleId

  const updated = updateUserRecord(id, updateData)
  if (!updated) return serviceNotFound("User")

  return serviceSuccess(updated, "User updated.")
}

// ─── Delete User ─────────────────────────────────────────────────────────────

export function deleteUser(
  id: string,
  currentUserId: string,
): ServiceResult<null> {
  const existing = findUserByIdRecord(id)
  if (!existing) return serviceNotFound("User")

  // Prevent self-deletion
  if (id === currentUserId) return serviceForbidden("You cannot delete your own account.")

  deleteUserRecord(id)
  return serviceSuccess(null, "User deleted.")
}

// ─── Duplicate User ──────────────────────────────────────────────────────────

export function duplicateUser(id: string, currentUserId: string): ServiceResult<UserSafe> {
  const existing = findUserByIdRecord(id)
  if (!existing) return serviceNotFound("User")

  const newId = generateId()
  const now = getCurrentTimestamp()

  // Generate unique email
  let newEmail = `duplicated_${existing.email}`
  if (findUserByEmailRecord(newEmail)) {
    const ts = now.toString(36).slice(-4)
    newEmail = `duplicated_${ts}_${existing.email}`
  }

  try {
    const created = createUserRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      email: newEmail,
      passwordHash: existing.password, // duplicate password hash
      roleId: existing.roleId,
      createdAt: now,
      updatedAt: now,
    })
    return serviceSuccess(created, "User duplicated.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate user." } }
  }
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export function bulkDeleteUsers(ids: string[], currentUserId: string): ServiceResult<{ id: string; success: boolean; error?: string }[]> {
  const results: { id: string; success: boolean; error?: string }[] = []
  for (const id of ids) {
    const result = deleteUser(id, currentUserId)
    results.push({ id, success: result.success, error: !result.success ? result.error.message : undefined })
  }
  return serviceSuccess(results, "Bulk delete completed.")
}

export function bulkDuplicateUsers(ids: string[], currentUserId: string): ServiceResult<{ id: string; success: boolean; newId?: string }[]> {
  const results: { id: string; success: boolean; newId?: string }[] = []
  for (const id of ids) {
    const result = duplicateUser(id, currentUserId)
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id })
    } else {
      results.push({ id, success: false })
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.")
}
