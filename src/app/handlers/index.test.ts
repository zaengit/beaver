import { describe, expect, it } from "vitest"

describe("app/handlers barrel", () => {
  it("module loads", async () => {
    const mod = await import("./index")
    expect(mod).toBeDefined()
  })
})
