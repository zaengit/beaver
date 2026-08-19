import type { PaginationMeta, Post, PublicArchiveFilterOptions, PublicArchiveFilters, PublicPost } from "@/shared/types"

export interface ArchiveProps {
  contentType: { label: string; description: string | null; slug: string }
  posts: PublicPost[]
  filterOptions: PublicArchiveFilterOptions
  filters: PublicArchiveFilters
  pagination: PaginationMeta
}

export interface DetailProps {
  contentType: { label: string; slug: string }
  post: Post & { authorName: string | null }
}

export function parseGallery(gallery: string | null) {
  try { return gallery ? JSON.parse(gallery) as string[] : [] } catch { return [] }
}
