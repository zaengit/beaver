import { describe, expect, it } from "vitest"

describe("router/public/search", () => {
  it("module loads", async () => {
    const mod = await import("./search")
    expect(mod).toBeDefined()
  })
})
