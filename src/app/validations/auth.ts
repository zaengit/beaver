import { z } from "zod"
import { ulidRegex } from "@zbeaver/beaver/app/validations/shared"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  roleId: z
    .string()
    .regex(ulidRegex, "Invalid role ID format")
    .optional(),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
})

// Inferred types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
