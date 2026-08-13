import { describe, expect, it } from "vitest"

describe("router/admin/posts/bulk/unpublish", () => {
  it("module loads", async () => {
    const mod = await import("./unpublish")
    expect(mod).toBeDefined()
  })
})
