import type { PaginationMeta, Post, PublicArchiveFilterOptions, PublicArchiveFilters, PublicPost } from "@/shared/types"
import { parseJsonArray } from "@/components/web/parse-json"

export type ArchiveTemplateVariant = "default" | "post-grid"
export type DetailTemplateVariant = "default" | "post-reader"

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

export function parseGallery(gallery: string | null): string[] {
  return parseJsonArray(gallery)
    .filter((image): image is string => typeof image === "string")
    .map((image) => image.slice(0, 2_048))
    .slice(0, 20)
}
