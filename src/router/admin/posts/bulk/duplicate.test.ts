import { describe, expect, it } from "vitest"

describe("router/admin/posts/bulk/duplicate", () => {
  it("module loads", async () => {
    const mod = await import("./duplicate")
    expect(mod).toBeDefined()
  })
})
