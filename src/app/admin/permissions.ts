import { eq } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { permissions, rolePermissions, roles, users } from "@zbeaver/beaver/app/db/schema"

type UserRole = {
  roleId: string
  isSystem: boolean
}

async function getUserRole(userId: string): Promise<UserRole | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { roleId: true },
  })

  if (!user?.roleId) return null

  const role = await db.query.roles.findFirst({
    where: eq(roles.id, user.roleId),
    columns: { isSystem: true },
  })

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
    const allPermissions = db
      .select({ slug: permissions.slug })
      .from(permissions)
      .all()
    return allPermissions.map((permission) => permission.slug)
  }

  const rolePerms = await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.roleId, userRole.roleId),
    with: { permission: true },
  })

  return rolePerms.map((rolePermission) => rolePermission.permission.slug)
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
