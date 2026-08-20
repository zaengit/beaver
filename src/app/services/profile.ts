import { hashPassword } from "@zbeaver/beaver/app/auth"
import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"
import { findUserByIdRecord, updateUserRecord, type UserSafe } from "@zbeaver/beaver/app/repositories/users"
import { findUserByEmailRecord } from "@zbeaver/beaver/app/repositories/users"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { serviceSuccess, serviceNotFound, serviceConflict } from "@zbeaver/beaver/app/services/utils"

export interface UpdateProfileInput {
  name?: string
  email?: string
  password?: string
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<ServiceResult<UserSafe>> {
  const existing = findUserByIdRecord(userId)
  if (!existing) return serviceNotFound("User")

  // Email uniqueness check
  if (data.email !== undefined && data.email !== (existing as Record<string, unknown>).email) {
    const conflict = findUserByEmailRecord(data.email)
    if (conflict) return serviceConflict("email", "A user with this email already exists.")
  }

  const now = getCurrentTimestamp()
  const updateData: {
    name?: string
    email?: string
    passwordHash?: string
    updatedAt: number
  } = { updatedAt: now }

  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.password !== undefined) updateData.passwordHash = await hashPassword(data.password)

  const updated = updateUserRecord(userId, updateData)
  if (!updated) return serviceNotFound("User")

  return serviceSuccess(updated, "Profile updated.")
}
