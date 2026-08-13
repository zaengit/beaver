import { describe, expect, it } from "vitest"

describe("app/handlers/types", () => {
  it("module loads", async () => {
    const mod = await import("./types")
    expect(mod).toBeDefined()
  })
})
