import { describe, expect, it } from "vitest"

describe("router/admin/categories/bulk/status", () => {
  it("module loads", async () => {
    const mod = await import("./status")
    expect(mod).toBeDefined()
  })
})
