// ─── Core Response Types ─────────────────────────────────────────────────────

/** Returned by Service Layer methods. */
export type ServiceResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; error: ServiceError }

interface ServiceError {
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

export type { Post, PublicPost, PublicArchiveFilters, PublicArchiveFilterOptions, PostWithRelations, PostFilters } from "./posts"
