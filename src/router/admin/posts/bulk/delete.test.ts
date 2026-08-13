import { describe, expect, it } from "vitest"

describe("router/admin/posts/bulk/delete", () => {
  it("module loads", async () => {
    const mod = await import("./delete")
    expect(mod).toBeDefined()
  })
})
