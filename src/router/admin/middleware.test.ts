import { describe, expect, it } from "vitest"

describe("router/admin/middleware", () => {
  it("module loads", async () => {
    const mod = await import("./middleware")
    expect(mod).toBeDefined()
  })
})
