import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().max(254, "Email is too long").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
})
