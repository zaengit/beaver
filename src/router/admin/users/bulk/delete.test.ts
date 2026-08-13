import { describe, expect, it } from "vitest"

describe("router/admin/users/bulk/delete", () => {
  it("module loads", async () => {
    const mod = await import("./delete")
    expect(mod).toBeDefined()
  })
})
