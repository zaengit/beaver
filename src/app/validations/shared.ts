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
  .transform((val) => (val.trim() === "" ? null : val))
  .nullable()
  .optional()

/** Image URL: valid http/https URL or relative path starting with `/`. */
export const imageUrlSchema = z
  .string()
  .max(2048, "Image URL must be at most 2048 characters")
  .refine(
    (val) => {
      if (val.startsWith("http://") || val.startsWith("https://")) {
        return z.string().url().safeParse(val).success
      }
      return val.startsWith("/")
    },
    "Image must be a valid URL (http/https) or a relative path starting with /",
  )
  .nullable()
  .optional()

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

/** Simple image field (categories, etc.) that only accepts full URLs. */
export const imageUrlSimpleSchema = z
  .string()
  .transform((val) => (val.trim() === "" ? null : val))
  .nullable()
  .optional()
  .pipe(
    z
      .string()
      .url("Image must be a valid URL")
      .nullable()
      .optional(),
  )

// ---------------------------------------------------------------------------
// Enum helpers
// ---------------------------------------------------------------------------

export const publishStatusEnum = z.enum(["draft", "published"])