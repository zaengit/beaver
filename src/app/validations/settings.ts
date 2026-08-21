import { z } from "zod"
import { safeHrefSchema, safeImageUrlSchema } from "@zbeaver/beaver/app/validations/shared"

const imageSettingSchema = z.string().trim().max(2048, "Image URL must be at most 2048 characters").refine(
  (value) => value === "" || safeImageUrlSchema.safeParse(value).success,
  "Image must be a valid http/https URL or a relative path starting with /",
).optional()

const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required").max(50, "Platform is too long"),
  url: safeHrefSchema,
  icon: z.string().max(100, "Icon is too long").optional(),
})

const openHoursSchema = z.object({
  day: z.string().min(1, "Day is required").max(20, "Day is too long"),
  open: z.string().min(1, "Open time is required").max(20, "Open time is too long"),
  close: z.string().min(1, "Close time is required").max(20, "Close time is too long"),
})

const emailNotificationListSchema = z.string()
  .max(10_000, "Email list is too long")
  .refine((value) => value.split(",").map((email) => email.trim()).filter(Boolean).every((email) => {
    return email.length <= 254 && !/[\u0000-\u001f\u007f]/.test(email) && z.string().email().safeParse(email).success
  }) && value.split(",").map((email) => email.trim()).filter(Boolean).length <= 100, "Email list contains an invalid address or too many recipients")

export const updateSettingsSchema = z.object({
  title: z.string().max(200, "Title is too long").optional(),
  description: z.string().max(10_000, "Description is too long").optional(),
  meta_title: z.string().max(200, "Meta title is too long").optional(),
  meta_description: z.string().max(10_000, "Meta description is too long").optional(),
  maintenance_mode: z.boolean().optional(),
  timezone: z.string().max(100, "Timezone is too long").optional(),
  logo: imageSettingSchema,
  favicon: imageSettingSchema,
  links: z.array(socialLinkSchema).max(50, "Too many links").optional(),
  open_hours: z.array(openHoursSchema).max(14, "Too many opening-hour entries").optional(),
  custom_css: z.string().max(50_000, "Custom CSS is too long").optional(),
  custom_javascript: z.string().max(50_000, "Custom JavaScript is too long").optional(),
  translate_countries: z.array(z.string().max(10, "Country code is too long")).max(250, "Too many countries").optional(),
  email_notifications: emailNotificationListSchema.optional(),
})
