import { describe, expect, it } from "vitest"

describe("request-context types", () => {
  it("module exports are defined", async () => {
    const mod = await import("./request-context")
    expect(mod).toBeDefined()
  })
})