import { eq } from "drizzle-orm"

import { db } from "zadm/app/db"
import { rolePermissions, users } from "zadm/app/db/schema"
import { forbidden, type ErrorResponse } from "zadm/pkg/http/api-response"

/** Read the current permission set for a user. This deliberately does not cache. */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { roleId: true },
  })

  if (!user?.roleId) return []

  const rolePerms = await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.roleId, user.roleId),
    with: { permission: true },
  })

  return rolePerms.map((rolePermission) => rolePermission.permission.slug)
}

export async function can(userId: string, permission: string): Promise<boolean> {
  return (await getUserPermissions(userId)).includes(permission)
}

export async function canAny(userId: string, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.some((permission) => userPermissions.includes(permission))
}

export async function canAll(userId: string, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId)
  return permissions.every((permission) => userPermissions.includes(permission))
}

export async function requirePermission(
  userId: string,
  permission: string,
): Promise<(ErrorResponse & { status: number }) | null> {
  return (await can(userId, permission)) ? null : forbidden()
}

/** Kept as a no-op because permissions are intentionally not cached. */
export function clearPermissionCache(): void {}
