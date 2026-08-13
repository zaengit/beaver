import { describe, expect, it } from "vitest"

describe("router/admin/auth/refresh", () => {
  it("module loads", async () => {
    const mod = await import("./refresh")
    expect(mod).toBeDefined()
  })
})
