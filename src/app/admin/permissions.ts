import { eq } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { permissions, rolePermissions, roles, users } from "@zbeaver/beaver/app/db/schema"

type UserRole = {
  roleId: string
  isSystem: boolean
}

async function getUserRole(userId: string): Promise<UserRole | null> {
  const userRows = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .execute()
  const user = userRows[0]

  if (!user?.roleId) return null

  const roleRows = await db
    .select({ isSystem: roles.isSystem })
    .from(roles)
    .where(eq(roles.id, user.roleId))
    .limit(1)
    .execute()
  const role = roleRows[0]

  if (!role) return null
  return { roleId: user.roleId, isSystem: role.isSystem === 1 }
}

/** Read the current permission set for a user. This deliberately does not cache. */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userRole = await getUserRole(userId)
  if (!userRole) return []

  // A system role is the explicit full-access role. Returning every stored
  // permission also keeps the admin UI in sync with the API for that role.
  if (userRole.isSystem) {
    const allPermissions = await db
      .select({ slug: permissions.slug })
      .from(permissions)
      .execute()
    return allPermissions.map((permission: { slug: string }) => permission.slug)
  }

  const rolePerms = await db
    .select({ slug: permissions.slug })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, userRole.roleId))
    .execute()

  return rolePerms.map((rolePermission: { slug: string }) => rolePermission.slug)
}

export async function can(userId: string, permission: string): Promise<boolean> {
  const userRole = await getUserRole(userId)
  if (userRole?.isSystem) return true
  return (await getUserPermissions(userId)).includes(permission)
}

export async function canAny(userId: string, permissions: string[]): Promise<boolean> {
  const userRole = await getUserRole(userId)
  if (userRole?.isSystem) return true
  const userPermissions = await getUserPermissions(userId)
  return permissions.some((permission) => userPermissions.includes(permission))
}
