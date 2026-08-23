import flowstackSeed from "../../../templates/flowstack/data/seed.json"
import { describe, expect, it } from "vitest"

import {
  formatSeedDataSummary,
  migrateData,
  parseSeedData,
} from "./seed-data"

describe("seed data importer contract", () => {
  it("parses the packaged Flowstack seed shape", () => {
    const data = parseSeedData(flowstackSeed, "flowstack")

    expect(data.settings.title).toBe("Flowstack")
    expect(data.categories).toHaveLength(3)
    expect(data.posts).toHaveLength(6)
    expect(data.pages).toHaveLength(3)
    expect(data.menus).toHaveLength(11)
    expect(data.posts[0].status).toBe("published")
  })

  it("rejects unknown fields and duplicate stable keys", () => {
    expect(() => parseSeedData({ unexpected: true }, "invalid")).toThrow(/unexpected/i)

    expect(() => parseSeedData({
      categories: [
        { name: "Product", slug: "product" },
        { name: "Another Product", slug: "product" },
      ],
    }, "duplicate")).toThrow(/Duplicate category slug/i)
  })

  it("rejects cyclic menu parent references", () => {
    expect(() => parseSeedData({
      menus: [
        { title: "One", url: "/one", type: "navbar", parentUrl: "/two" },
        { title: "Two", url: "/two", type: "navbar", parentUrl: "/one" },
      ],
    }, "cyclic-menus")).toThrow(/cycle/i)
  })

  it("supports dry-run without requiring a seeded database user", async () => {
    const result = await migrateData({ template: "flowstack", dryRun: true })

    expect(result.dryRun).toBe(true)
    expect(result.categories.created).toBe(3)
    expect(result.posts.created).toBe(6)
    expect(result.pages.created).toBe(3)
    expect(result.menus.created).toBe(11)
  })

  it("formats an actionable migration summary", () => {
    const summary = formatSeedDataSummary({
      source: "fixture",
      dryRun: false,
      settings: { created: 1, updated: 2, skipped: 3 },
      categories: { created: 4, updated: 5, skipped: 6 },
      posts: { created: 7, updated: 8, skipped: 9 },
      pages: { created: 10, updated: 11, skipped: 12 },
      menus: { created: 13, updated: 14, skipped: 15 },
    })

    expect(summary).toContain("Seed data migration complete: fixture")
    expect(summary).toContain("posts: 7 created, 8 updated, 9 skipped")
  })
})
