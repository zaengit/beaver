import { z } from "zod"
import {
  emptyToNull,
  imageUrlSimpleSchema,
  publishStatusEnum,
  slugRegex,
} from "@zbeaver/beaver/app/validations/shared"

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),

  type: z.string().min(1).max(64).regex(slugRegex, "Type must contain only lowercase alphanumeric characters and hyphens").default("post"),
  status: publishStatusEnum.default("published"),

  description: emptyToNull,
  image: imageUrlSimpleSchema,
})

// Update schema: all fields optional (partial update)
export const updateCategorySchema = createCategorySchema.partial()

// Inferred types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
