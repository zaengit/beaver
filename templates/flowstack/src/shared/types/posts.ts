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
