/**
 * Shared Zod schemas reused across validation modules.
 *
 * Previously each validation file re-defined its own `emptyToNull`, `imageSchema`,
 * etc. Centralising them here removes duplication.
 */

import { z } from "zod"

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

/** ULID: 26 characters, Crockford Base32 (uppercase excluding I, L, O, U + digits). */
export const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/

/** Slug: lowercase alphanumeric separated by single hyphens. */
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ---------------------------------------------------------------------------
// Field-level schemas
// ---------------------------------------------------------------------------

/** Transforms empty strings to `null` for optional text fields (Req 9.9). */
export const emptyToNull = z
  .string()
  .max(10_000, "Text must be at most 10000 characters")
  .transform((val) => (val.trim() === "" ? null : val))
  .nullable()
  .optional()

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"])

export function isSafeHref(value: string) {
  const candidate = value.trim()
  if (!candidate || /[\u0000-\u001f\u007f\\]/.test(candidate) || candidate.startsWith("//")) return false
  if (candidate.startsWith("/") || candidate.startsWith("#") || candidate.startsWith("?")) return true

  try {
    return SAFE_SCHEMES.has(new URL(candidate).protocol)
  } catch {
    return false
  }
}

export const safeHrefSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(2048, "URL must be at most 2048 characters")
  .refine(isSafeHref, "URL must be a relative path or use http, https, mailto, or tel")

export const safeImageUrlSchema = z
  .string()
  .trim()
  .max(2048, "Image URL must be at most 2048 characters")
  .refine((value) => {
    if (/^https?:\/\//i.test(value)) {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol)
      } catch {
        return false
      }
    }
    return value.startsWith("/") && !value.startsWith("//") && !/[\u0000-\u001f\u007f\\]/.test(value)
  }, "Image must be a valid http/https URL or a relative path starting with /")

const imageUrlSchema = safeImageUrlSchema.nullable().optional()

/** Featured image field — empty → null, then piped through `imageUrlSchema`. */
export const featuredImageSchema = z
  .string()
  .transform((val) => (val.trim() === "" ? null : val))
  .nullable()
  .optional()
  .pipe(imageUrlSchema)

/** Gallery image item — empty → null, then piped through `imageUrlSchema`. */
export const galleryImageSchema = z
  .string()
  .transform((val) => (val.trim() === "" ? null : val))
  .nullable()
  .optional()
  .pipe(imageUrlSchema)

/** Simple image field (categories, etc.) that accepts full URLs or relative paths. */
export const imageUrlSimpleSchema = z
  .string()
  .transform((val) => (val.trim() === "" ? null : val))
  .nullable()
  .optional()
  .pipe(
    z
      .string()
      .refine((val) => safeImageUrlSchema.safeParse(val).success, "Image must be a valid http/https URL or a relative path starting with /")
      .nullable()
      .optional(),
  )

// ---------------------------------------------------------------------------
// Enum helpers
// ---------------------------------------------------------------------------

export const publishStatusEnum = z.enum(["draft", "published"])
