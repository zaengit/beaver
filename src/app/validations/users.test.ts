import { describe, it, expect } from "vitest"

describe("createUserSchema", () => {
  it("accepts valid input", async () => {
    const { createUserSchema } = await import("./users")
    const result = createUserSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "password123",
      roleId: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    })
    expect(result.success).toBe(true)
  })

  it("rejects missing name", async () => {
    const { createUserSchema } = await import("./users")
    const result = createUserSchema.safeParse({
      email: "john@example.com",
      password: "password123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email", async () => {
    const { createUserSchema } = await import("./users")
    const result = createUserSchema.safeParse({
      name: "John",
      email: "not-an-email",
      password: "password123",
    })
    expect(result.success).toBe(false)
  })

  it("rejects short password", async () => {
    const { createUserSchema } = await import("./users")
    const result = createUserSchema.safeParse({
      name: "John",
      email: "john@example.com",
      password: "123",
    })
    expect(result.success).toBe(false)
  })
})

describe("updateUserSchema", () => {
  it("accepts partial update with only name", async () => {
    const { updateUserSchema } = await import("./users")
    const result = updateUserSchema.safeParse({ name: "Updated Name" })
    expect(result.success).toBe(true)
  })

  it("accepts partial update with roleId", async () => {
    const { updateUserSchema } = await import("./users")
    const result = updateUserSchema.safeParse({ roleId: "01ARZ3NDEKTSV4RRFFQ69G5FAV" })
    expect(result.success).toBe(true)
  })

  it("accepts empty object", async () => {
    const { updateUserSchema } = await import("./users")
    const result = updateUserSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("rejects invalid email in update", async () => {
    const { updateUserSchema } = await import("./users")
    const result = updateUserSchema.safeParse({ email: "bad-email" })
    expect(result.success).toBe(false)
  })
})