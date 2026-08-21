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
  if (!gallery || gallery.length > 100_000) return []
  try {
    const value = JSON.parse(gallery)
    return Array.isArray(value)
      ? value.filter((image): image is string => typeof image === "string").map((image) => image.slice(0, 2_048)).slice(0, 20)
      : []
  } catch {
    return []
  }
}
