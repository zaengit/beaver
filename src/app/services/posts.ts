import {
  findPostByIdRecord,
  findPostBySlugRecord,
  findPublishedByTypeAndSlugRecord,
  listPostRecords,
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
import { clampPage, clampPerPage } from "@zbeaver/beaver/pkg/utils/pagination"
import { slugRegex } from "@zbeaver/beaver/app/validations/shared"
import type { CreatePostInput, UpdatePostInput } from "@zbeaver/beaver/app/validations/posts"
import type {
  Post,
  PostWithRelations,
  PublicPost,
  PublicArchiveFilterOptions,
  PublicArchiveFilters,
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

export async function createPost(
  data: CreatePostInput,
  userId: string,
): Promise<ServiceResult<Post>> {
  const slug = buildSlug(data.slug, data.title)

  const existing = await findPostBySlugRecord(slug)
  if (existing) return serviceConflict("slug", "A post with this slug already exists.")

  try {
    const payload = buildPostPayload(data, userId)
    payload.slug = slug // override with the checked slug
    const post = await createPostRecord(payload as Parameters<typeof createPostRecord>[0])

    if (data.categoryIds?.length) {
      await syncPostCategoriesRecord(payload.id as string, data.categoryIds, payload.createdAt as number)
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

export async function updatePost(
  id: string,
  data: UpdatePostInput,
): Promise<ServiceResult<Post>> {
  const existing = await findPostByIdRecord(id)
  if (!existing) return serviceNotFound("Post")

  if (data.slug && data.slug !== existing.slug) {
    const slugConflict = await findPostBySlugRecord(data.slug)
    if (slugConflict) return serviceConflict("slug", "A post with this slug already exists.")
  }

  try {
    const now = Date.now()
    const updateData = buildUpdatePayload(data, existing as unknown as PostRow, now)
    const post = await updatePostRecord(id, updateData)

    if (data.categoryIds !== undefined) {
      await syncPostCategoriesRecord(id, data.categoryIds, now)
    }

    invalidatePublicDataCache()
    return serviceSuccess(post, "Post updated.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to update post." } }
  }
}

// ─── DUPLICATE ───────────────────────────────────────────────────────────────

export async function duplicatePost(id: string, userId: string): Promise<ServiceResult<Post>> {
  const original = await findPostByIdRecord(id)
  if (!original) return serviceNotFound("Post")

  const now = Date.now()
  const newId = generateId()
  let newSlug = `${original.slug}-copy`

  // Check slug uniqueness
  const slugConflict = await findPostBySlugRecord(newSlug)
  if (slugConflict) {
    // Append a timestamp to make it unique
    const timestamp = now.toString(36).slice(-6)
    newSlug = `${original.slug}-copy-${timestamp}`
  }

  try {
    const post = await createPostRecord({
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
      await syncPostCategoriesRecord(
        newId,
        original.categories.map((c: { id: string }) => c.id),
        now,
      )
    }

    invalidatePublicDataCache()
    return serviceSuccess(post, "Post duplicated.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate post." } }
  }
}

// ─── BULK OPERATIONS ─────────────────────────────────────────────────────────

export async function bulkDeletePosts(ids: string[]): Promise<ServiceResult<{ id: string; success: boolean }[]>> {
  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
    const existing = await findPostByIdRecord(id)
    if (!existing) {
      results.push({ id, success: false })
      continue
    }
    try {
      await deletePostRecord(id)
      results.push({ id, success: true })
    } catch {
      results.push({ id, success: false })
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache()
  return serviceSuccess(results, "Bulk delete completed.")
}

export async function bulkPublishPosts(ids: string[]): Promise<ServiceResult<{ id: string; success: boolean }[]>> {
  const now = Date.now()
  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
    const existing = await findPostByIdRecord(id)
    if (!existing) {
      results.push({ id, success: false })
      continue
    }
    try {
      await updatePostRecord(id, { status: "published", publishedAt: now, updatedAt: now })
      results.push({ id, success: true })
    } catch {
      results.push({ id, success: false })
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache()
  return serviceSuccess(results, "Bulk publish completed.")
}

export async function bulkUnpublishPosts(ids: string[]): Promise<ServiceResult<{ id: string; success: boolean }[]>> {
  const now = Date.now()
  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
    const existing = await findPostByIdRecord(id)
    if (!existing) {
      results.push({ id, success: false })
      continue
    }
    try {
      await updatePostRecord(id, { status: "draft", publishedAt: null, updatedAt: now })
      results.push({ id, success: true })
    } catch {
      results.push({ id, success: false })
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache()
  return serviceSuccess(results, "Bulk unpublish completed.")
}

export async function bulkDuplicatePosts(ids: string[], userId: string): Promise<ServiceResult<{ id: string; success: boolean; newId?: string; error?: string }[]>> {
  const results: { id: string; success: boolean; newId?: string; error?: string }[] = []
  for (const originalId of ids) {
    const result = await duplicatePost(originalId, userId)
    if (result.success) {
      results.push({ id: originalId, success: true, newId: result.data.id })
    } else {
      results.push({ id: originalId, success: false, error: result.error.message })
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.")
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function deletePost(id: string): Promise<ServiceResult<null>> {
  const existing = await findPostByIdRecord(id)
  if (!existing) return serviceNotFound("Post")

  try {
    await deletePostRecord(id)
    invalidatePublicDataCache()
    return serviceSuccess(null, "Post deleted.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to delete post." } }
  }
}

// ─── READ ────────────────────────────────────────────────────────────────────

export async function getPost(id: string): Promise<ServiceResult<PostWithRelations>> {
  const post = await findPostByIdRecord(id) as PostWithRelations | null
  if (!post) return serviceNotFound("Post")
  return serviceSuccess(post, "OK")
}

export async function listPosts(filters: PostFilters): Promise<ServiceResult<PaginatedResult<Post>>> {
  const result = await listPostRecords(filters)
  return serviceSuccess(result, "OK")
}

// ─── Public Queries ──────────────────────────────────────────────────────────

export async function getPublishedPostByType(type: string, slug: string): Promise<ServiceResult<Post & { authorName: string | null }>> {
  if (!slugRegex.test(type) || !slugRegex.test(slug)) return serviceNotFound("Post")

  const post = await getCachedPublicData(`post:published:${type}:${slug}`, async () => {
    const record = await findPublishedByTypeAndSlugRecord(type, slug)
    return record
      ? { ...record, description: record.description ? sanitizeHtml(record.description) : null }
      : record
  })
  if (!post) return serviceNotFound("Post")
  return serviceSuccess(post, "OK")
}

export async function listPublishedPostsByType(type: string, page = 1, perPage = 12, filters: PublicArchiveFilters = {}): Promise<ServiceResult<PaginatedResult<PublicPost>>> {
  const normalizedPage = clampPage(page)
  const normalizedPerPage = clampPerPage(perPage, 12)
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
  const cacheKey = [type, normalizedPage, normalizedPerPage, normalizedFilters.search?.toLowerCase() ?? "", normalizedFilters.category?.toLowerCase() ?? "", normalizedFilters.tag?.toLowerCase() ?? "", customFieldCacheKey, normalizedFilters.sortBy ?? "", normalizedFilters.sortOrder ?? ""].join(":")
  return serviceSuccess(await getCachedPublicData(`posts:published:${cacheKey}`, () => listPublishedPostRecordsByType(type, normalizedPage, normalizedPerPage, normalizedFilters)), "OK")
}

export async function getPublishedArchiveFilterOptions(type: string): Promise<ServiceResult<PublicArchiveFilterOptions>> {
  return serviceSuccess(await getCachedPublicData(`posts:published:archive-filter-options:${type}`, async () => ({
    ...(await listPublishedArchiveFilterOptionsByType(type)),
    customFields: getPublicCustomFieldFilters(type),
  })), "OK")
}

function getPublicCustomFieldFilters(type: string) {
  const registry = getServerContentTypeRegistry()
  const contentType = registry.contentTypes.find((candidate) => candidate.slug === type)
  if (!contentType) return []
  return (registry.templates.find((template) => template.id === contentType.detailTemplate && template.kind === "detail")?.fieldSlots ?? [])
    .filter((field) => /^[A-Za-z0-9_-]{1,64}$/.test(field.key))
    .slice(0, 50)
    .flatMap((field) => ["text", "number", "boolean", "select", "date"].includes(field.type)
      ? [{ name: field.key, label: field.label, type: field.type as "text" | "number" | "boolean" | "select" | "date", options: [] as string[] }]
      : [])
}

export function getPublicCustomFieldFiltersFromSearchParams(type: string, searchParams: URLSearchParams) {
  const allowedNames = new Set(getPublicCustomFieldFilters(type).map((field) => field.name))
  const result: Record<string, string> = {}
  let inspected = 0
  for (const [key, value] of searchParams.entries()) {
    inspected += 1
    if (inspected > 200 || Object.keys(result).length >= 50) break
    const name = key.startsWith("field_") ? key.slice(6) : ""
    if (name && allowedNames.has(name)) result[name] = value.slice(0, 100)
  }
  return result
}

function isValidCustomFieldFilterValue(field: ReturnType<typeof getPublicCustomFieldFilters>[number], value: string) {
  if (field.type === "select") return field.options.includes(value)
  if (field.type === "boolean") return value === "true" || value === "false"
  if (field.type === "number") return Number.isFinite(Number(value))
  if (field.type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value)
  return true
}

export async function searchPublishedPosts(query: string, page = 1, perPage = 12): Promise<ServiceResult<PaginatedResult<PublicPost>>> {
  const normalizedQuery = query.trim().slice(0, 100)
  const normalizedPage = clampPage(page)
  const normalizedPerPage = clampPerPage(perPage, 12)
  if (!normalizedQuery) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage: normalizedPerPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK")
  }

  const result = await getCachedPublicData(
    `posts:published:search:${normalizedQuery.toLowerCase()}:${normalizedPage}:${normalizedPerPage}`,
    () => searchPublishedPostRecords(normalizedQuery, normalizedPage, normalizedPerPage),
  )
  return serviceSuccess(result, "OK")
}

export async function listPublishedPostsByTag(tag: string, page = 1, perPage = 12): Promise<ServiceResult<PaginatedResult<PublicPost>>> {
  const normalizedTag = tag.trim().slice(0, 100)
  const normalizedPage = clampPage(page)
  const normalizedPerPage = clampPerPage(perPage, 12)
  if (!normalizedTag) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage: normalizedPerPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK")
  }

  return serviceSuccess(
    await getCachedPublicData(
      `posts:published:tag:${normalizedTag.toLowerCase()}:${normalizedPage}:${normalizedPerPage}`,
      () => listPublishedPostRecordsByTag(normalizedTag, normalizedPage, normalizedPerPage),
    ),
    "OK",
  )
}
