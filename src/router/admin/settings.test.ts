import { describe, expect, it } from "vitest"

describe("router/admin/settings", () => {
  it("module loads", async () => {
    const mod = await import("./settings")
    expect(mod).toBeDefined()
  })
})
