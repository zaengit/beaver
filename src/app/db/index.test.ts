import { describe, expect, it, vi } from "vitest"

vi.mock("drizzle-orm/better-sqlite3", () => ({
  drizzle: vi.fn(() => ({
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn((fn: () => unknown) => fn()),
  })),
}))

describe("db", () => {
  it("loads without error", async () => {
    const mod = await import("./index")
    expect(mod).toBeDefined()
    expect(mod.db).toBeDefined()
    expect(typeof mod.withTransaction).toBe("function")
  })
})