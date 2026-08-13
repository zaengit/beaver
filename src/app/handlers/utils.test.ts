import { describe, expect, it } from "vitest"

describe("app/handlers/utils", () => {
  it("module loads", async () => {
    const mod = await import("./utils")
    expect(mod).toBeDefined()
  })
})
