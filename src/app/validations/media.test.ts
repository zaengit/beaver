import { describe, it, expect } from "vitest"
import {
  uploadMediaSchema,
  updateMediaSchema,
  type UploadMediaInput,
  type UpdateMediaInput,
} from "./media"

describe("uploadMediaSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = uploadMediaSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts a full valid input", () => {
    const input = {
      name: "my-photo.jpg",
      alt: "A sunset over the ocean",
      caption: "Photo taken in Bali",
      folder: "travel",
    }
    const result = uploadMediaSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("my-photo.jpg")
      expect(result.data.alt).toBe("A sunset over the ocean")
      expect(result.data.caption).toBe("Photo taken in Bali")
      expect(result.data.folder).toBe("travel")
    }
  })

  it("accepts name as optional string", () => {
    const result = uploadMediaSchema.safeParse({ name: "display-name" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("display-name")
    }
  })

  it("transforms empty alt to null", () => {
    const result = uploadMediaSchema.safeParse({ alt: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.alt).toBeNull()
    }
  })

  it("transforms whitespace-only alt to null", () => {
    const result = uploadMediaSchema.safeParse({ alt: "   " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.alt).toBeNull()
    }
  })

  it("transforms empty caption to null", () => {
    const result = uploadMediaSchema.safeParse({ caption: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.caption).toBeNull()
    }
  })

  it("transforms whitespace-only caption to null", () => {
    const result = uploadMediaSchema.safeParse({ caption: "  " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.caption).toBeNull()
    }
  })

  it("transforms empty folder to null", () => {
    const result = uploadMediaSchema.safeParse({ folder: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.folder).toBeNull()
    }
  })

  it("transforms whitespace-only folder to null", () => {
    const result = uploadMediaSchema.safeParse({ folder: "   " })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.folder).toBeNull()
    }
  })

  it("accepts null for optional fields", () => {
    const result = uploadMediaSchema.safeParse({
      alt: null,
      caption: null,
      folder: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.alt).toBeNull()
      expect(result.data.caption).toBeNull()
      expect(result.data.folder).toBeNull()
    }
  })
})

describe("updateMediaSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = updateMediaSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("accepts a valid name", () => {
    const result = updateMediaSchema.safeParse({ name: "new-name" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("new-name")
    }
  })

  it("rejects empty name (min 1 character)", () => {
    const result = updateMediaSchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("accepts a full valid update", () => {
    const input = {
      name: "updated-photo",
      alt: "Updated alt text",
      caption: "Updated caption",
      folder: "archive",
    }
    const result = updateMediaSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("updated-photo")
      expect(result.data.alt).toBe("Updated alt text")
      expect(result.data.caption).toBe("Updated caption")
      expect(result.data.folder).toBe("archive")
    }
  })

  it("transforms empty alt to null", () => {
    const result = updateMediaSchema.safeParse({ alt: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.alt).toBeNull()
    }
  })

  it("transforms empty caption to null", () => {
    const result = updateMediaSchema.safeParse({ caption: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.caption).toBeNull()
    }
  })

  it("transforms empty folder to null", () => {
    const result = updateMediaSchema.safeParse({ folder: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.folder).toBeNull()
    }
  })

  it("accepts null for optional fields", () => {
    const result = updateMediaSchema.safeParse({
      alt: null,
      caption: null,
      folder: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.alt).toBeNull()
      expect(result.data.caption).toBeNull()
      expect(result.data.folder).toBeNull()
    }
  })
})
