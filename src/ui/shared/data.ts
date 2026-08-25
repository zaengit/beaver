import type { StaticRole } from "@zbeaver/beaver/pkg/types/roles"
import type { ActivityLogMetadata } from "@zbeaver/beaver/app/models/activity-log"

export interface AdminPaginationMeta {
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
  type: string
  status: string
  featuredImage: string | null
  publishedAt: number | null
  updatedAt: number
  deletedAt?: number | null
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

export interface AdminUser {
  id: string
  name: string
  email: string
  role: StaticRole
  emailVerified: number
  createdAt: number
  updatedAt: number
  twoFactorEnabled?: boolean
  roleName?: string | null
}

export interface AdminUserListResponse {
  data: AdminUser[]
  meta: AdminPaginationMeta
}

export interface AdminPostListResponse {
  data: AdminPostListItem[]
  meta: AdminPaginationMeta
}

export interface AdminActivityLog {
  id: string
  actorId: string | null
  actorName: string | null
  actorEmail: string | null
  action: string
  resource: string
  resourceId: string | null
  metadata: ActivityLogMetadata | null
  ipAddress: string | null
  userAgent: string | null
  success: number
  statusCode: number
  createdAt: number
}

export interface AdminActivityLogListResponse {
  data: AdminActivityLog[]
  meta: AdminPaginationMeta
}
