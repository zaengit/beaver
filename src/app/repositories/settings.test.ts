import { describe, expect, it, vi } from "vitest"

vi.mock("zadm/app/db", () => ({
  db: {
    select: vi.fn(),
  },
}))

vi.mock("drizzle-orm", () => ({
  relations: vi.fn(),
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
}))

vi.mock("zadm/pkg/utils/index", () => ({
  getCurrentTimestamp: vi.fn(() => 1700000000000),
}))

describe("settings repository", () => {
  it("exports all expected functions", async () => {
    const repo = await import("./settings")
    expect(typeof repo.getAllSettingsRecords).toBe("function")
    expect(typeof repo.upsertSettingRecord).toBe("function")
  })

  it("getAllSettingsRecords returns rows", async () => {
    const rows = [
      { key: "title", value: "My Site" },
      { key: "description", value: "A blog" },
    ]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockFrom = vi.fn().mockReturnValue({ all: mockAll })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { getAllSettingsRecords } = await import("./settings")
    const result = getAllSettingsRecords()
    expect(result).toEqual(rows)
  })

  it("getAllSettingsRecords returns empty array when no settings", async () => {
    const mockAll = vi.fn().mockReturnValue([])
    const mockFrom = vi.fn().mockReturnValue({ all: mockAll })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { getAllSettingsRecords } = await import("./settings")
    const result = getAllSettingsRecords()
    expect(result).toEqual([])
  })
})