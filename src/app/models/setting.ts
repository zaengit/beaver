import type { settings } from "@zaenpm/beaver/app/db/schema"

export const TABLE = "settings" as const

export type SettingRow = typeof settings.$inferSelect
export type SettingInsert = typeof settings.$inferInsert

// ─── Typed Setting Keys ─────────────────────────────────────────────────────

export const SETTING_KEYS = {
  TITLE: "title",
  DESCRIPTION: "description",
  META_TITLE: "meta_title",
  META_DESCRIPTION: "meta_description",
  MAINTENANCE_MODE: "maintenance_mode",
  TIMEZONE: "timezone",
  LOGO: "logo",
  FAVICON: "favicon",
  LINKS: "links",
  OPEN_HOURS: "open_hours",
  CUSTOM_CSS: "custom_css",
  CUSTOM_JAVASCRIPT: "custom_javascript",
  TRANSLATE_COUNTRIES: "translate_countries",
  EMAIL_NOTIFICATIONS: "email_notifications",
} as const

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS]

// ─── Typed Setting Values ───────────────────────────────────────────────────

export interface SocialLink {
  platform: string
  url: string
  icon?: string
}

export interface OpenHours {
  day: string
  open: string
  close: string
}

export interface SiteSettings {
  title: string
  description: string
  meta_title: string
  meta_description: string
  maintenance_mode: boolean
  timezone: string
  logo: string
  favicon: string
  links: SocialLink[]
  open_hours: OpenHours[]
  custom_css: string
  custom_javascript: string
  translate_countries: string[]
  email_notifications: string[]
}

// ─── Update Input Types ─────────────────────────────────────────────────────

export interface UpdateSettingsInput {
  title?: string
  description?: string
  meta_title?: string
  meta_description?: string
  maintenance_mode?: boolean
  timezone?: string
  logo?: string
  favicon?: string
  links?: SocialLink[]
  open_hours?: OpenHours[]
  custom_css?: string
  custom_javascript?: string
  translate_countries?: string[]
  email_notifications?: string
}
