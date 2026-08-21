import { z } from "zod"
import { ulidRegex } from "@zbeaver/beaver/app/validations/shared"

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
  roleId: z
    .string()
    .regex(ulidRegex, "Invalid role ID format")
    .optional(),
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
  roleId: z
    .string()
    .regex(ulidRegex, "Invalid role ID format")
    .nullable()
    .optional(),
})

// Inferred types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
