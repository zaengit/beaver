import { unlink } from "fs/promises"
import path from "path"

import { adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { requirePermission } from "@zbeaver/beaver/app/handlers/guard"
import { parseBulkIds, parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { getUploadDir } from "@zbeaver/beaver/pkg/media/media"
import {
  deleteMedia as deleteMediaService,
  getMedia,
  listMediaService,
  uploadMediaForUser,
  updateMedia,
} from "@zbeaver/beaver/app/services/media"
import { updateMediaSchema, uploadMediaSchema } from "@zbeaver/beaver/app/validations/media"
import { isWithinRateLimit } from "@zbeaver/beaver/app/security/rate-limit"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function deleteFileIfExists(fileUrl: string | null) {
  if (!fileUrl) return
  try {
    const relativePath = fileUrl.replace(/^\/+/, "")
    const match = relativePath.match(/^storage\/([A-Za-z0-9_-]+?)(?:_(thumb|w640|w1280))?\.[A-Za-z0-9]+$/)
    if (!match) return
    const uploadRoot = path.resolve(getUploadDir())
    const fileId = match[1]
    const candidates = new Set([
      relativePath,
      `storage/${fileId}_thumb.webp`,
      `storage/${fileId}_w640.webp`,
      `storage/${fileId}_w1280.webp`,
    ])
    for (const candidate of candidates) {
      const filePath = path.resolve(uploadRoot, candidate)
      if (filePath === uploadRoot || !filePath.startsWith(`${uploadRoot}${path.sep}`)) continue
      try {
        await unlink(filePath)
      } catch {
        // A missing derivative is not a deletion failure.
      }
    }
  } catch {
    // Non-fatal cleanup failure.
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleListMedia(session: Session, filters: {
  page?: number
  perPage?: number
  search?: string
  folder?: string | null
  mimeType?: string
}) {
  const perm = await requirePermission(session, "media.view")
  if (perm) return perm

  const result = listMediaService(filters)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleGetMedia(session: Session, id: string) {
  const perm = await requirePermission(session, "media.view")
  if (perm) return perm

  if (!id) return adminError("Media id is required.", 400)
  const result = getMedia(id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404)
}

export async function handleUpdateMedia(session: Session, id: string, body: unknown) {
  if (!id) return adminError("Media id is required.", 400)

  const perm = await requirePermission(session, "media.edit")
  if (perm) return perm

  const parsed = parseWithSchema(updateMediaSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = updateMedia(id, parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDeleteMedia(session: Session, id: string) {
  if (!id) return adminError("Media id is required.", 400)

  const perm = await requirePermission(session, "media.delete")
  if (perm) return perm

  const mediaResult = getMedia(id)
  if (!mediaResult.success) return adminError(mediaResult.error.message, 404)

  const result = deleteMediaService(id)
  if (!result.success) return mapServiceError(result)

  await deleteFileIfExists(mediaResult.data.url)
  await deleteFileIfExists(mediaResult.data.thumbnailUrl)
  return adminSuccess(result.data, result.message)
}

export async function handleBulkDeleteMedia(session: Session, ids: string[]) {
  const perm = await requirePermission(session, "media.delete")
  if (perm) return perm

  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return adminError(parsedIds.message, 400)

  const results: { id: string; success: boolean }[] = []
  for (const id of parsedIds.ids) {
    const mediaResult = getMedia(id)
    if (!mediaResult.success) {
      results.push({ id, success: false })
      continue
    }
    const deleteResult = deleteMediaService(id)
    results.push({ id, success: deleteResult.success })
    if (deleteResult.success) {
      await deleteFileIfExists(mediaResult.data.url)
      await deleteFileIfExists(mediaResult.data.thumbnailUrl)
    }
  }
  return adminSuccess(results, "Bulk delete completed.")
}

export async function handleUploadMedia(session: Session, formData: FormData) {
  const perm = await requirePermission(session, "media.upload")
  if (perm) return perm
  if (!isWithinRateLimit(`media-upload:user:${session!.user.id}`, 20, 15 * 60 * 1000)) {
    return adminError("Too many uploads. Please try again later.", 429)
  }

  const metadata: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key !== "file") metadata[key] = value
  }

  const parsed = parseWithSchema(uploadMediaSchema, metadata)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await uploadMediaForUser(formData, session!.user.id, parsed.data)
  return result.success ? adminSuccess(result.data, "Media uploaded.") : mapServiceError(result)
}
