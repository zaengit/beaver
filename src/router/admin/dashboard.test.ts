import { describe, expect, it } from "vitest"

describe("router/admin/dashboard", () => {
  it("module loads", async () => {
    const mod = await import("./dashboard")
    expect(mod).toBeDefined()
  })
})
