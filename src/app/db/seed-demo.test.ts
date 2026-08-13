import { describe, expect, it } from "vitest"

describe("app/db/seed-demo", () => {
  it("module loads", async () => {
    const mod = await import("./seed-demo")
    expect(mod).toBeDefined()
  })
})
