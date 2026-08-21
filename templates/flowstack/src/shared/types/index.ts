export interface PaginationMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
  from: number
  to: number
}

export type { Post, PublicPost, PublicArchiveFilters, PublicArchiveFilterOptions } from "./posts"
