import { describe, expect, it } from "vitest"

describe("app/public/site", () => {
  it("module loads", async () => {
    const mod = await import("./site")
    expect(mod).toBeDefined()
  })
})
