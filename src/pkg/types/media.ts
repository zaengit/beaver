import type { PaginationInput } from "./index"

export interface Media {
  id: string
  userId: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl: string | null
  alt: string | null
  caption: string | null
  width: number | null
  height: number | null
  folder: string | null
  createdAt: number
  updatedAt: number
}

export interface CreateMediaInput {
  userId: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string | null
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  folder?: string | null
}

export interface UpdateMediaInput {
  name?: string
  alt?: string | null
  caption?: string | null
  folder?: string | null
}

export interface MediaFilters extends PaginationInput {
  search?: string
  mimeType?: string
  folder?: string | null
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
