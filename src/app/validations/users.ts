import { z } from "zod"

// Super Admin is environment-managed and must never be persisted in users.
const roleSchema = z.enum(["admin", "editor", "author"], { error: "Invalid role." })

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().max(254, "Email is too long").email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be at most 128 characters"),
  role: roleSchema.default("author"),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  email: z.string().max(254, "Email is too long").email("Invalid email address").optional(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be at most 128 characters")
    .optional(),
  role: roleSchema.optional(),
})

// Inferred types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
