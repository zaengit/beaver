import { describe, expect, it } from "vitest"

describe("router/admin/auth/profile", () => {
  it("module loads", async () => {
    const mod = await import("./profile")
    expect(mod).toBeDefined()
  })
})
