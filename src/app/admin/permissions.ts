import { findUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"
import { getPermissionDefinitions, isContentPermissionSlug } from "@zbeaver/beaver/app/admin/permission-catalog"
import { isStaticRole, type StaticRole } from "@zbeaver/beaver/pkg/types/roles"

function permissionSlugsForRole(role: StaticRole) {
  const definitions = getPermissionDefinitions()

  if (role === "super-admin" || role === "admin") {
    return definitions.map((permission) => permission.slug)
  }

  if (role === "editor") {
    return definitions
      .filter((permission) =>
        isContentPermissionSlug(permission.slug)
        || permission.slug === "dashboard.view"
        || permission.slug === "media.view"
        || permission.slug === "media.upload",
      )
      .map((permission) => permission.slug)
  }

  return definitions
    .filter((permission) => {
      if (permission.slug === "media.view" || permission.slug === "media.upload") return true
      if (permission.slug === "dashboard.view") return true
      if (
        permission.slug.startsWith("content.page.")
        || permission.slug.startsWith("category.page.")
      ) return false
      if (permission.slug.startsWith("category.")) {
        return permission.slug.endsWith(".view")
      }
      if (!permission.slug.startsWith("content.")) return false
      const action = permission.slug.slice(permission.slug.lastIndexOf(".") + 1)
      return action === "view"
        || action === "create"
        || action === "edit-own"
        || action === "delete-own"
        || action === "publish-own"
        || action === "unpublish-own"
    })
    .map((permission) => permission.slug)
}

async function getUserRole(userId: string): Promise<StaticRole | null> {
  const user = await findUserByIdRecord(userId)
  return user && isStaticRole(user.role) ? user.role : null
}

/** Read the current permission set for a user. This deliberately does not cache. */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const role = await getUserRole(userId)
  return role ? permissionSlugsForRole(role) : []
}

export async function can(userId: string, permission: string): Promise<boolean> {
  const role = await getUserRole(userId)
  if (role === "super-admin") return true
  return role ? permissionSlugsForRole(role).includes(permission) : false
}

export async function canAny(userId: string, permissions: string[]): Promise<boolean> {
  const role = await getUserRole(userId)
  if (role === "super-admin") return true
  if (!role) return false
  const userPermissions = permissionSlugsForRole(role)
  return permissions.some((permission) => userPermissions.includes(permission))
}
