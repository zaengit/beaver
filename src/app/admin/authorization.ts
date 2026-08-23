import { findRoleByIdRecord, getPermissionSlugsRecord, getRolePermissionSlugsRecord } from "@zbeaver/beaver/app/repositories/roles"
import { findUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"
import { getUserPermissions } from "@zbeaver/beaver/app/admin/permissions"

export type AdminActor = {
  id: string
  roleId: string | null
  isSystemRole: boolean
  permissions: ReadonlySet<string>
}

export async function loadAdminActor(userId: string): Promise<AdminActor | null> {
  const user = await findUserByIdRecord(userId)
  if (!user) return null

  const role = user.roleId ? await findRoleByIdRecord(user.roleId) : undefined
  return {
    id: user.id,
    roleId: user.roleId,
    isSystemRole: role?.isSystem === 1,
    permissions: new Set(await getUserPermissions(user.id)),
  }
}

export function hasAdminPermission(actor: AdminActor, permission: string) {
  return actor.isSystemRole || actor.permissions.has(permission)
}

export function hasAnyAdminPermission(actor: AdminActor, permissions: string[]) {
  return actor.isSystemRole || permissions.some((permission) => actor.permissions.has(permission))
}

function permissionsWithinActor(actor: AdminActor, permissionSlugs: string[]) {
  return actor.isSystemRole || permissionSlugs.every((permission) => actor.permissions.has(permission))
}

export async function canAssignRole(actor: AdminActor, roleId: string | null | undefined) {
  if (roleId === undefined || roleId === null) return true

  const role = await findRoleByIdRecord(roleId)
  if (!role) return false
  if (role.isSystem === 1) return actor.isSystemRole

  return permissionsWithinActor(actor, await getRolePermissionSlugsRecord(role.id))
}

export async function canManageExistingRole(actor: AdminActor, roleId: string) {
  const role = await findRoleByIdRecord(roleId)
  if (!role || role.isSystem === 1) return false
  if (actor.isSystemRole) return true

  return permissionsWithinActor(actor, await getRolePermissionSlugsRecord(role.id))
}

export async function canAssignPermissionIds(actor: AdminActor, permissionIds: string[]) {
  const uniqueIds = [...new Set(permissionIds)]
  const rows = await getPermissionSlugsRecord(uniqueIds) as Array<{ id: string; slug: string }>
  if (rows.length !== uniqueIds.length) return false
  return permissionsWithinActor(actor, rows.map((row) => row.slug))
}

export function canManageSensitiveUserFields(actor: AdminActor, targetUserId: string) {
  return actor.id === targetUserId || hasAdminPermission(actor, "users.manage")
}
