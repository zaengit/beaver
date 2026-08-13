import { describe, expect, it } from "vitest"

describe("pkg/types/media", () => {
  it("module loads", async () => {
    const mod = await import("./media")
    expect(mod).toBeDefined()
  })
})