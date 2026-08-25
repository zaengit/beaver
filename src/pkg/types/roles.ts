export const STATIC_ROLE_SLUGS = [
  "super-admin",
  "admin",
  "editor",
  "author",
] as const

export type StaticRole = typeof STATIC_ROLE_SLUGS[number]

export interface StaticRoleDefinition {
  slug: StaticRole
  name: string
  description: string
}

export const STATIC_ROLES: readonly StaticRoleDefinition[] = [
  {
    slug: "super-admin",
    name: "Super Admin",
    description: "Full system access.",
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Manages users, settings, media, menus, and all content.",
  },
  {
    slug: "editor",
    name: "Editor",
    description: "Manages all content and publication.",
  },
  {
    slug: "author",
    name: "Author",
    description: "Creates, edits, publishes, unpublishes, and deletes their own posts, but cannot access pages.",
  },
]

const ROLE_NAMES = new Map(STATIC_ROLES.map((role) => [role.slug, role.name]))

export function isStaticRole(value: unknown): value is StaticRole {
  return typeof value === "string" && STATIC_ROLE_SLUGS.includes(value as StaticRole)
}

export function getStaticRoleName(role: string | null | undefined) {
  if (!isStaticRole(role)) return null
  return ROLE_NAMES.get(role) ?? null
}

export function getStaticRoleDefinition(role: string | null | undefined) {
  if (!isStaticRole(role)) return null
  return STATIC_ROLES.find((definition) => definition.slug === role) ?? null
}

export function getStaticRoleRank(role: StaticRole) {
  return STATIC_ROLE_SLUGS.length - STATIC_ROLE_SLUGS.indexOf(role)
}
