import { describe, it, expect, vi } from "vitest"
import * as fc from "fast-check"
import { slugify } from "zadm/pkg/utils/slug"
import { generateSlug } from "./slug"
import { getCurrentTimestamp } from "./time"

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("replaces spaces with hyphens", () => {
    expect(slugify("my blog post")).toBe("my-blog-post")
  })

  it("replaces consecutive non-alphanumeric characters with a single hyphen", () => {
    expect(slugify("hello!!!world")).toBe("hello-world")
    expect(slugify("foo---bar")).toBe("foo-bar")
    expect(slugify("a @ b # c")).toBe("a-b-c")
  })

  it("removes leading and trailing hyphens", () => {
    expect(slugify("---hello---")).toBe("hello")
    expect(slugify("!!!hello!!!")).toBe("hello")
  })

  it("handles unicode and special characters", () => {
    expect(slugify("café résumé")).toBe("caf-r-sum")
    expect(slugify("hello_world")).toBe("hello-world")
  })

  it("returns empty string for input with only special characters", () => {
    expect(slugify("!!!@@@###")).toBe("")
    expect(slugify("   ")).toBe("")
    expect(slugify("")).toBe("")
  })

  it("truncates to 200 characters maximum", () => {
    const longTitle = "a".repeat(250)
    const result = slugify(longTitle)
    expect(result.length).toBeLessThanOrEqual(200)
  })

  it("does not leave trailing hyphen after truncation", () => {
    // Create a string that when slugified will have a hyphen near the 200 char boundary
    const title = "a".repeat(199) + "-b".repeat(5)
    const result = slugify(title)
    expect(result.length).toBeLessThanOrEqual(200)
    expect(result.endsWith("-")).toBe(false)
  })

  it("handles numbers correctly", () => {
    expect(slugify("post 123 title")).toBe("post-123-title")
    expect(slugify("2024 year review")).toBe("2024-year-review")
  })
})

describe("generateSlug", () => {
  it("returns the base slug when it does not exist", async () => {
    const result = await generateSlug("Hello World", () => false)
    expect(result).toBe("hello-world")
  })

  it("appends -1 when base slug exists", async () => {
    const existing = new Set(["hello-world"])
    const result = await generateSlug("Hello World", (slug) =>
      existing.has(slug)
    )
    expect(result).toBe("hello-world-1")
  })

  it("appends incrementing suffixes until unique", async () => {
    const existing = new Set(["my-post", "my-post-1", "my-post-2"])
    const result = await generateSlug("My Post", (slug) => existing.has(slug))
    expect(result).toBe("my-post-3")
  })

  it("returns null when title produces empty slug", async () => {
    const result = await generateSlug("!!!", () => false)
    expect(result).toBeNull()
  })

  it("returns null after 100 failed attempts", async () => {
    // All slugs exist
    const result = await generateSlug("test", () => true)
    expect(result).toBeNull()
  })

  it("works with async checkExists callback", async () => {
    const existing = new Set(["async-test"])
    const result = await generateSlug("Async Test", async (slug) => {
      await new Promise((resolve) => setTimeout(resolve, 1))
      return existing.has(slug)
    })
    expect(result).toBe("async-test-1")
  })
})

describe("slugify - Property-Based Tests", () => {
  /**
   * **Validates: Requirements 5.1, 5.2**
   * Property 3: Slug Format Validity
   * For any input title string, the generated slug contains only lowercase
   * alphanumeric characters and hyphens, has no leading or trailing hyphens,
   * and has no consecutive hyphens.
   */
  it("always produces a valid slug format (only lowercase alphanumeric and hyphens)", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = slugify(input)
        if (slug === "") return true // empty is valid for empty/special-only input
        // Only contains lowercase alphanumeric and hyphens
        expect(slug).toMatch(/^[a-z0-9-]*$/)
        return true
      })
    )
  })

  it("never has leading or trailing hyphens", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = slugify(input)
        if (slug === "") return true
        expect(slug.startsWith("-")).toBe(false)
        expect(slug.endsWith("-")).toBe(false)
        return true
      })
    )
  })

  it("never has consecutive hyphens", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = slugify(input)
        expect(slug).not.toMatch(/--/)
        return true
      })
    )
  })

  it("never exceeds 200 characters", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 1000 }), (input) => {
        const slug = slugify(input)
        expect(slug.length).toBeLessThanOrEqual(200)
        return true
      })
    )
  })
})

describe("generateSlug - Property-Based Tests", () => {
  /**
   * **Validates: Requirements 5.3, 5.5**
   * Property 4: Slug Uniqueness Guarantee
   * For any title and any set of existing slugs, the Slug_Generator produces
   * a slug that is not present in the existing set.
   */
  it("always produces a unique slug not in the existing set (when possible)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) =>
          /[a-z0-9]/.test(s.toLowerCase())
        ),
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
          minLength: 0,
          maxLength: 20,
        }),
        async (title, existingSlugs) => {
          const existingSet = new Set(existingSlugs)
          const result = await generateSlug(title, (slug) =>
            existingSet.has(slug)
          )
          // If result is not null, it must not be in the existing set
          if (result !== null) {
            expect(existingSet.has(result)).toBe(false)
          }
        }
      )
    )
  })
})

describe("getCurrentTimestamp", () => {
  it("returns a number representing unix epoch seconds", () => {
    const timestamp = getCurrentTimestamp()
    expect(typeof timestamp).toBe("number")
    // Should be a reasonable unix timestamp (after 2020-01-01)
    expect(timestamp).toBeGreaterThan(1577836800)
  })

  it("returns a whole number (no fractional seconds)", () => {
    const timestamp = getCurrentTimestamp()
    expect(Number.isInteger(timestamp)).toBe(true)
  })

  it("returns value consistent with Date.now() in seconds", () => {
    const before = Math.floor(Date.now() / 1000)
    const timestamp = getCurrentTimestamp()
    const after = Math.floor(Date.now() / 1000)
    expect(timestamp).toBeGreaterThanOrEqual(before)
    expect(timestamp).toBeLessThanOrEqual(after)
  })

  it("uses floor to truncate milliseconds", () => {
    // Mock Date.now to return a value with fractional seconds
    vi.spyOn(Date, "now").mockReturnValue(1700000000500) // .5 seconds
    const timestamp = getCurrentTimestamp()
    expect(timestamp).toBe(1700000000)
    vi.restoreAllMocks()
  })
})
