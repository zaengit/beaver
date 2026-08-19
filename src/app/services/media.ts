import { generateId, getCurrentTimestamp } from "@zaenpm/beaver/pkg/utils/index"
import type { UpdateMediaInput, UploadMediaInput } from "@zaenpm/beaver/app/validations/media"
import {
  findMediaByIdRecord,
  listMediaRecords,
  getMediaFolderRecords,
  createMediaRecord as repoCreateMedia,
  updateMediaRecord,
  deleteMediaRecord,
  type MediaRow,
} from "@zaenpm/beaver/app/repositories/media"
import type { ServiceResult } from "@zaenpm/beaver/pkg/types"
import { serviceSuccess, serviceNotFound } from "@zaenpm/beaver/app/services/utils"
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  isImageMimeType,
  generateMediaPath,
  generateThumbnailPath,
  getExtensionFromMimeType,
  getUploadDir,
} from "@zaenpm/beaver/pkg/media/media"
import sharp from "sharp"
import path from "path"
import fs from "fs"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` }
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { valid: false, error: `File type "${file.type}" is not allowed` }
  }
  return { valid: true }
}

async function validateFileContents(buffer: Buffer, mimeType: string): Promise<{ valid: boolean; error?: string }> {
  if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)) {
    try {
      const metadata = await sharp(buffer, { failOn: "error" }).metadata()
      if (!metadata.format) return { valid: false, error: "The uploaded image is invalid." }
    } catch {
      return { valid: false, error: "The uploaded image is invalid." }
    }
  }

  if (mimeType === "application/pdf" && !buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    return { valid: false, error: "The uploaded PDF is invalid." }
  }

  return { valid: true }
}

// ─── List Media ─────────────────────────────────────────────────────────────

export function listMediaService(filters: {
  page?: number
  perPage?: number
  search?: string
  folder?: string | null
  mimeType?: string
} = {}): ServiceResult<unknown> {
  const result = listMediaRecords(filters)
  return serviceSuccess(result, "OK")
}

// ─── Get Media ──────────────────────────────────────────────────────────────

export function getMedia(id: string): ServiceResult<MediaRow> {
  const item = findMediaByIdRecord(id)
  if (!item) return serviceNotFound("Media")
  return serviceSuccess(item, "OK")
}

// ─── List Folders ───────────────────────────────────────────────────────────

export function listFoldersService(): ServiceResult<string[]> {
  const folders = getMediaFolderRecords()
  return serviceSuccess(folders, "OK")
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  return validateFile(file)
}

export async function uploadMediaForUser(
  formData: FormData,
  userId: string,
  metadata: UploadMediaInput,
): Promise<
  | { success: true; data: MediaRow; message: string }
  | { success: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }
> {
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return { success: false, error: { code: "validation", message: "No file provided." } }
  }

  const fileCheck = validateFileUpload(file)
  if (!fileCheck.valid) {
    return {
      success: false,
      error: { code: "validation", message: fileCheck.error ?? "Invalid file." },
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const contentCheck = await validateFileContents(buffer, file.type)
  if (!contentCheck.valid) {
    return { success: false, error: { code: "validation", message: contentCheck.error ?? "Invalid file." } }
  }

  const fileResult = await processUploadedFile(
    buffer,
    file.type,
    file.name,
  )

  return createMediaRecord({
    id: fileResult.id,
    userId,
    name: metadata.name ?? file.name,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    url: fileResult.url,
    thumbnailUrl: fileResult.thumbnailUrl,
    alt: metadata.alt ?? null,
    caption: metadata.caption ?? null,
    width: fileResult.width,
    height: fileResult.height,
    folder: metadata.folder ?? null,
  })
}

// ─── Create Media Record (after file is saved to disk) ──────────────────────

export function createMediaRecord(params: {
  userId: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string | null
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  folder?: string | null
  id?: string
}): ServiceResult<MediaRow> {
  const id = params.id ?? generateId()
  const now = getCurrentTimestamp()

  const record = repoCreateMedia({
    id,
    userId: params.userId,
    name: params.name || params.fileName,
    fileName: params.fileName,
    mimeType: params.mimeType,
    size: params.size,
    url: params.url,
    thumbnailUrl: params.thumbnailUrl,
    alt: params.alt,
    caption: params.caption,
    width: params.width,
    height: params.height,
    folder: params.folder,
    createdAt: now,
    updatedAt: now,
  })

  return serviceSuccess(record, "Media uploaded.")
}

// ─── Update Media ───────────────────────────────────────────────────────────

export function updateMedia(id: string, data: UpdateMediaInput): ServiceResult<MediaRow> {
  const existing = findMediaByIdRecord(id)
  if (!existing) return serviceNotFound("Media")
  const now = getCurrentTimestamp()

  const updateData: {
    name?: string
    alt?: string | null
    caption?: string | null
    folder?: string | null
    updatedAt: number
  } = { updatedAt: now }

  if (data.name !== undefined) updateData.name = data.name
  if (data.alt !== undefined) updateData.alt = data.alt
  if (data.caption !== undefined) updateData.caption = data.caption
  if (data.folder !== undefined) updateData.folder = data.folder

  const updated = updateMediaRecord(id, updateData)
  if (!updated) return serviceNotFound("Media")

  return serviceSuccess(updated, "Media updated.")
}

// ─── Delete Media ───────────────────────────────────────────────────────────

export function deleteMedia(id: string): ServiceResult<null> {
  const existing = findMediaByIdRecord(id)
  if (!existing) return serviceNotFound("Media")

  deleteMediaRecord(id)
  return serviceSuccess(null, "Media deleted.")
}

// ─── Process Uploaded File ─────────────────────────────────────────────────

export interface ProcessedFile {
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
}

/**
 * Writes a file buffer to disk and optionally generates a thumbnail for images.
 */
export async function processUploadedFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  id?: string,
): Promise<ProcessedFile & { id: string }> {
  const fileId = id ?? generateId()
  const extension = getExtensionFromMimeType(mimeType)
  const relativePath = generateMediaPath(fileId, extension)
  const uploadDir = getUploadDir()
  const absolutePath = path.resolve(uploadDir, relativePath)

  const dir = path.dirname(absolutePath)
  fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(absolutePath, buffer)

  let width: number | null = null
  let height: number | null = null
  let thumbnailUrl: string | null = null

  if (isImageMimeType(mimeType) && mimeType !== "image/svg+xml") {
    try {
      const metadata = await sharp(buffer).metadata()
      width = metadata.width ?? null
      height = metadata.height ?? null

      const thumbRelativePath = generateThumbnailPath(fileId)
      const thumbAbsolutePath = path.resolve(uploadDir, thumbRelativePath)

      await sharp(buffer)
        .resize(300, 300, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(thumbAbsolutePath)

      if (mimeType !== "image/gif") {
        await Promise.all(
          [640, 1280]
            .filter((responsiveWidth) => width !== null && width > responsiveWidth)
            .map((responsiveWidth) => sharp(buffer)
              .resize({ width: responsiveWidth, withoutEnlargement: true })
              .webp({ quality: 82 })
              .toFile(path.resolve(uploadDir, relativePath.replace(/\.[^.]+$/, `_w${responsiveWidth}.webp`)))),
        )
      }

      thumbnailUrl = `/${thumbRelativePath}`
    } catch {
      // If thumbnail generation fails, continue without it
    }
  }

  return {
    id: fileId,
    url: `/${relativePath}`,
    thumbnailUrl,
    width,
    height,
  }
}
