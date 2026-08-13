import { describe, expect, it } from "vitest"

describe("router/admin/menus/reorder", () => {
  it("module loads", async () => {
    const mod = await import("./reorder")
    expect(mod).toBeDefined()
  })
})
