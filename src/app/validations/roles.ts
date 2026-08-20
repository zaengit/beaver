import { z } from "zod"
import { ulidRegex, slugRegex, emptyToNull } from "@zbeaver/beaver/app/validations/shared"

export const createRoleSchema = z.object({
  // Required: non-empty, max 100 characters
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),

  // Optional: auto-generated from name if not provided; lowercase alphanumeric + hyphens
  slug: z
    .string()
    .regex(slugRegex, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),

  // Optional: empty → null transform (Req 9.9)
  description: emptyToNull,

  // Required: array of ULID strings (permission IDs)
  permissionIds: z
    .array(z.string().regex(ulidRegex, "Invalid permission ID format"))
    .min(1, "At least one permission is required"),
})

export const updateRoleSchema = z.object({
  // Optional: non-empty if provided, max 100 characters
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .optional(),

  // Optional: empty → null transform (Req 9.9)
  description: emptyToNull,

  // Optional: array of ULID strings (permission IDs)
  permissionIds: z
    .array(z.string().regex(ulidRegex, "Invalid permission ID format"))
    .optional(),
})

export const assignRoleSchema = z.object({
  // Required: valid ULID
  userId: z.string().regex(ulidRegex, "Invalid user ID format"),

  // Required: valid ULID
  roleId: z.string().regex(ulidRegex, "Invalid role ID format"),
})

// Inferred types
export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type AssignRoleInput = z.infer<typeof assignRoleSchema>
