import { describe, expect, it } from "vitest"

describe("app/db/seed", () => {
  it("module loads", async () => {
    const mod = await import("./seed")
    expect(mod).toBeDefined()
  })
})
