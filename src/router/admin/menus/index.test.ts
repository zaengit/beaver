import { describe, expect, it } from "vitest"

describe("router/admin/menus/index", () => {
  it("module loads", async () => {
    const mod = await import("./index")
    expect(mod).toBeDefined()
  })
})
