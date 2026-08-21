interface AdminPaginationMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
  from: number
  to: number
}

export interface AdminCategory {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  image: string | null
  status: "draft" | "published"
  createdAt: number
  updatedAt: number
}

export type AdminCategoryOption = Pick<AdminCategory, "id" | "name" | "slug" | "type">

interface AdminPostListItem {
  id: string
  title: string
  status: string
  featuredImage: string | null
  publishedAt: number | null
  updatedAt: number
}

export interface AdminPostDetail extends AdminPostListItem {
  slug: string
  type: string
  excerpt: string | null
  description: string | null
  tags: string | null
  sections: string | null
  metaTitle: string | null
  metaDescription: string | null
  gallery: string | null
  categories?: AdminCategoryOption[]
  customFieldValues?: string | null
}

export interface AdminRole {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: number
  createdAt: number
  updatedAt: number
  userCount?: number
  permissionIds?: string[]
}

interface AdminPermission {
  id: string
  name: string
  slug: string
  group: string
  description: string | null
}

export interface AdminUser {
  id: string
  name: string
  email: string
  roleId: string | null
  emailVerified: number
  createdAt: number
  updatedAt: number
  roleName?: string | null
}

export interface AdminRoleListResponse {
  roles: AdminRole[]
  permissions: AdminPermission[]
  meta?: AdminPaginationMeta
}

export interface AdminUserListResponse {
  data: AdminUser[]
  meta: AdminPaginationMeta
  roles?: AdminRole[]
}

export interface AdminPostListResponse {
  data: AdminPostListItem[]
  meta: AdminPaginationMeta
}
