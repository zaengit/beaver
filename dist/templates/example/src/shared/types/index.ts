// ─── Core Response Types ─────────────────────────────────────────────────────

/** Returned by Server Actions to the client. */
export type ActionResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errors?: Record<string, string[]> }

/** Returned by Service Layer methods. */
export type ServiceResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; error: ServiceError }

export interface ServiceError {
  code: "unauthorized" | "forbidden" | "not_found" | "conflict" | "validation" | "db_error"
  message: string
  fieldErrors?: Record<string, string[]>
}

// ─── Pagination Types ─────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
  from: number
  to: number
}

// ─── Pagination Input ─────────────────────────────────────────────────────────

export interface PaginationInput {
  page?: number
  perPage?: number
}

// ─── Re-exports from sub-modules ──────────────────────────────────────────────

export type { Post, PublicPost, PublicSearchResult, PublicArchiveFilters, PublicArchiveFilterOptions, PostWithRelations, PostFilters } from "./posts"
export type { Category, CreateCategoryInput, UpdateCategoryInput } from "./categories"
export type { User, SafeUser, CreateUserInput, UpdateUserInput } from "./users"
export type { Role, RoleWithPermissions, CreateRoleInput, UpdateRoleInput } from "./roles"
export type { Media, CreateMediaInput, UpdateMediaInput, MediaFilters } from "./media"
export type { Menu, MenuTree, CreateMenuInput, UpdateMenuInput } from "./menus"
