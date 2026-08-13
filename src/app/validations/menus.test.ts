import { describe, it, expect } from "vitest"
import {
  createMenuSchema,
  updateMenuSchema,
  reorderMenusSchema,
  type CreateMenuInput,
  type UpdateMenuInput,
  type ReorderMenusInput,
} from "./menus"

describe("createMenuSchema", () => {
  it("validates a valid menu item with required fields", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("Home")
      expect(result.data.url).toBe("/")
      expect(result.data.type).toBe("navbar")
      expect(result.data.position).toBe(0)
    }
  })

  it("validates a full menu item input", () => {
    const input = {
      title: "About Us",
      url: "/about",
      type: "footer" as const,
      position: 2,
      parentId: "01KRJWYM85B78JTT95VEVE55VH",
      cssClass: "nav-item",
      target: "_blank",
    }
    const result = createMenuSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("About Us")
      expect(result.data.url).toBe("/about")
      expect(result.data.type).toBe("footer")
      expect(result.data.position).toBe(2)
      expect(result.data.parentId).toBe("01KRJWYM85B78JTT95VEVE55VH")
      expect(result.data.cssClass).toBe("nav-item")
      expect(result.data.target).toBe("_blank")
    }
  })

  it("rejects empty title", () => {
    const result = createMenuSchema.safeParse({
      title: "",
      url: "/",
      type: "navbar",
    })
    expect(result.success).toBe(false)
  })

  it("rejects title exceeding 100 characters", () => {
    const result = createMenuSchema.safeParse({
      title: "a".repeat(101),
      url: "/",
      type: "navbar",
    })
    expect(result.success).toBe(false)
  })

  it("accepts title at exactly 100 characters", () => {
    const result = createMenuSchema.safeParse({
      title: "a".repeat(100),
      url: "/",
      type: "navbar",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing url", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      type: "navbar",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid type", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "header",
    })
    expect(result.success).toBe(false)
  })

  it("accepts all valid type values", () => {
    for (const type of ["navbar", "footer", "sidebar"]) {
      const result = createMenuSchema.safeParse({
        title: "Test",
        url: "/",
        type,
      })
      expect(result.success).toBe(true)
    }
  })

  it("rejects negative position", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
      position: -1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects non-integer position", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
      position: 1.5,
    })
    expect(result.success).toBe(false)
  })

  it("defaults position to 0 when not provided", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.position).toBe(0)
    }
  })

  it("rejects invalid parentId (not a ULID)", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
      parentId: "invalid-id",
    })
    expect(result.success).toBe(false)
  })

  it("accepts null parentId", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
      parentId: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.parentId).toBeNull()
    }
  })

  it("transforms empty cssClass to null", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
      cssClass: "",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cssClass).toBeNull()
    }
  })

  it("transforms whitespace-only target to null", () => {
    const result = createMenuSchema.safeParse({
      title: "Home",
      url: "/",
      type: "navbar",
      target: "   ",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.target).toBeNull()
    }
  })
})

describe("updateMenuSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    const result = updateMenuSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("validates partial update with only title", () => {
    const result = updateMenuSchema.safeParse({ title: "Updated" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("Updated")
    }
  })

  it("rejects title exceeding 100 characters in update", () => {
    const result = updateMenuSchema.safeParse({ title: "a".repeat(101) })
    expect(result.success).toBe(false)
  })

  it("validates partial update with position", () => {
    const result = updateMenuSchema.safeParse({ position: 5 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.position).toBe(5)
    }
  })
})

describe("reorderMenusSchema", () => {
  it("validates a valid reorder payload", () => {
    const input = {
      type: "navbar",
      tree: [
        {
          id: "01KRJWYM85B78JTT95VEVE55VH",
          parentId: null,
          position: 0,
          children: [],
        },
        {
          id: "01KRJWYM8BV3WHDMMY3TJPZD7B",
          parentId: null,
          position: 1,
          children: [
            {
              id: "01KRJWYM8B3YHEVES7WHVRME7K",
              parentId: "01KRJWYM8BV3WHDMMY3TJPZD7B",
              position: 0,
              children: [],
            },
          ],
        },
      ],
    }
    const result = reorderMenusSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it("rejects invalid type in reorder", () => {
    const result = reorderMenusSchema.safeParse({
      type: "header",
      tree: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects tree item with invalid id", () => {
    const result = reorderMenusSchema.safeParse({
      type: "navbar",
      tree: [
        {
          id: "not-a-ulid",
          parentId: null,
          position: 0,
          children: [],
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it("rejects tree item with negative position", () => {
    const result = reorderMenusSchema.safeParse({
      type: "navbar",
      tree: [
        {
          id: "01KRJWYM85B78JTT95VEVE55VH",
          parentId: null,
          position: -1,
          children: [],
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it("accepts empty tree array", () => {
    const result = reorderMenusSchema.safeParse({
      type: "footer",
      tree: [],
    })
    expect(result.success).toBe(true)
  })

  it("validates deeply nested tree structure", () => {
    const input = {
      type: "sidebar",
      tree: [
        {
          id: "01KRJWYM85B78JTT95VEVE55VH",
          parentId: null,
          position: 0,
          children: [
            {
              id: "01KRJWYM8BV3WHDMMY3TJPZD7B",
              parentId: "01KRJWYM85B78JTT95VEVE55VH",
              position: 0,
              children: [
                {
                  id: "01KRJWYM8B3YHEVES7WHVRME7K",
                  parentId: "01KRJWYM8BV3WHDMMY3TJPZD7B",
                  position: 0,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    }
    const result = reorderMenusSchema.safeParse(input)
    expect(result.success).toBe(true)
  })
})
