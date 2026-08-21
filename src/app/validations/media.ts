import { z } from "zod"
import { emptyToNull } from "@zbeaver/beaver/app/validations/shared"

/**
 * Schema for metadata sent alongside file upload (Req 21).
 * File validation (size, mime type) is handled by src/lib/media.ts helpers, not here.
 */
export const uploadMediaSchema = z.object({
  // Optional display name (defaults to filename at the service layer)
  name: z.string().trim().max(255, "Name must be at most 255 characters").optional(),

  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull.pipe(z.string().max(500).nullable().optional()),

  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull.pipe(z.string().max(2000).nullable().optional()),

  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull.pipe(z.string().max(255).nullable().optional()),
})

/**
 * Schema for updating media metadata (Req 21.4).
 * Name must be at least 1 character if provided.
 */
export const updateMediaSchema = z.object({
  // Optional name, but must be non-empty if provided
  name: z.string().trim().min(1, "Name must not be empty").max(255, "Name must be at most 255 characters").optional(),

  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull.pipe(z.string().max(500).nullable().optional()),

  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull.pipe(z.string().max(2000).nullable().optional()),

  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull.pipe(z.string().max(255).nullable().optional()),
})

// Inferred types
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>
