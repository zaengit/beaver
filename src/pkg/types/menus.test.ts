import { describe, expect, it } from "vitest"

describe("pkg/types/menus", () => {
  it("module loads", async () => {
    const mod = await import("./menus")
    expect(mod).toBeDefined()
  })
})