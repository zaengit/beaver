import { describe, expect, it } from "vitest"

describe("pkg/types barrel", () => {
  it("module loads", async () => {
    const mod = await import("./index")
    expect(mod).toBeDefined()
  })
})