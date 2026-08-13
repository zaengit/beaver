import { describe, expect, it } from "vitest"

describe("slugify", () => {
  it("lowercases input", async () => {
    const { slugify } = await import("./slug")
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("replaces special characters with hyphens", async () => {
    const { slugify } = await import("./slug")
    expect(slugify("hello @#$ world!")).toBe("hello-world")
  })

  it("trims leading and trailing hyphens", async () => {
    const { slugify } = await import("./slug")
    expect(slugify("--hello world--")).toBe("hello-world")
  })

  it("collapses consecutive hyphens", async () => {
    const { slugify } = await import("./slug")
    expect(slugify("hello---world")).toBe("hello-world")
  })

  it("truncates to 200 characters", async () => {
    const { slugify } = await import("./slug")
    const long = "a".repeat(250)
    const result = slugify(long)
    expect(result.length).toBeLessThanOrEqual(200)
  })

  it("handles empty string", async () => {
    const { slugify } = await import("./slug")
    expect(slugify("")).toBe("")
  })
})

describe("generateSlug", () => {
  it("returns base slug when no collision", async () => {
    const { generateSlug } = await import("./slug")
    const checkExists = async () => false
    const result = await generateSlug("Hello World", checkExists)
    expect(result).toBe("hello-world")
  })

  it("appends -1 when slug exists", async () => {
    const { generateSlug } = await import("./slug")
    const checkExists = async (s: string) => s === "hello-world"
    const result = await generateSlug("Hello World", checkExists)
    expect(result).toBe("hello-world-1")
  })

  it("increments suffix until unique", async () => {
    const { generateSlug } = await import("./slug")
    const taken = new Set(["hello-world", "hello-world-1", "hello-world-2"])
    const checkExists = async (s: string) => taken.has(s)
    const result = await generateSlug("Hello World", checkExists)
    expect(result).toBe("hello-world-3")
  })

  it("returns null when title produces empty slug", async () => {
    const { generateSlug } = await import("./slug")
    const checkExists = async () => false
    const result = await generateSlug("!@#$", checkExists)
    expect(result).toBeNull()
  })

  it("returns null when all suffixes exhausted", async () => {
    const { generateSlug } = await import("./slug")
    const checkExists = async () => true
    const result = await generateSlug("Hello World", checkExists)
    expect(result).toBeNull()
  })
})