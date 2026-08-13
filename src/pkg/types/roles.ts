export interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: number
  createdAt: number
  updatedAt: number
}

export interface RoleWithPermissions extends Role {
  permissions: { id: string; slug: string }[]
}

export interface CreateRoleInput {
  name: string
  slug?: string
  description?: string | null
  isSystem?: number
  permissions?: string[]
}

export interface UpdateRoleInput {
  name?: string
  slug?: string
  description?: string | null
  isSystem?: number
  permissions?: string[]
}
