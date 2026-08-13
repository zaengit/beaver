import { describe, expect, it } from "vitest"

describe("router/admin/auth/session", () => {
  it("module loads", async () => {
    const mod = await import("./session")
    expect(mod).toBeDefined()
  })
})
