import { describe, it, expect } from "vitest"
import { createPostSchema, updatePostSchema } from "./posts"

describe("createPostSchema", () => {
  it("accepts valid minimal input", () => {
    const result = createPostSchema.safeParse({ title: "Hello World" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("Hello World")
      expect(result.data.type).toBe("post")
      expect(result.data.status).toBe("draft")
    }
  })

  it("accepts valid full input", () => {
    const result = createPostSchema.safeParse({
      title: "My Post",
      slug: "my-post",
      type: "page",
      status: "published",
      excerpt: "A short excerpt",
      description: "<p>Content here</p>",
      tags: ["tag1", "tag2"],
      sections: [{ id: "s1", type: "text", content: "hello" }],
      metaTitle: "SEO Title",
      metaDescription: "SEO Description",
      featuredImage: "https://example.com/image.jpg",
      categoryIds: ["01ARZ3NDEKTSV4RRFFQ69G5FAV"],
      customFieldValues: { color: "red" },
    })
    expect(result.success).toBe(true)
  })

  // Title validation (Req 9.4)
  it("rejects empty title", () => {
    const result = createPostSchema.safeParse({ title: "" })
    expect(result.success).toBe(false)
  })

  it("rejects title over 200 characters", () => {
    const result = createPostSchema.safeParse({ title: "a".repeat(201) })
    expect(result.success).toBe(false)
  })

  it("accepts title at exactly 200 characters", () => {
    const result = createPostSchema.safeParse({ title: "a".repeat(200) })
    expect(result.success).toBe(true)
  })

  // Slug validation (Req 9.5)
  it("accepts valid slug", () => {
    const result = createPostSchema.safeParse({ title: "Test", slug: "my-post-123" })
    expect(result.success).toBe(true)
  })

  it("rejects slug with uppercase", () => {
    const result = createPostSchema.safeParse({ title: "Test", slug: "My-Post" })
    expect(result.success).toBe(false)
  })

  it("rejects slug with consecutive hyphens", () => {
    const result = createPostSchema.safeParse({ title: "Test", slug: "my--post" })
    expect(result.success).toBe(false)
  })

  it("rejects slug with leading hyphen", () => {
    const result = createPostSchema.safeParse({ title: "Test", slug: "-my-post" })
    expect(result.success).toBe(false)
  })

  it("rejects slug over 100 characters", () => {
    const result = createPostSchema.safeParse({ title: "Test", slug: "a".repeat(101) })
    expect(result.success).toBe(false)
  })

  // Meta title (Req 9.6)
  it("rejects metaTitle over 60 characters", () => {
    const result = createPostSchema.safeParse({ title: "Test", metaTitle: "a".repeat(61) })
    expect(result.success).toBe(false)
  })

  it("accepts metaTitle at exactly 60 characters", () => {
    const result = createPostSchema.safeParse({ title: "Test", metaTitle: "a".repeat(60) })
    expect(result.success).toBe(true)
  })

  // Meta description (Req 9.6)
  it("rejects metaDescription over 160 characters", () => {
    const result = createPostSchema.safeParse({ title: "Test", metaDescription: "a".repeat(161) })
    expect(result.success).toBe(false)
  })

  it("accepts metaDescription at exactly 160 characters", () => {
    const result = createPostSchema.safeParse({ title: "Test", metaDescription: "a".repeat(160) })
    expect(result.success).toBe(true)
  })

  // Tags (Req 20.1)
  it("rejects tags array with more than 30 items", () => {
    const tags = Array.from({ length: 31 }, (_, i) => `tag${i}`)
    const result = createPostSchema.safeParse({ title: "Test", tags })
    expect(result.success).toBe(false)
  })

  it("rejects empty tag string", () => {
    const result = createPostSchema.safeParse({ title: "Test", tags: [""] })
    expect(result.success).toBe(false)
  })

  it("rejects tag over 50 characters", () => {
    const result = createPostSchema.safeParse({ title: "Test", tags: ["a".repeat(51)] })
    expect(result.success).toBe(false)
  })

  // Sections (Req 20.2)
  it("rejects sections array with more than 50 items", () => {
    const sections = Array.from({ length: 51 }, (_, i) => ({
      id: `s${i}`,
      type: "text",
      content: "hello",
    }))
    const result = createPostSchema.safeParse({ title: "Test", sections })
    expect(result.success).toBe(false)
  })

  it("rejects section with empty id", () => {
    const result = createPostSchema.safeParse({
      title: "Test",
      sections: [{ id: "", type: "text", content: "hello" }],
    })
    expect(result.success).toBe(false)
  })

  // Empty-to-null transform (Req 9.9)
  it("transforms empty excerpt to null", () => {
    const result = createPostSchema.safeParse({ title: "Test", excerpt: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.excerpt).toBeNull()
    }
  })

  it("transforms whitespace-only excerpt to null", () => {
    const result = createPostSchema.safeParse({ title: "Test", excerpt: "   " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.excerpt).toBeNull()
    }
  })

  it("transforms empty metaTitle to null", () => {
    const result = createPostSchema.safeParse({ title: "Test", metaTitle: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.metaTitle).toBeNull()
    }
  })

  it("transforms empty metaDescription to null", () => {
    const result = createPostSchema.safeParse({ title: "Test", metaDescription: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.metaDescription).toBeNull()
    }
  })

  it("transforms empty featuredImage to null", () => {
    const result = createPostSchema.safeParse({ title: "Test", featuredImage: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.featuredImage).toBeNull()
    }
  })

  // Featured image (Req 17.4)
  it("accepts valid https URL for featuredImage", () => {
    const result = createPostSchema.safeParse({
      title: "Test",
      featuredImage: "https://example.com/image.jpg",
    })
    expect(result.success).toBe(true)
  })

  it("rejects featuredImage with invalid protocol", () => {
    const result = createPostSchema.safeParse({
      title: "Test",
      featuredImage: "ftp://example.com/image.jpg",
    })
    expect(result.success).toBe(false)
  })

  it("rejects featuredImage over 2048 characters", () => {
    const result = createPostSchema.safeParse({
      title: "Test",
      featuredImage: "https://example.com/" + "a".repeat(2030),
    })
    expect(result.success).toBe(false)
  })

  // Category IDs (Req 9.7)
  it("accepts valid ULID category IDs", () => {
    const result = createPostSchema.safeParse({
      title: "Test",
      categoryIds: ["01ARZ3NDEKTSV4RRFFQ69G5FAV"],
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid category ID format", () => {
    const result = createPostSchema.safeParse({
      title: "Test",
      categoryIds: ["not-a-ulid"],
    })
    expect(result.success).toBe(false)
  })
})

describe("updatePostSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = updatePostSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts partial update with only title", () => {
    const result = updatePostSchema.safeParse({ title: "Updated Title" })
    expect(result.success).toBe(true)
  })

  it("still validates constraints on provided fields", () => {
    const result = updatePostSchema.safeParse({ title: "a".repeat(201) })
    expect(result.success).toBe(false)
  })

  it("still validates slug format on provided slug", () => {
    const result = updatePostSchema.safeParse({ slug: "INVALID" })
    expect(result.success).toBe(false)
  })
})
