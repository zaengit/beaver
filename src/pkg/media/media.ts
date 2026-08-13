/**
 * Media file validation helpers and path generation utilities.
 */

/** Maximum allowed file size: 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Allowed MIME types for media uploads */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "audio/mpeg",
] as const

/** Mapping of MIME types to file extensions */
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
}

/**
 * Validates that a file size is within the allowed limit.
 * @returns true if size <= MAX_FILE_SIZE
 */
export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE
}

/**
 * Validates that a MIME type is in the allowed list.
 * @returns true if mimeType is in ALLOWED_MIME_TYPES
 */
export function validateMimeType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Checks if a MIME type represents an image.
 * @returns true if mimeType starts with "image/"
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

/**
 * Generates the public storage path for a media file.
 * Format: storage/{id}.{ext}
 */
export function generateMediaPath(id: string, extension: string): string {
  return `storage/${id}.${extension}`
}

/**
 * Generates the public storage path for a media thumbnail.
 * Format: storage/{id}_thumb.webp
 */
export function generateThumbnailPath(id: string): string {
  return `storage/${id}_thumb.webp`
}

/**
 * Maps a MIME type to its corresponding file extension.
 * @returns The file extension (without dot), or empty string if unknown
 */
export function getExtensionFromMimeType(mimeType: string): string {
  return MIME_TO_EXTENSION[mimeType] ?? ""
}

/**
 * Returns the public filesystem root from UPLOAD_DIR, or "./public". Generated
 * files always live below its fixed storage path.
 */
export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || "./public"
}
