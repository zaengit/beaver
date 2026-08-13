import { describe, expect, it } from "vitest"

describe("pkg/utils barrel", () => {
  it("re-exports generateId", async () => {
    const mod = await import("./index")
    expect(mod.generateId).toBeDefined()
    expect(typeof mod.generateId).toBe("function")
  })

  it("re-exports generateSlug", async () => {
    const mod = await import("./index")
    expect(mod.generateSlug).toBeDefined()
    expect(typeof mod.generateSlug).toBe("function")
  })

  it("re-exports slugify", async () => {
    const mod = await import("./index")
    expect(mod.slugify).toBeDefined()
    expect(typeof mod.slugify).toBe("function")
  })

  it("re-exports getCurrentTimestamp", async () => {
    const mod = await import("./index")
    expect(mod.getCurrentTimestamp).toBeDefined()
    expect(typeof mod.getCurrentTimestamp).toBe("function")
  })
})