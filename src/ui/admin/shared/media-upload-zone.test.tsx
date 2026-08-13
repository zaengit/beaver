import { describe, expect, it } from "vitest"

describe("module", () => {
  it("loads without error", async () => {
    const mod = await import("./media-upload-zone")
    expect(mod).toBeDefined()
  })
})
