import { describe, expect, it } from "vitest"

describe("module", () => {
  it("loads without error", async () => {
    const mod = await import("./permission-matrix")
    expect(mod).toBeDefined()
  })
})
