import { unlink } from "fs/promises"
import path from "path"

import { adminError, adminSuccess } from "zadm/app/admin/api-response"
import { mapServiceError } from "zadm/app/handlers/error-mapper"
import { requirePermission } from "zadm/app/handlers/guard"
import { parseWithSchema } from "zadm/app/handlers/utils"
import type { Session } from "zadm/app/handlers/types"
import { getUploadDir } from "zadm/pkg/media/media"
import {
  deleteMedia as deleteMediaService,
  getMedia,
  listMediaService,
  uploadMediaForUser,
  updateMedia,
} from "zadm/app/services/media"
import { updateMediaSchema, uploadMediaSchema } from "zadm/app/validations/media"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function deleteFileIfExists(fileUrl: string | null) {
  if (!fileUrl) return
  try {
    const filePath = path.join(getUploadDir(), fileUrl.replace(/^\//, ""))
    await unlink(filePath)
  } catch {
    // Non-fatal cleanup failure.
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export function handleListMedia(filters: {
  page?: number
  perPage?: number
  search?: string
  folder?: string | null
  mimeType?: string
}) {
  const result = listMediaService(filters)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export function handleGetMedia(id: string) {
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

  if (ids.length === 0) return adminError("At least one media id is required.", 400)

  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
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

  const metadata: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (key !== "file") metadata[key] = value
  }

  const parsed = parseWithSchema(uploadMediaSchema, metadata)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await uploadMediaForUser(formData, session!.user.id, parsed.data)
  return result.success ? adminSuccess(result.data, "Media uploaded.") : mapServiceError(result)
}
