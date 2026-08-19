import { z } from "zod"
import {
  ulidRegex,
  slugRegex,
  emptyToNull,
  featuredImageSchema,
  galleryImageSchema,
  publishStatusEnum,
} from "@zaenpm/beaver/app/validations/shared"

// Section object schema - embedded full section data (Req 20.2)
const sectionSchema = z.object({
  id: z.string().min(1, "Section id is required"),
  type: z.string().min(1, "Section type is required"),
  caption: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  alt_image: z.string().nullable().optional(),
  bg_color: z.string().nullable().optional(),
  bg_image: z.string().nullable().optional(),
  style_css: z.string().nullable().optional(),
  style_css_inline: z.string().nullable().optional(),
  style_id: z.string().nullable().optional(),
  alignment: z.string().nullable().optional(),
  limit: z.number().int().min(0).nullable().optional(),
  sort: z.number().int().min(0).optional(),
  sort_by: z.string().nullable().optional(),
  sort_order: z.enum(["asc", "desc"]).nullable().optional(),
  category: z.string().nullable().optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).nullable().optional(),
  item: z.array(
    z.object({
      caption: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      text: z.string().nullable().optional(),
      image: z.string().nullable().optional(),
      alt_image: z.string().nullable().optional(),
      video: z.string().nullable().optional(),
      map: z.string().nullable().optional(),
      question: z.string().nullable().optional(),
      answer: z.string().nullable().optional(),
      icon: z.string().nullable().optional(),
      form_inquiry: z.boolean().nullable().optional(),
      embed: z.string().nullable().optional(),
      bg_color: z.string().nullable().optional(),
      bg_image: z.string().nullable().optional(),
      links: z.array(z.object({
        label: z.string(),
        url: z.string(),
      })).nullable().optional(),
      style_css: z.string().nullable().optional(),
      style_css_inline: z.string().nullable().optional(),
      style_id: z.string().nullable().optional(),
    })
  ).nullable().optional(),
})

// Tag schema: non-empty string, max 50 chars (Req 20.1)
const tagSchema = z
  .string()
  .min(1, "Tag must not be empty")
  .max(50, "Tag must be at most 50 characters")

export const createPostSchema = z.object({
  // Required
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),

  // Optional with validation
  slug: z
    .string()
    .max(100, "Slug must be at most 100 characters")
    .regex(slugRegex, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),

  type: z.string().default("post"),
  status: publishStatusEnum.default("draft"),
  publishedAt: z.number().int().positive().nullable().optional(),

  // Optional string fields with empty-to-null transform (Req 9.9)
  excerpt: emptyToNull,
  description: z.string().optional(),

  // Tags: array of strings, max 30 items (Req 20.1)
  tags: z
    .array(tagSchema)
    .max(30, "Tags must contain at most 30 items")
    .optional(),

  // Sections: array of objects, max 50 items (Req 20.2)
  sections: z
    .array(sectionSchema)
    .max(50, "Sections must contain at most 50 items")
    .optional(),

  // SEO fields (Req 9.6)
  metaTitle: z
    .string()
    .transform((val) => (val.trim() === "" ? null : val))
    .nullable()
    .optional()
    .pipe(
      z
        .string()
        .max(60, "Meta title must be at most 60 characters")
        .nullable()
        .optional()
    ),

  metaDescription: z
    .string()
    .transform((val) => (val.trim() === "" ? null : val))
    .nullable()
    .optional()
    .pipe(
      z
        .string()
        .max(160, "Meta description must be at most 160 characters")
        .nullable()
        .optional()
    ),

  // Featured image (Req 17.4)
  featuredImage: featuredImageSchema,

  // Gallery images stored as JSON array of URLs
  gallery: z.array(galleryImageSchema).max(20, "Gallery must contain at most 20 images").optional(),

  // Category IDs: array of ULIDs (Req 9.7)
  categoryIds: z
    .array(z.string().regex(ulidRegex, "Invalid category ID format"))
    .optional(),

  // Custom field values: record of arbitrary values (Req 20.3)
  customFieldValues: z.record(z.string(), z.unknown()).optional(),
})

// Update schema: all fields optional (partial update)
export const updatePostSchema = createPostSchema.partial()

// Inferred types
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
