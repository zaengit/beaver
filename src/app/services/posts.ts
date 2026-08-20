import {
  findPostByIdRecord,
  findPostBySlugRecord,
  findPublishedBySlugRecord,
  findPublishedByTypeAndSlugRecord,
  listPostRecords,
  listPublishedPostRecords,
  listPublishedPostRecordsByType,
  listPublishedPostRecordsByTag,
  listPublishedArchiveFilterOptionsByType,
  searchPublishedPostRecords,
  createPostRecord,
  updatePostRecord,
  deletePostRecord,
  syncPostCategoriesRecord,
} from "@zbeaver/beaver/app/repositories/posts"
import { getServerContentTypeRegistry } from "@zbeaver/beaver/app/registry/server-content-types"
import { sanitizeText, sanitizeHtml } from "@zbeaver/beaver/pkg/security/sanitize"
import { generateId } from "@zbeaver/beaver/pkg/utils/id"
import type { CreatePostInput, UpdatePostInput } from "@zbeaver/beaver/app/validations/posts"
import type {
  Post,
  PostWithRelations,
  PublicArchiveFilterOptions,
  PublicArchiveFilters,
  PublicSearchResult,
  ServiceResult,
  PaginatedResult,
  PostFilters,
} from "@zbeaver/beaver/pkg/types"
import {
  serviceSuccess,
  serviceNotFound,
  serviceConflict,
} from "@zbeaver/beaver/app/services/utils"
import { getCachedPublicData, invalidatePublicDataCache } from "@zbeaver/beaver/app/cache/public-data-cache"

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Build a URL-safe slug from a title string. */
function buildSlug(input: string | undefined, title: string): string {
  return (input || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100)
}

/** Stringify a JSON value for storage, returning `null` when empty/absent. */
function jsonOrNull(value: unknown): string | null {
  if (Array.isArray(value)) return value.length > 0 ? JSON.stringify(value) : null
  return value ? JSON.stringify(value) : null
}

type PostRow = Record<string, unknown>

/** Compute `publishedAt` based on old/new status transition. */
function computePublishedAt(
  inputPublishedAt: number | null | undefined,
  oldStatus: string | undefined,
  newStatus: string,
  existing: PostRow,
  now: number,
): number | null {
  if (inputPublishedAt !== undefined) return inputPublishedAt
  if (oldStatus !== "published" && newStatus === "published") return now
  if (oldStatus === "published" && newStatus === "draft") return null
  return (existing.publishedAt as number | null) ?? null
}

/** Build the payload object for `createPostRecord` / `updatePostRecord`. */
function buildPostPayload(data: CreatePostInput | UpdatePostInput, userId: string): Record<string, unknown> {
  const now = Date.now()
  const isPublished = "status" in data ? data.status === "published" : false
  return {
    id: generateId(),
    title: sanitizeText(data.title ?? ""),
    slug: buildSlug(data.slug, data.title ?? ""),
    type: data.type ?? "post",
    status: data.status ?? "draft",
    excerpt: data.excerpt ?? null,
    description: data.description ? sanitizeHtml(data.description) : null,
    tags: jsonOrNull(data.tags),
    sections: jsonOrNull(data.sections),
    customFieldValues: jsonOrNull(data.customFieldValues),
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    featuredImage: data.featuredImage ?? null,
    gallery: jsonOrNull(data.gallery),
    authorId: userId,
    publishedAt: isPublished ? (data.publishedAt ?? now) : null,
    createdAt: now,
    updatedAt: now,
  }
}

/** Build the diff payload for `updatePostRecord` (only set fields that changed). */
function buildUpdatePayload(data: UpdatePostInput, existing: PostRow, now: number): Record<string, unknown> {
  const oldStatus = existing.status as string | undefined
  const newStatus = (data.status ?? oldStatus)!
  const publishedAt = computePublishedAt(
    (data as Record<string, unknown>).publishedAt as number | null | undefined,
    oldStatus,
    newStatus,
    existing,
    now,
  )

  const update: Record<string, unknown> = { updatedAt: now }
  if (data.title !== undefined) update.title = sanitizeText(data.title)
  if (data.slug !== undefined) update.slug = data.slug
  if (data.type !== undefined) update.type = data.type
  if (data.status !== undefined) update.status = data.status
  if (data.excerpt !== undefined) update.excerpt = data.excerpt ?? null
  if (data.description !== undefined) update.description = data.description ? sanitizeHtml(data.description) : null
  if (data.tags !== undefined) update.tags = jsonOrNull(data.tags)
  if (data.sections !== undefined) update.sections = jsonOrNull(data.sections)
  if (data.customFieldValues !== undefined) update.customFieldValues = jsonOrNull(data.customFieldValues)
  if (data.metaTitle !== undefined) update.metaTitle = data.metaTitle ?? null
  if (data.metaDescription !== undefined) update.metaDescription = data.metaDescription ?? null
  if (data.featuredImage !== undefined) update.featuredImage = data.featuredImage ?? null
  if (data.gallery !== undefined) update.gallery = jsonOrNull(data.gallery)
  update.publishedAt = publishedAt

  return update
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export function createPost(
  data: CreatePostInput,
  userId: string,
): ServiceResult<Post> {
  const slug = buildSlug(data.slug, data.title)

  const existing = findPostBySlugRecord(slug)
  if (existing) return serviceConflict("slug", "A post with this slug already exists.")

  try {
    const payload = buildPostPayload(data, userId)
    payload.slug = slug // override with the checked slug
    const post = createPostRecord(payload as Parameters<typeof createPostRecord>[0])

    if (data.categoryIds?.length) {
      syncPostCategoriesRecord(payload.id as string, data.categoryIds, payload.createdAt as number)
    }

    invalidatePublicDataCache()
    return serviceSuccess(post, "Post created.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to create post." } }
  }
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export function updatePost(
  id: string,
  data: UpdatePostInput,
  _userId: string,
): ServiceResult<Post> {
  const existing = findPostByIdRecord(id)
  if (!existing) return serviceNotFound("Post")

  if (data.slug && data.slug !== existing.slug) {
    const slugConflict = findPostBySlugRecord(data.slug)
    if (slugConflict) return serviceConflict("slug", "A post with this slug already exists.")
  }

  try {
    const now = Date.now()
    const updateData = buildUpdatePayload(data, existing as unknown as PostRow, now)
    const post = updatePostRecord(id, updateData)

    if (data.categoryIds !== undefined) {
      syncPostCategoriesRecord(id, data.categoryIds, now)
    }

    invalidatePublicDataCache()
    return serviceSuccess(post, "Post updated.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to update post." } }
  }
}

// ─── DUPLICATE ───────────────────────────────────────────────────────────────

export function duplicatePost(id: string, userId: string): ServiceResult<Post> {
  const original = findPostByIdRecord(id)
  if (!original) return serviceNotFound("Post")

  const now = Date.now()
  const newId = generateId()
  let newSlug = `${original.slug}-copy`

  // Check slug uniqueness
  const slugConflict = findPostBySlugRecord(newSlug)
  if (slugConflict) {
    // Append a timestamp to make it unique
    const timestamp = now.toString(36).slice(-6)
    newSlug = `${original.slug}-copy-${timestamp}`
  }

  try {
    const post = createPostRecord({
      id: newId,
      title: original.title ? `${original.title} (Copy)` : "Untitled (Copy)",
      slug: newSlug,
      type: original.type,
      status: "draft",
      excerpt: original.excerpt,
      description: original.description,
      tags: original.tags,
      sections: original.sections,
      customFieldValues: original.customFieldValues,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      featuredImage: original.featuredImage,
      gallery: original.gallery,
      authorId: userId,
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    })

    // Copy category associations
    if (original.categories?.length) {
      syncPostCategoriesRecord(
        newId,
        original.categories.map((c: { id: string }) => c.id),
        now,
      )
    }

    invalidatePublicDataCache()
    return serviceSuccess(post, "Post duplicated.")
  } catch (err) {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate post." } }
  }
}

// ─── BULK OPERATIONS ─────────────────────────────────────────────────────────

export function bulkDeletePosts(ids: string[]): ServiceResult<{ id: string; success: boolean }[]> {
  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
    const existing = findPostByIdRecord(id)
    if (!existing) {
      results.push({ id, success: false })
      continue
    }
    try {
      deletePostRecord(id)
      results.push({ id, success: true })
    } catch {
      results.push({ id, success: false })
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache()
  return serviceSuccess(results, "Bulk delete completed.")
}

export function bulkPublishPosts(ids: string[]): ServiceResult<{ id: string; success: boolean }[]> {
  const now = Date.now()
  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
    const existing = findPostByIdRecord(id)
    if (!existing) {
      results.push({ id, success: false })
      continue
    }
    try {
      updatePostRecord(id, { status: "published", publishedAt: now, updatedAt: now })
      results.push({ id, success: true })
    } catch {
      results.push({ id, success: false })
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache()
  return serviceSuccess(results, "Bulk publish completed.")
}

export function bulkUnpublishPosts(ids: string[]): ServiceResult<{ id: string; success: boolean }[]> {
  const now = Date.now()
  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
    const existing = findPostByIdRecord(id)
    if (!existing) {
      results.push({ id, success: false })
      continue
    }
    try {
      updatePostRecord(id, { status: "draft", publishedAt: null, updatedAt: now })
      results.push({ id, success: true })
    } catch {
      results.push({ id, success: false })
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache()
  return serviceSuccess(results, "Bulk unpublish completed.")
}

export function bulkDuplicatePosts(ids: string[], userId: string): ServiceResult<{ id: string; success: boolean; newId?: string; error?: string }[]> {
  const results: { id: string; success: boolean; newId?: string; error?: string }[] = []
  for (const originalId of ids) {
    const result = duplicatePost(originalId, userId)
    if (result.success) {
      results.push({ id: originalId, success: true, newId: result.data.id })
    } else {
      results.push({ id: originalId, success: false, error: result.error.message })
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.")
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export function deletePost(id: string): ServiceResult<null> {
  const existing = findPostByIdRecord(id)
  if (!existing) return serviceNotFound("Post")

  try {
    deletePostRecord(id)
    invalidatePublicDataCache()
    return serviceSuccess(null, "Post deleted.")
  } catch (err) {
    return { success: false, error: { code: "db_error", message: "Failed to delete post." } }
  }
}

// ─── READ ────────────────────────────────────────────────────────────────────

export function getPost(id: string): ServiceResult<PostWithRelations> {
  const post = findPostByIdRecord(id) as PostWithRelations | null
  if (!post) return serviceNotFound("Post")
  return serviceSuccess(post, "OK")
}

export function listPosts(filters: PostFilters): ServiceResult<PaginatedResult<Post>> {
  const result = listPostRecords(filters)
  return serviceSuccess(result, "OK")
}

// ─── Public Queries ──────────────────────────────────────────────────────────

export function getPublishedPost(slug: string): ServiceResult<Post & { authorName: string | null }> {
  const post = getCachedPublicData(`post:published:${slug}`, () => findPublishedBySlugRecord(slug))
  if (!post) return serviceNotFound("Post")
  return serviceSuccess(post, "OK")
}

export function listPublishedPosts(page = 1, perPage = 12): ServiceResult<PaginatedResult<unknown>> {
  const result = getCachedPublicData(`posts:published:${page}:${perPage}`, () => listPublishedPostRecords(page, perPage))
  return serviceSuccess(result, "OK")
}

export function getPublishedPostByType(type: string, slug: string): ServiceResult<Post & { authorName: string | null }> {
  const post = getCachedPublicData(`post:published:${type}:${slug}`, () => findPublishedByTypeAndSlugRecord(type, slug))
  if (!post) return serviceNotFound("Post")
  return serviceSuccess(post, "OK")
}

export function listPublishedPostsByType(type: string, page = 1, perPage = 12, filters: PublicArchiveFilters = {}): ServiceResult<PaginatedResult<unknown>> {
  const availableCustomFields = getPublicCustomFieldFilters(type)
  const requestedCustomFields = filters.customFields ?? {}
  const customFields = Object.fromEntries(
    availableCustomFields.flatMap((field) => {
      const value = requestedCustomFields[field.name]?.trim().slice(0, 100)
      if (!value || !isValidCustomFieldFilterValue(field, value)) return []
      return [[field.name, field.type === "boolean" ? (value === "true" ? "1" : "0") : value]]
    }),
  )
  const normalizedFilters: PublicArchiveFilters = {
    search: filters.search?.trim().slice(0, 100) || undefined,
    category: filters.category?.trim().slice(0, 100) || undefined,
    tag: filters.tag?.trim().slice(0, 100) || undefined,
    customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
    sortBy: filters.sortBy === "title" ? "title" : filters.sortBy === "created_at" ? "created_at" : undefined,
    sortOrder: filters.sortOrder === "asc" || filters.sortOrder === "desc" ? filters.sortOrder : undefined,
  }
  const customFieldCacheKey = Object.entries(normalizedFilters.customFields ?? {}).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${name}=${value}`).join(",")
  const cacheKey = [type, page, perPage, normalizedFilters.search?.toLowerCase() ?? "", normalizedFilters.category?.toLowerCase() ?? "", normalizedFilters.tag?.toLowerCase() ?? "", customFieldCacheKey, normalizedFilters.sortBy ?? "", normalizedFilters.sortOrder ?? ""].join(":")
  return serviceSuccess(getCachedPublicData(`posts:published:${cacheKey}`, () => listPublishedPostRecordsByType(type, page, perPage, normalizedFilters)), "OK")
}

export function getPublishedArchiveFilterOptions(type: string): ServiceResult<PublicArchiveFilterOptions> {
  return serviceSuccess(getCachedPublicData(`posts:published:archive-filter-options:${type}`, () => ({
    ...listPublishedArchiveFilterOptionsByType(type),
    customFields: getPublicCustomFieldFilters(type),
  })), "OK")
}

export function getPublicCustomFieldFilters(type: string) {
  const registry = getServerContentTypeRegistry()
  const contentType = registry.contentTypes.find((candidate) => candidate.slug === type)
  if (!contentType) return []
  return (registry.templates.find((template) => template.id === contentType.detailTemplate && template.kind === "detail")?.fieldSlots ?? [])
    .flatMap((field) => ["text", "number", "boolean", "select", "date"].includes(field.type)
      ? [{ name: field.key, label: field.label, type: field.type as "text" | "number" | "boolean" | "select" | "date", options: [] as string[] }]
      : [])
}

export function getPublicCustomFieldFiltersFromSearchParams(type: string, searchParams: URLSearchParams) {
  const allowedNames = new Set(getPublicCustomFieldFilters(type).map((field) => field.name))
  return Object.fromEntries([...searchParams.entries()]
    .flatMap(([key, value]) => key.startsWith("field_") && allowedNames.has(key.slice(6)) ? [[key.slice(6), value]] : []))
}

function isValidCustomFieldFilterValue(field: ReturnType<typeof getPublicCustomFieldFilters>[number], value: string) {
  if (field.type === "select") return field.options.includes(value)
  if (field.type === "boolean") return value === "true" || value === "false"
  if (field.type === "number") return Number.isFinite(Number(value))
  if (field.type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value)
  return true
}

export function searchPublishedPosts(query: string, page = 1, perPage = 12): ServiceResult<PaginatedResult<PublicSearchResult>> {
  const normalizedQuery = query.trim().slice(0, 100)
  if (!normalizedQuery) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK")
  }

  const result = getCachedPublicData(
    `posts:published:search:${normalizedQuery.toLowerCase()}:${page}:${perPage}`,
    () => searchPublishedPostRecords(normalizedQuery, page, perPage),
  )
  return serviceSuccess(result, "OK")
}

export function listPublishedPostsByTag(tag: string, page = 1, perPage = 12): ServiceResult<PaginatedResult<unknown>> {
  const normalizedTag = tag.trim().slice(0, 100)
  if (!normalizedTag) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK")
  }

  return serviceSuccess(
    getCachedPublicData(
      `posts:published:tag:${normalizedTag.toLowerCase()}:${page}:${perPage}`,
      () => listPublishedPostRecordsByTag(normalizedTag, page, perPage),
    ),
    "OK",
  )
}
