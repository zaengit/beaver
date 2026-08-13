import { describe, expect, it } from "vitest"

describe("pkg/types/categories", () => {
  it("module loads", async () => {
    const mod = await import("./categories")
    expect(mod).toBeDefined()
  })
})