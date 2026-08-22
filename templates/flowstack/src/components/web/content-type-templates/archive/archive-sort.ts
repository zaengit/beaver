import type { PublicArchiveFilters } from "@/shared/types/posts"

export type ArchiveSortValue = "newest" | "oldest" | "title-asc" | "title-desc"

export function parseArchiveSort(value: string | null): Pick<PublicArchiveFilters, "sortBy" | "sortOrder"> {
  switch (value) {
    case "title-asc":
      return { sortBy: "title", sortOrder: "asc" }
    case "title-desc":
      return { sortBy: "title", sortOrder: "desc" }
    case "oldest":
      return { sortBy: "created_at", sortOrder: "asc" }
    case "newest":
      return { sortBy: "created_at", sortOrder: "desc" }
    default:
      return {}
  }
}

export function getArchiveSortValue(filters: PublicArchiveFilters): ArchiveSortValue {
  if (filters.sortBy === "title") return filters.sortOrder === "asc" ? "title-asc" : "title-desc"
  return filters.sortOrder === "asc" ? "oldest" : "newest"
}

export function serializeArchiveSort(filters: PublicArchiveFilters) {
  const sort = getArchiveSortValue(filters)
  return sort === "newest" && !filters.sortOrder ? null : sort
}
