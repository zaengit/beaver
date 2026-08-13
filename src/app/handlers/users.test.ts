import { describe, expect, it } from "vitest"

describe("app/handlers/users", () => {
  it("module loads", async () => {
    const mod = await import("./users")
    expect(mod).toBeDefined()
  })
})
