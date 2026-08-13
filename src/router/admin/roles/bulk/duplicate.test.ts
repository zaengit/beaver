import { describe, expect, it } from "vitest"

describe("router/admin/roles/bulk/duplicate", () => {
  it("module loads", async () => {
    const mod = await import("./duplicate")
    expect(mod).toBeDefined()
  })
})
