import { describe, it, expect } from "vitest"

describe("updateSettingsSchema", () => {
  it("accepts empty object (partial updates)", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const result = updateSettingsSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts a full valid settings object", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const input = {
      title: "My Site",
      description: "A blog",
      meta_title: "My Site - Home",
      meta_description: "SEO description",
      maintenance_mode: false,
      timezone: "UTC",
      logo: "/logo.png",
      favicon: "/favicon.ico",
      links: [{ platform: "GitHub", url: "https://github.com", icon: "github" }],
      open_hours: [{ day: "Monday", open: "09:00", close: "17:00" }],
      custom_css: "body { color: red; }",
      custom_javascript: "console.log('hi');",
      translate_countries: ["US", "GB"],
      email_notifications: "admin@example.com",
    }
    const result = updateSettingsSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it("accepts partial updates with only title", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const result = updateSettingsSchema.safeParse({ title: "New Title" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid links object", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const result = updateSettingsSchema.safeParse({
      links: [{ platform: "GH" }],
    })
    expect(result.success).toBe(false)
  })

  it("accepts empty links array", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const result = updateSettingsSchema.safeParse({ links: [] })
    expect(result.success).toBe(true)
  })

  it("accepts valid maintenance_mode boolean", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const result = updateSettingsSchema.safeParse({ maintenance_mode: true })
    expect(result.success).toBe(true)
  })

  it("rejects non-boolean maintenance_mode", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const result = updateSettingsSchema.safeParse({ maintenance_mode: "true" })
    expect(result.success).toBe(false)
  })

  it("accepts string array for translate_countries", async () => {
    const { updateSettingsSchema } = await import("./settings")
    const result = updateSettingsSchema.safeParse({ translate_countries: ["ID", "JP"] })
    expect(result.success).toBe(true)
  })
})