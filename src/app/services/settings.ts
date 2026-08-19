import { getAllSettingsRecords, upsertSettingRecord } from "@zaenpm/beaver/app/repositories/settings"
import { SETTING_KEYS } from "@zaenpm/beaver/app/models/setting"
import type {
  SiteSettings,
  UpdateSettingsInput,
  SettingRow,
} from "@zaenpm/beaver/app/models/setting"
import type { ServiceResult } from "@zaenpm/beaver/pkg/types"
import { serviceSuccess } from "@zaenpm/beaver/app/services/utils"
import { getCachedPublicData, invalidatePublicDataCache } from "@zaenpm/beaver/app/cache/public-data-cache"

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SiteSettings = {
  title: "My CMS",
  description: "A content management system",
  meta_title: "My CMS - Home",
  meta_description: "Welcome to My CMS",
  maintenance_mode: false,
  timezone: "UTC",
  logo: "",
  favicon: "",
  links: [],
  open_hours: [],
  custom_css: "",
  custom_javascript: "",
  translate_countries: [],
  email_notifications: [],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSetting<T>(record: SettingRow | undefined, fallback: T, parser: (raw: string) => T): T {
  if (!record || record.value === "" || record.value === null) return fallback
  try {
    return parser(record.value)
  } catch {
    return fallback
  }
}

function parseJsonSetting<T>(record: SettingRow | undefined, fallback: T): T {
  return parseSetting(record, fallback, (raw) => JSON.parse(raw) as T)
}

function parseBooleanSetting(record: SettingRow | undefined, fallback: boolean): boolean {
  return parseSetting(record, fallback, (raw) => raw === "true" || raw === "1")
}

function parseStringSetting(record: SettingRow | undefined, fallback: string): string {
  return parseSetting(record, fallback, (raw) => raw)
}

function parseStringArraySetting(record: SettingRow | undefined, fallback: string[]): string[] {
  return parseSetting(record, fallback, (raw) => {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.every((value) => typeof value === "string") ? parsed : fallback
  })
}

// ─── Get All Settings (typed) ────────────────────────────────────────────────

export function getSiteSettings(): SiteSettings {
  return getCachedPublicData("site-settings", () => {
    const records = getAllSettingsRecords()
    const map = new Map(records.map((r) => [r.key, r] as const))

    return {
    title: parseStringSetting(map.get(SETTING_KEYS.TITLE), DEFAULT_SETTINGS.title),
    description: parseStringSetting(map.get(SETTING_KEYS.DESCRIPTION), DEFAULT_SETTINGS.description),
    meta_title: parseStringSetting(map.get(SETTING_KEYS.META_TITLE), DEFAULT_SETTINGS.meta_title),
    meta_description: parseStringSetting(map.get(SETTING_KEYS.META_DESCRIPTION), DEFAULT_SETTINGS.meta_description),
    maintenance_mode: parseBooleanSetting(map.get(SETTING_KEYS.MAINTENANCE_MODE), DEFAULT_SETTINGS.maintenance_mode),
    timezone: parseStringSetting(map.get(SETTING_KEYS.TIMEZONE), DEFAULT_SETTINGS.timezone),
    logo: parseStringSetting(map.get(SETTING_KEYS.LOGO), DEFAULT_SETTINGS.logo),
    favicon: parseStringSetting(map.get(SETTING_KEYS.FAVICON), DEFAULT_SETTINGS.favicon),
    links: parseJsonSetting(map.get(SETTING_KEYS.LINKS), DEFAULT_SETTINGS.links),
    open_hours: parseJsonSetting(map.get(SETTING_KEYS.OPEN_HOURS), DEFAULT_SETTINGS.open_hours),
    custom_css: parseStringSetting(map.get(SETTING_KEYS.CUSTOM_CSS), DEFAULT_SETTINGS.custom_css),
    custom_javascript: parseStringSetting(map.get(SETTING_KEYS.CUSTOM_JAVASCRIPT), DEFAULT_SETTINGS.custom_javascript),
    translate_countries: parseStringArraySetting(map.get(SETTING_KEYS.TRANSLATE_COUNTRIES), DEFAULT_SETTINGS.translate_countries),
    email_notifications: parseStringArraySetting(map.get(SETTING_KEYS.EMAIL_NOTIFICATIONS), DEFAULT_SETTINGS.email_notifications),
    }
  })
}

// ─── Update Settings ─────────────────────────────────────────────────────────

export function updateSiteSettings(
  data: UpdateSettingsInput,
): ServiceResult<SiteSettings> {
  const upserts: Array<{ key: string; value: string }> = []

  if (data.title !== undefined) {
    upserts.push({ key: SETTING_KEYS.TITLE, value: data.title })
  }
  if (data.description !== undefined) {
    upserts.push({ key: SETTING_KEYS.DESCRIPTION, value: data.description })
  }
  if (data.meta_title !== undefined) {
    upserts.push({ key: SETTING_KEYS.META_TITLE, value: data.meta_title })
  }
  if (data.meta_description !== undefined) {
    upserts.push({ key: SETTING_KEYS.META_DESCRIPTION, value: data.meta_description })
  }
  if (data.maintenance_mode !== undefined) {
    upserts.push({ key: SETTING_KEYS.MAINTENANCE_MODE, value: String(data.maintenance_mode) })
  }
  if (data.timezone !== undefined) {
    upserts.push({ key: SETTING_KEYS.TIMEZONE, value: data.timezone })
  }
  if (data.logo !== undefined) {
    upserts.push({ key: SETTING_KEYS.LOGO, value: data.logo })
  }
  if (data.favicon !== undefined) {
    upserts.push({ key: SETTING_KEYS.FAVICON, value: data.favicon })
  }
  if (data.links !== undefined) {
    upserts.push({ key: SETTING_KEYS.LINKS, value: JSON.stringify(data.links) })
  }
  if (data.open_hours !== undefined) {
    upserts.push({ key: SETTING_KEYS.OPEN_HOURS, value: JSON.stringify(data.open_hours) })
  }
  if (data.custom_css !== undefined) {
    upserts.push({ key: SETTING_KEYS.CUSTOM_CSS, value: data.custom_css })
  }
  if (data.custom_javascript !== undefined) {
    upserts.push({ key: SETTING_KEYS.CUSTOM_JAVASCRIPT, value: data.custom_javascript })
  }
  if (data.translate_countries !== undefined) {
    upserts.push({
      key: SETTING_KEYS.TRANSLATE_COUNTRIES,
      value: JSON.stringify(data.translate_countries),
    })
  }
  if (data.email_notifications !== undefined) {
    const emails = data.email_notifications
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    upserts.push({
      key: SETTING_KEYS.EMAIL_NOTIFICATIONS,
      value: JSON.stringify(emails),
    })
  }

  if (upserts.length === 0) {
    return serviceSuccess(getSiteSettings(), "No settings to update.")
  }

  for (const { key, value } of upserts) {
    upsertSettingRecord(key, value)
  }

  invalidatePublicDataCache()
  return serviceSuccess(getSiteSettings(), "Settings updated successfully.")
}
