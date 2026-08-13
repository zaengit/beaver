import { describe, expect, it } from "vitest"

describe("router/admin/users/[id]", () => {
  it("module loads", async () => {
    const mod = await import("./[id]")
    expect(mod).toBeDefined()
  })
})
