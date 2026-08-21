import type { PaginationInput } from "./index"

export interface Post {
  id: string
  title: string
  slug: string
  type: string
  status: string
  excerpt: string | null
  description: string | null
  tags: string | null
  sections: string | null
  customFieldValues: string | null
  metaTitle: string | null
  metaDescription: string | null
  featuredImage: string | null
  gallery: string | null
  authorId: string
  publishedAt: number | null
  createdAt: number
  updatedAt: number
}

/** Fields safe for unauthenticated consumers. */
export interface PublicPost {
  id: string
  title: string
  slug: string
  type: string
  excerpt: string | null
  featuredImage: string | null
  gallery: string[] | null
  publishedAt: number | null
  authorName: string | null
}

export interface PublicArchiveFilters {
  search?: string
  category?: string
  tag?: string
  customFields?: Record<string, string>
  sortBy?: "title" | "created_at"
  sortOrder?: "asc" | "desc"
}

export interface PublicArchiveFilterOptions {
  categories: { name: string; slug: string }[]
  tags: string[]
  customFields: { name: string; label: string; type: "text" | "number" | "boolean" | "select" | "date"; options: string[] }[]
}

export interface PostWithRelations extends Post {
  author?: { id: string; name: string; email: string } | null
  categories?: { id: string; name: string; slug: string }[]
}

export interface PostFilters extends PaginationInput {
  search?: string
  type?: string
  status?: string
  authorId?: string
  categoryId?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
