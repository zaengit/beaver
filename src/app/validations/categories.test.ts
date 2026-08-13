import { describe, it, expect } from "vitest"
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "./categories"

describe("createCategorySchema", () => {
  it("validates a valid category with only name", () => {
    const result = createCategorySchema.safeParse({ name: "Technology" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Technology")
      expect(result.data.type).toBe("post")
    }
  })

  it("validates a full category input", () => {
    const input = {
      name: "Web Development",
      type: "page",
      description: "Articles about web dev",
      image: "https://example.com/image.png",
    }
    const result = createCategorySchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Web Development")
      expect(result.data.type).toBe("page")
      expect(result.data.description).toBe("Articles about web dev")
      expect(result.data.image).toBe("https://example.com/image.png")
    }
  })

  it("rejects empty name", () => {
    const result = createCategorySchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects name exceeding 100 characters", () => {
    const result = createCategorySchema.safeParse({ name: "a".repeat(101) })
    expect(result.success).toBe(false)
  })

  it("accepts name at exactly 100 characters", () => {
    const result = createCategorySchema.safeParse({ name: "a".repeat(100) })
    expect(result.success).toBe(true)
  })

  it("transforms empty description to null", () => {
    const result = createCategorySchema.safeParse({
      name: "Test",
      description: "",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it("transforms whitespace-only description to null", () => {
    const result = createCategorySchema.safeParse({
      name: "Test",
      description: "   ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it("transforms empty image to null", () => {
    const result = createCategorySchema.safeParse({
      name: "Test",
      image: "",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.image).toBeNull()
    }
  })

  it("rejects invalid image URL", () => {
    const result = createCategorySchema.safeParse({
      name: "Test",
      image: "not-a-url",
    })
    expect(result.success).toBe(false)
  })

  it("accepts valid image URL", () => {
    const result = createCategorySchema.safeParse({
      name: "Test",
      image: "https://example.com/cat.jpg",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.image).toBe("https://example.com/cat.jpg")
    }
  })

  it("defaults type to 'post' when not provided", () => {
    const result = createCategorySchema.safeParse({ name: "Test" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe("post")
    }
  })
})

describe("updateCategorySchema", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = updateCategorySchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("validates partial update with only name", () => {
    const result = updateCategorySchema.safeParse({ name: "Updated" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Updated")
    }
  })

  it("rejects name exceeding 100 characters in update", () => {
    const result = updateCategorySchema.safeParse({ name: "a".repeat(101) })
    expect(result.success).toBe(false)
  })

  it("validates partial update with description", () => {
    const result = updateCategorySchema.safeParse({
      description: "New description",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe("New description")
    }
  })

  it("transforms empty description to null in update", () => {
    const result = updateCategorySchema.safeParse({ description: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })
})
