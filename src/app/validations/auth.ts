import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().max(254, "Email is too long").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
})

export const twoFactorCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Authenticator code must be 6 digits."),
})

export const disableTwoFactorSchema = twoFactorCodeSchema.extend({
  password: z.string().min(1, "Current password is required.").max(128, "Password is too long."),
})
