import { describe, it, expect } from "vitest"
import {
  createRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
} from "./roles"

// Valid ULID for testing
const validUlid = "01ARZ3NDEKTSV4RRFFQ69G5FAV"

describe("createRoleSchema", () => {
  it("accepts valid create role data", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid data with optional slug", () => {
    const result = createRoleSchema.safeParse({
      name: "Content Editor",
      slug: "content-editor",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid data with description", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      description: "Can edit posts",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBe("Can edit posts")
    }
  })

  it("transforms empty description to null", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      description: "",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it("transforms whitespace-only description to null", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      description: "   ",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it("rejects empty name", () => {
    const result = createRoleSchema.safeParse({
      name: "",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(false)
  })

  it("rejects name longer than 100 characters", () => {
    const result = createRoleSchema.safeParse({
      name: "a".repeat(101),
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid slug format", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      slug: "Invalid Slug!",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(false)
  })

  it("rejects slug with uppercase letters", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      slug: "Content-Editor",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty permissionIds array", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      permissionIds: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing permissionIds", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid ULID in permissionIds", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      permissionIds: ["not-a-ulid"],
    })
    expect(result.success).toBe(false)
  })

  it("accepts multiple valid permission IDs", () => {
    const result = createRoleSchema.safeParse({
      name: "Editor",
      permissionIds: [validUlid, "01BX5ZZKBKACTAV9WEVGEMMVRY"],
    })
    expect(result.success).toBe(true)
  })
})

describe("updateRoleSchema", () => {
  it("accepts valid update with name only", () => {
    const result = updateRoleSchema.safeParse({
      name: "Senior Editor",
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid update with description only", () => {
    const result = updateRoleSchema.safeParse({
      description: "Updated description",
    })
    expect(result.success).toBe(true)
  })

  it("accepts valid update with permissionIds only", () => {
    const result = updateRoleSchema.safeParse({
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(true)
  })

  it("accepts empty object (no fields to update)", () => {
    const result = updateRoleSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("transforms empty description to null", () => {
    const result = updateRoleSchema.safeParse({
      description: "",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it("rejects name shorter than 1 character when provided", () => {
    const result = updateRoleSchema.safeParse({
      name: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects name longer than 100 characters", () => {
    const result = updateRoleSchema.safeParse({
      name: "a".repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid ULID in permissionIds", () => {
    const result = updateRoleSchema.safeParse({
      permissionIds: ["invalid"],
    })
    expect(result.success).toBe(false)
  })

  it("accepts all fields together", () => {
    const result = updateRoleSchema.safeParse({
      name: "Updated Role",
      description: "New description",
      permissionIds: [validUlid],
    })
    expect(result.success).toBe(true)
  })
})

describe("assignRoleSchema", () => {
  it("accepts valid userId and roleId", () => {
    const result = assignRoleSchema.safeParse({
      userId: validUlid,
      roleId: "01BX5ZZKBKACTAV9WEVGEMMVRY",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing userId", () => {
    const result = assignRoleSchema.safeParse({
      roleId: validUlid,
    })
    expect(result.success).toBe(false)
  })

  it("rejects missing roleId", () => {
    const result = assignRoleSchema.safeParse({
      userId: validUlid,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid userId format", () => {
    const result = assignRoleSchema.safeParse({
      userId: "not-a-ulid",
      roleId: validUlid,
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid roleId format", () => {
    const result = assignRoleSchema.safeParse({
      userId: validUlid,
      roleId: "not-a-ulid",
    })
    expect(result.success).toBe(false)
  })

  it("rejects empty strings", () => {
    const result = assignRoleSchema.safeParse({
      userId: "",
      roleId: "",
    })
    expect(result.success).toBe(false)
  })
})
