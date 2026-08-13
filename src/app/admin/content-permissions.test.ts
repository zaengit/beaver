import { describe, expect, it } from "vitest"

describe("contentTypes", () => {
  it("includes built-in types", async () => {
    const { contentTypes } = await import("./content-permissions")
    expect(contentTypes).toContain("post")
    expect(contentTypes).toContain("page")
  })
})

describe("isKnownContentType", () => {
  it("returns true for post", async () => {
    const { isKnownContentType } = await import("./content-permissions")
    expect(isKnownContentType("post")).toBe(true)
  })

  it("returns true for page", async () => {
    const { isKnownContentType } = await import("./content-permissions")
    expect(isKnownContentType("page")).toBe(true)
  })

  it("returns false for unknown type", async () => {
    const { isKnownContentType } = await import("./content-permissions")
    expect(isKnownContentType("unknown-type-xyz")).toBe(false)
  })
})

describe("contentPermission", () => {
  it("returns permission string in format content.type.action", async () => {
    const { contentPermission } = await import("./content-permissions")
    expect(contentPermission("post", "view")).toBe("content.post.view")
    expect(contentPermission("page", "edit")).toBe("content.page.edit")
    expect(contentPermission("post", "publish")).toBe("content.post.publish")
  })
})

describe("categoryPermission", () => {
  it("returns permission string in format category.type.action", async () => {
    const { categoryPermission } = await import("./content-permissions")
    expect(categoryPermission("post", "view")).toBe("category.post.view")
    expect(categoryPermission("post", "manage")).toBe("category.post.manage")
  })
})