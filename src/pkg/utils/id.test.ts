import { describe, expect, it } from "vitest"

describe("generateId", () => {
  it("returns a non-empty string", async () => {
    const { generateId } = await import("./id")
    const id = generateId()
    expect(typeof id).toBe("string")
    expect(id.length).toBeGreaterThan(0)
  })

  it("returns a 26-character ULID string", async () => {
    const { generateId } = await import("./id")
    const id = generateId()
    expect(id.length).toBe(26)
  })

  it("generates unique IDs", async () => {
    const { generateId } = await import("./id")
    const ids = new Set(Array.from({ length: 10 }, () => generateId()))
    expect(ids.size).toBe(10)
  })
})