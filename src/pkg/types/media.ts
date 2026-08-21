import type { PaginationInput } from "./index"

export interface MediaFilters extends PaginationInput {
  search?: string
  mimeType?: string
  folder?: string | null
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
