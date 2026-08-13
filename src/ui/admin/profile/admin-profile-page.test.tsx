import { describe, expect, it } from "vitest"

describe("module", () => {
  it("loads without error", async () => {
    const mod = await import("./admin-profile-page")
    expect(mod).toBeDefined()
  })
})
