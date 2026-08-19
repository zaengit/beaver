import { z } from "zod"
import { emptyToNull } from "@zaenpm/beaver/app/validations/shared"

/**
 * Schema for metadata sent alongside file upload (Req 21).
 * File validation (size, mime type) is handled by src/lib/media.ts helpers, not here.
 */
export const uploadMediaSchema = z.object({
  // Optional display name (defaults to filename at the service layer)
  name: z.string().optional(),

  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull,

  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull,

  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull,
})

/**
 * Schema for updating media metadata (Req 21.4).
 * Name must be at least 1 character if provided.
 */
export const updateMediaSchema = z.object({
  // Optional name, but must be non-empty if provided
  name: z.string().min(1, "Name must not be empty").optional(),

  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull,

  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull,

  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull,
})

// Inferred types
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>
