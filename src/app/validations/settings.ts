import { z } from "zod"

const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url().min(1, "URL is required"),
  icon: z.string().optional(),
})

const openHoursSchema = z.object({
  day: z.string().min(1, "Day is required"),
  open: z.string().min(1, "Open time is required"),
  close: z.string().min(1, "Close time is required"),
})

export const updateSettingsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  maintenance_mode: z.boolean().optional(),
  timezone: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  links: z.array(socialLinkSchema).optional(),
  open_hours: z.array(openHoursSchema).optional(),
  custom_css: z.string().optional(),
  custom_javascript: z.string().optional(),
  translate_countries: z.array(z.string()).optional(),
  email_notifications: z.string().optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>