import { describe, expect, it } from "vitest"

describe("router/admin/auth/logout", () => {
  it("module loads", async () => {
    const mod = await import("./logout")
    expect(mod).toBeDefined()
  })
})
