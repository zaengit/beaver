import { describe, expect, it } from "vitest"

describe("app/db/schema", () => {
  it("module loads", async () => {
    const mod = await import("./schema")
    expect(mod).toBeDefined()
  })
})
