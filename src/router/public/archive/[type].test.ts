import { describe, expect, it } from "vitest"

describe("router/public/archive/[type]", () => {
  it("module loads", async () => {
    const mod = await import("./[type]")
    expect(mod).toBeDefined()
  })
})
