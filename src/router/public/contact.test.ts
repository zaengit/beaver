import { describe, expect, it } from "vitest"

describe("router/public/contact", () => {
  it("module loads", async () => {
    const mod = await import("./contact")
    expect(mod).toBeDefined()
  })
})
