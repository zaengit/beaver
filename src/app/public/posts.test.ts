import { describe, expect, it } from "vitest"

describe("app/public/posts", () => {
  it("module loads", async () => {
    const mod = await import("./posts")
    expect(mod).toBeDefined()
  })
})
