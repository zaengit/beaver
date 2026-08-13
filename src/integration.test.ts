import { describe, expect, it } from "vitest"

describe("integration", () => {
  it("module loads", async () => {
    const mod = await import("zadm")
    expect(mod).toBeDefined()
  })
})
