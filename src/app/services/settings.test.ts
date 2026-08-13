import { describe, it, expect, beforeEach, vi } from "vitest"

const mockGetAllSettingsRecords = vi.fn()
const mockUpsertSettingRecord = vi.fn()
const mockInvalidatePublicDataCache = vi.fn()

vi.mock("zadm/app/repositories/settings", () => ({
  getAllSettingsRecords: mockGetAllSettingsRecords,
  upsertSettingRecord: mockUpsertSettingRecord,
}))

vi.mock("zadm/app/models/setting", () => ({
  SETTING_KEYS: {
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
  },
}))

vi.mock("zadm/app/cache/public-data-cache", () => ({
  getCachedPublicData: (_key: string, fn: () => unknown) => fn(),
  invalidatePublicDataCache: mockInvalidatePublicDataCache,
}))

const makeSettingRecord = (key: string, value: string) => ({ key, value })

describe("getSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllSettingsRecords.mockReturnValue([])
  })

  it("returns defaults when no settings exist", async () => {
    const { getSiteSettings } = await import("./settings")
    const result = getSiteSettings()

    expect(result.title).toBe("My CMS")
    expect(result.description).toBe("A content management system")
    expect(result.maintenance_mode).toBe(false)
    expect(result.timezone).toBe("UTC")
    expect(result.logo).toBe("")
    expect(result.links).toEqual([])
    expect(result.open_hours).toEqual([])
    expect(result.translate_countries).toEqual([])
    expect(result.email_notifications).toEqual([])
  })

  it("reads string settings from DB", async () => {
    mockGetAllSettingsRecords.mockReturnValue([
      makeSettingRecord("title", "My Site"),
      makeSettingRecord("description", "My desc"),
      makeSettingRecord("timezone", "Asia/Jakarta"),
    ])

    const { getSiteSettings } = await import("./settings")
    const result = getSiteSettings()

    expect(result.title).toBe("My Site")
    expect(result.description).toBe("My desc")
    expect(result.timezone).toBe("Asia/Jakarta")
  })

  it("reads boolean setting correctly", async () => {
    mockGetAllSettingsRecords.mockReturnValue([
      makeSettingRecord("maintenance_mode", "true"),
    ])

    const { getSiteSettings } = await import("./settings")
    const result = getSiteSettings()

    expect(result.maintenance_mode).toBe(true)
  })

  it("reads boolean false setting", async () => {
    mockGetAllSettingsRecords.mockReturnValue([
      makeSettingRecord("maintenance_mode", "false"),
    ])

    const { getSiteSettings } = await import("./settings")
    const result = getSiteSettings()

    expect(result.maintenance_mode).toBe(false)
  })

  it("reads JSON settings (links)", async () => {
    mockGetAllSettingsRecords.mockReturnValue([
      makeSettingRecord("links", JSON.stringify([{ platform: "twitter", url: "https://x.com" }])),
    ])

    const { getSiteSettings } = await import("./settings")
    const result = getSiteSettings()

    expect(result.links).toEqual([{ platform: "twitter", url: "https://x.com" }])
  })

  it("falls back to default on invalid JSON", async () => {
    mockGetAllSettingsRecords.mockReturnValue([
      makeSettingRecord("links", "invalid-json"),
    ])

    const { getSiteSettings } = await import("./settings")
    const result = getSiteSettings()

    expect(result.links).toEqual([])
  })

  it("rejects the removed comma-separated legacy format", async () => {
    mockGetAllSettingsRecords.mockReturnValue([
      makeSettingRecord("email_notifications", "a@b.com,c@d.com"),
    ])

    const { getSiteSettings } = await import("./settings")
    const result = getSiteSettings()

    expect(result.email_notifications).toEqual([])
  })
})

describe("updateSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllSettingsRecords.mockReturnValue([])
  })

  it("updates title setting", async () => {
    const { updateSiteSettings } = await import("./settings")
    const result = updateSiteSettings({ title: "New Title" })

    expect(result.success).toBe(true)
    expect(mockUpsertSettingRecord).toHaveBeenCalledWith("title", "New Title")
    expect(mockInvalidatePublicDataCache).toHaveBeenCalled()
  })

  it("updates maintenance_mode as string", async () => {
    const { updateSiteSettings } = await import("./settings")
    updateSiteSettings({ maintenance_mode: true })

    expect(mockUpsertSettingRecord).toHaveBeenCalledWith("maintenance_mode", "true")
  })

  it("updates JSON fields with stringify", async () => {
    const { updateSiteSettings } = await import("./settings")
    updateSiteSettings({ links: [{ platform: "github", url: "https://github.com" }] })

    expect(mockUpsertSettingRecord).toHaveBeenCalledWith("links", JSON.stringify([{ platform: "github", url: "https://github.com" }]))
  })

  it("handles email_notifications as string input", async () => {
    const { updateSiteSettings } = await import("./settings")
    updateSiteSettings({ email_notifications: "a@b.com, c@d.com" })

    expect(mockUpsertSettingRecord).toHaveBeenCalledWith("email_notifications", JSON.stringify(["a@b.com", "c@d.com"]))
  })

  it("returns early when nothing to update", async () => {
    const { updateSiteSettings } = await import("./settings")
    const result = updateSiteSettings({})

    expect(result.success).toBe(true)
    expect(result.message).toBe("No settings to update.")
    expect(mockUpsertSettingRecord).not.toHaveBeenCalled()
  })

  it("updates multiple settings at once", async () => {
    const { updateSiteSettings } = await import("./settings")
    const result = updateSiteSettings({
      title: "New Title",
      description: "New desc",
      timezone: "UTC+7",
    })

    expect(result.success).toBe(true)
    expect(mockUpsertSettingRecord).toHaveBeenCalledTimes(3)
  })
})
