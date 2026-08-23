import { generateId, getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"
import type { UpdateMediaInput, UploadMediaInput } from "@zbeaver/beaver/app/validations/media"
import {
  findMediaByIdRecord,
  listMediaRecords,
  createMediaRecord as repoCreateMedia,
  updateMediaRecord,
  deleteMediaRecord,
  type MediaRow,
} from "@zbeaver/beaver/app/repositories/media"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { serviceSuccess, serviceNotFound } from "@zbeaver/beaver/app/services/utils"
import {
  MAX_FILE_SIZE,
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_DIMENSION,
  ALLOWED_MIME_TYPES,
  isImageMimeType,
  generateMediaPath,
  generateThumbnailPath,
  getExtensionFromMimeType,
} from "@zbeaver/beaver/pkg/media/media"
import sharp from "sharp"
import { writeStorageFile } from "@zbeaver/beaver/pkg/storage/storage"

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
  const hasSignature =
    mimeType === "image/jpeg" && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
    || mimeType === "image/png" && buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))
    || mimeType === "image/gif" && buffer.subarray(0, 4).toString("ascii") === "GIF8"
    || mimeType === "image/webp" && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP"
    || mimeType === "application/pdf" && buffer.subarray(0, 5).toString("ascii") === "%PDF-"
    || mimeType === "video/mp4" && buffer.subarray(4, 8).toString("ascii") === "ftyp"
    || mimeType === "audio/mpeg" && (buffer.subarray(0, 3).toString("ascii") === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0))

  if (!hasSignature) return { valid: false, error: "The uploaded file content does not match its type." }

  if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)) {
    try {
      const metadata = await sharp(buffer, { failOn: "error", limitInputPixels: MAX_IMAGE_PIXELS }).metadata()
      if (!metadata.format || !metadata.width || !metadata.height) return { valid: false, error: "The uploaded image is invalid." }
      if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
        return { valid: false, error: "The uploaded image dimensions are too large." }
      }
      if (metadata.pages && metadata.pages > 100) return { valid: false, error: "The uploaded image has too many frames." }
    } catch {
      return { valid: false, error: "The uploaded image is invalid." }
    }
  }

  return { valid: true }
}

// ─── List Media ─────────────────────────────────────────────────────────────

export async function listMediaService(filters: {
  page?: number
  perPage?: number
  search?: string
  folder?: string | null
  mimeType?: string
} = {}): Promise<ServiceResult<unknown>> {
  const result = await listMediaRecords(filters)
  return serviceSuccess(result, "OK")
}

// ─── Get Media ──────────────────────────────────────────────────────────────

export async function getMedia(id: string): Promise<ServiceResult<MediaRow>> {
  const item = await findMediaByIdRecord(id)
  if (!item) return serviceNotFound("Media")
  return serviceSuccess(item, "OK")
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

  const fileCheck = validateFile(file)
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
  )

  return await createMediaRecord({
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

async function createMediaRecord(params: {
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
}): Promise<ServiceResult<MediaRow>> {
  const id = params.id ?? generateId()
  const now = getCurrentTimestamp()

  const record = await repoCreateMedia({
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

export async function updateMedia(id: string, data: UpdateMediaInput): Promise<ServiceResult<MediaRow>> {
  const existing = await findMediaByIdRecord(id)
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

  const updated = await updateMediaRecord(id, updateData)
  if (!updated) return serviceNotFound("Media")

  return serviceSuccess(updated, "Media updated.")
}

// ─── Delete Media ───────────────────────────────────────────────────────────

export async function deleteMedia(id: string): Promise<ServiceResult<null>> {
  const existing = await findMediaByIdRecord(id)
  if (!existing) return serviceNotFound("Media")

  await deleteMediaRecord(id)
  return serviceSuccess(null, "Media deleted.")
}

// ─── Process Uploaded File ─────────────────────────────────────────────────

interface ProcessedFile {
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
}

/**
 * Writes a file buffer to disk and optionally generates a thumbnail for images.
 */
async function processUploadedFile(
  buffer: Buffer,
  mimeType: string,
  id?: string,
): Promise<ProcessedFile & { id: string }> {
  const fileId = id ?? generateId()
  const extension = getExtensionFromMimeType(mimeType)
  const relativePath = generateMediaPath(fileId, extension)
  await writeStorageFile(relativePath, buffer)

  let width: number | null = null
  let height: number | null = null
  let thumbnailUrl: string | null = null

  if (isImageMimeType(mimeType) && mimeType !== "image/svg+xml") {
    try {
      const metadata = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata()
      width = metadata.width ?? null
      height = metadata.height ?? null

      const thumbRelativePath = generateThumbnailPath(fileId)
      const thumbnail = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS })
        .resize(300, 300, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer()
      await writeStorageFile(thumbRelativePath, thumbnail)

      if (mimeType !== "image/gif") {
        await Promise.all(
          [640, 1280]
            .filter((responsiveWidth) => width !== null && width > responsiveWidth)
            .map(async (responsiveWidth) => {
              const variant = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS })
                .resize({ width: responsiveWidth, withoutEnlargement: true })
                .webp({ quality: 82 })
                .toBuffer()
              await writeStorageFile(relativePath.replace(/\.[^.]+$/, `_w${responsiveWidth}.webp`), variant)
            }),
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
