import { describe, expect, it } from "vitest"

describe("getCurrentTimestamp", () => {
  it("returns a number close to current unix time", async () => {
    const { getCurrentTimestamp } = await import("./time")
    const ts = getCurrentTimestamp()
    const now = Math.floor(Date.now() / 1000)
    expect(Math.abs(ts - now)).toBeLessThan(2)
  })

  it("returns an integer", async () => {
    const { getCurrentTimestamp } = await import("./time")
    expect(Number.isInteger(getCurrentTimestamp())).toBe(true)
  })
})