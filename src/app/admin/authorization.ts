import { findUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"
import { getUserPermissions } from "@zbeaver/beaver/app/admin/permissions"
import { getStaticRoleRank, isStaticRole, type StaticRole } from "@zbeaver/beaver/pkg/types/roles"

export type AdminActor = {
  id: string
  role: StaticRole | null
  isSuperAdmin: boolean
  permissions: ReadonlySet<string>
}

export async function loadAdminActor(userId: string): Promise<AdminActor | null> {
  const user = await findUserByIdRecord(userId)
  if (!user) return null

  const role = isStaticRole(user.role) ? user.role : null
  return {
    id: user.id,
    role,
    isSuperAdmin: role === "super-admin",
    permissions: new Set(await getUserPermissions(user.id)),
  }
}

export function hasAdminPermission(actor: AdminActor, permission: string) {
  return actor.isSuperAdmin || actor.permissions.has(permission)
}

export function hasAnyAdminPermission(actor: AdminActor, permissions: string[]) {
  return actor.isSuperAdmin || permissions.some((permission) => actor.permissions.has(permission))
}

export async function canAssignRole(actor: AdminActor, role: StaticRole | null | undefined) {
  if (role === undefined) return true
  if (role === null || !isStaticRole(role)) return false
  // Super Admin is environment-managed and must never be persisted in users.
  if (role === "super-admin") return false
  if (actor.isSuperAdmin) return true
  if (!actor.role) return false
  return getStaticRoleRank(role) <= getStaticRoleRank(actor.role)
}

export function canManageSensitiveUserFields(actor: AdminActor, targetUserId: string) {
  return actor.id === targetUserId || hasAdminPermission(actor, "users.manage")
}
