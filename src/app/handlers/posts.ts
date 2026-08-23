import { adminCreated, adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { requireAuth } from "@zbeaver/beaver/app/handlers/guard"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { parseBulkIds, parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { can } from "@zbeaver/beaver/app/admin/permissions"
import {
  bulkDeletePosts,
  bulkDuplicatePosts,
  bulkPublishPosts,
  bulkUnpublishPosts,
  createPost,
  deletePost,
  duplicatePost,
  getPost,
  listPosts,
  updatePost,
} from "@zbeaver/beaver/app/services/posts"
import { createPostSchema, updatePostSchema } from "@zbeaver/beaver/app/validations/posts"
import type { PostFilters } from "@zbeaver/beaver/pkg/types/posts"
import {
  contentPermission,
  isKnownContentType,
  type ContentAction,
} from "@zbeaver/beaver/app/admin/content-permissions"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INSUFFICIENT = "Insufficient permissions."

async function canPost(userId: string, type: string, action: ContentAction) {
  return isKnownContentType(type) && can(userId, contentPermission(type, action))
}

async function canEditPost(userId: string, id: string) {
  const result = await getPost(id)
  if (!result.success) return false
  if (await canPost(userId, result.data.type, "edit")) return true
  return (await canPost(userId, result.data.type, "edit-own")) && result.data.authorId === userId
}

/** Returns early if the session is missing or the user lacks a post-action permission. */
async function guardPost(session: Session, type: string, action: ContentAction) {
  const unauth = requireAuth(session)
  if (unauth) return unauth
  if (!(await canPost(session!.user.id, type, action))) return adminError(INSUFFICIENT, 403)
  return null
}

/** Runs a bulk permission check: every ID must have a post with the required action. */
async function guardBulkPost(session: Session, ids: string[], action: ContentAction) {
  const unauth = requireAuth(session)
  if (unauth) return unauth
  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return adminError(parsedIds.message, 400)
  const allowed = await Promise.all(
    parsedIds.ids.map(async (id) => {
      const post = await getPost(id)
      return post.success && canPost(session!.user.id, post.data.type, action)
    }),
  )
  return allowed.every(Boolean) ? null : adminError(INSUFFICIENT, 403)
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleListPosts(session: Session, filters: PostFilters) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const type = filters.type ?? "post"
  if (!(await canPost(session!.user.id, type, "view"))) return adminError(INSUFFICIENT, 403)

  const result = await listPosts({ ...filters, type })
  return result.success ? adminSuccess(result.data) : mapServiceError(result)
}

export async function handleCreatePost(session: Session, body: unknown) {
  const parsed = parseWithSchema(createPostSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const perm = await guardPost(session, parsed.data.type, "create")
  if (perm) return perm

  const result = await createPost(parsed.data, session!.user.id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleGetPost(session: Session, id: string) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const result = await getPost(id)
  if (!result.success) return adminError(result.error.message, 404)

  if (!(await canPost(session!.user.id, result.data.type, "view"))) return adminError(INSUFFICIENT, 403)

  return adminSuccess(result.data)
}

export async function handleUpdatePost(session: Session, id: string, body: unknown) {
  if (!(await canEditPost(session?.user?.id ?? "", id))) return adminError(INSUFFICIENT, 403)

  const parsed = parseWithSchema(updatePostSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const existing = await getPost(id)
  if (!existing.success) return adminError(existing.error.message, 404)
  if (parsed.data.type !== undefined && parsed.data.type !== existing.data.type)
    return adminError("Content type cannot be changed.", 422)
  if (
    parsed.data.status === "published" &&
    existing.data.status !== "published" &&
    !(await canPost(session!.user.id, existing.data.type, "publish"))
  )
    return adminError(INSUFFICIENT, 403)
  if (
    parsed.data.status === "draft" &&
    existing.data.status === "published" &&
    !(await canPost(session!.user.id, existing.data.type, "unpublish"))
  )
    return adminError(INSUFFICIENT, 403)

  const result = await updatePost(id, parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDuplicatePost(session: Session, id: string) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const existing = await getPost(id)
  if (
    !existing.success ||
    !(await canPost(session!.user.id, existing.data.type, "create")) ||
    !(await canEditPost(session!.user.id, id))
  ) {
    return adminError(INSUFFICIENT, 403)
  }

  const result = await duplicatePost(id, session!.user.id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleDeletePost(session: Session, id: string) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const existing = await getPost(id)
  if (!existing.success) return adminError(existing.error.message, 404)
  if (!(await canPost(session!.user.id, existing.data.type, "delete"))) return adminError(INSUFFICIENT, 403)

  const result = await deletePost(id)
  return result.success ? adminSuccess(null, result.message) : mapServiceError(result)
}

// ---------------------------------------------------------------------------
// Bulk handlers
// ---------------------------------------------------------------------------

export async function handleBulkDeletePosts(session: Session, ids: string[]) {
  const perm = await guardBulkPost(session, ids, "delete")
  if (perm) return perm
  const result = await bulkDeletePosts(ids)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkPublishPosts(session: Session, ids: string[]) {
  const perm = await guardBulkPost(session, ids, "publish")
  if (perm) return perm
  const result = await bulkPublishPosts(ids)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkUnpublishPosts(session: Session, ids: string[]) {
  const perm = await guardBulkPost(session, ids, "unpublish")
  if (perm) return perm
  const result = await bulkUnpublishPosts(ids)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkDuplicatePosts(session: Session, ids: string[]) {
  const unauth = requireAuth(session)
  if (unauth) return unauth
  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return adminError(parsedIds.message, 400)

  const allowed = await Promise.all(
    parsedIds.ids.map(async (id) => {
      const post = await getPost(id)
      return (
        post.success &&
        (await canPost(session!.user.id, post.data.type, "create")) &&
        (await canEditPost(session!.user.id, id))
      )
    }),
  )
  if (!allowed.every(Boolean)) return adminError(INSUFFICIENT, 403)

  const result = await bulkDuplicatePosts(parsedIds.ids, session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}
