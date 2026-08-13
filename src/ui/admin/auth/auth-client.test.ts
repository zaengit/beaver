import { describe, expect, it } from "vitest"

describe("ui/admin/auth/auth-client", () => {
  it("module loads", async () => {
    const mod = await import("./auth-client")
    expect(mod).toBeDefined()
  })
})