import { describe, it, expect, afterEach } from "vitest"
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  validateFileSize,
  validateMimeType,
  isImageMimeType,
  generateMediaPath,
  generateThumbnailPath,
  getExtensionFromMimeType,
  getUploadDir,
} from "./media"

describe("MAX_FILE_SIZE", () => {
  it("equals 10MB in bytes", () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })
})

describe("ALLOWED_MIME_TYPES", () => {
  it("contains all required mime types", () => {
    expect(ALLOWED_MIME_TYPES).toContain("image/jpeg")
    expect(ALLOWED_MIME_TYPES).toContain("image/png")
    expect(ALLOWED_MIME_TYPES).toContain("image/gif")
    expect(ALLOWED_MIME_TYPES).toContain("image/webp")
    expect(ALLOWED_MIME_TYPES).not.toContain("image/svg+xml")
    expect(ALLOWED_MIME_TYPES).toContain("application/pdf")
    expect(ALLOWED_MIME_TYPES).toContain("video/mp4")
    expect(ALLOWED_MIME_TYPES).toContain("audio/mpeg")
  })

  it("excludes SVG uploads to prevent stored script execution", () => {
    expect(ALLOWED_MIME_TYPES).toHaveLength(7)
  })
})

describe("validateFileSize", () => {
  it("returns true for size equal to MAX_FILE_SIZE", () => {
    expect(validateFileSize(MAX_FILE_SIZE)).toBe(true)
  })

  it("returns true for size less than MAX_FILE_SIZE", () => {
    expect(validateFileSize(0)).toBe(true)
    expect(validateFileSize(1024)).toBe(true)
    expect(validateFileSize(MAX_FILE_SIZE - 1)).toBe(true)
  })

  it("returns false for size greater than MAX_FILE_SIZE", () => {
    expect(validateFileSize(MAX_FILE_SIZE + 1)).toBe(false)
    expect(validateFileSize(20 * 1024 * 1024)).toBe(false)
  })
})

describe("validateMimeType", () => {
  it("returns true for all allowed mime types", () => {
    for (const mime of ALLOWED_MIME_TYPES) {
      expect(validateMimeType(mime)).toBe(true)
    }
  })

  it("returns false for disallowed mime types", () => {
    expect(validateMimeType("text/plain")).toBe(false)
    expect(validateMimeType("application/json")).toBe(false)
    expect(validateMimeType("video/avi")).toBe(false)
    expect(validateMimeType("")).toBe(false)
  })
})

describe("isImageMimeType", () => {
  it("returns true for image mime types", () => {
    expect(isImageMimeType("image/jpeg")).toBe(true)
    expect(isImageMimeType("image/png")).toBe(true)
    expect(isImageMimeType("image/gif")).toBe(true)
    expect(isImageMimeType("image/webp")).toBe(true)
    expect(isImageMimeType("image/svg+xml")).toBe(true)
    expect(isImageMimeType("image/bmp")).toBe(true)
  })

  it("returns false for non-image mime types", () => {
    expect(isImageMimeType("application/pdf")).toBe(false)
    expect(isImageMimeType("video/mp4")).toBe(false)
    expect(isImageMimeType("audio/mpeg")).toBe(false)
    expect(isImageMimeType("text/plain")).toBe(false)
    expect(isImageMimeType("")).toBe(false)
  })
})

describe("generateMediaPath", () => {
  it("generates a flat storage path", () => {
    const path = generateMediaPath("abc123", "jpg")
    expect(path).toBe("storage/abc123.jpg")
  })
})

describe("generateThumbnailPath", () => {
  it("generates a flat storage thumbnail path", () => {
    const path = generateThumbnailPath("abc123")
    expect(path).toBe("storage/abc123_thumb.webp")
  })
})

describe("getExtensionFromMimeType", () => {
  it("maps image/jpeg to jpg", () => {
    expect(getExtensionFromMimeType("image/jpeg")).toBe("jpg")
  })

  it("maps image/png to png", () => {
    expect(getExtensionFromMimeType("image/png")).toBe("png")
  })

  it("maps image/gif to gif", () => {
    expect(getExtensionFromMimeType("image/gif")).toBe("gif")
  })

  it("maps image/webp to webp", () => {
    expect(getExtensionFromMimeType("image/webp")).toBe("webp")
  })

  it("does not map SVG because SVG uploads are blocked", () => {
    expect(getExtensionFromMimeType("image/svg+xml")).toBe("")
  })

  it("maps application/pdf to pdf", () => {
    expect(getExtensionFromMimeType("application/pdf")).toBe("pdf")
  })

  it("maps video/mp4 to mp4", () => {
    expect(getExtensionFromMimeType("video/mp4")).toBe("mp4")
  })

  it("maps audio/mpeg to mp3", () => {
    expect(getExtensionFromMimeType("audio/mpeg")).toBe("mp3")
  })

  it("returns empty string for unknown mime types", () => {
    expect(getExtensionFromMimeType("text/plain")).toBe("")
    expect(getExtensionFromMimeType("unknown")).toBe("")
  })
})

describe("getUploadDir", () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
  })

  it("returns UPLOAD_DIR public root when set", () => {
    process.env = { ...originalEnv, UPLOAD_DIR: "/custom/public" }
    expect(getUploadDir()).toBe("/custom/public")
  })

  it("returns default ./public when UPLOAD_DIR is not set", () => {
    process.env = { ...originalEnv }
    delete process.env.UPLOAD_DIR
    expect(getUploadDir()).toBe("./public")
  })
})
