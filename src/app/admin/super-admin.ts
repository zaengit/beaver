import bcrypt from "bcrypt"

import { getAdminCredentials } from "@zbeaver/beaver/app/config/security"
import { type UserRecord } from "@zbeaver/beaver/app/models/user"
import { verifyPassword } from "@zbeaver/beaver/app/auth"

export const SUPER_ADMIN_USER_ID = "env-super-admin"

export function isSuperAdminUserId(userId: string) {
  return userId === SUPER_ADMIN_USER_ID
}

export function isConfiguredSuperAdminEmail(email: string) {
  return email.trim().toLowerCase() === getAdminCredentials().email.toLowerCase()
}

export function getSuperAdminUser(): UserRecord {
  const credentials = getAdminCredentials()
  return {
    id: SUPER_ADMIN_USER_ID,
    name: credentials.name,
    email: credentials.email,
    password: "",
    role: "super-admin",
    emailVerified: 1,
    createdAt: 0,
    updatedAt: 0,
  }
}

export function getSafeSuperAdminUser() {
  const user = getSuperAdminUser()
  Reflect.deleteProperty(user, "password")
  return user as Omit<UserRecord, "password">
}

let configuredPasswordHash: Promise<string> | undefined

async function getConfiguredPasswordHash(password: string) {
  return configuredPasswordHash ??= bcrypt.hash(password, 12)
}

export async function authenticateSuperAdmin(email: string, password: string) {
  const credentials = getAdminCredentials()
  if (email.trim().toLowerCase() !== credentials.email.toLowerCase()) return null

  const hash = await getConfiguredPasswordHash(credentials.password)
  if (!(await verifyPassword(password, hash))) return null
  return getSafeSuperAdminUser()
}
