import { describe, expect, it } from "vitest"

describe("module", () => {
  it("loads without error", async () => {
    const mod = await import("./media-form")
    expect(mod).toBeDefined()
  })
})
