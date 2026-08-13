import { describe, expect, it } from "vitest"

describe("adminSuccess", () => {
  it("returns a Response with success:true and data", async () => {
    const { adminSuccess } = await import("./api-response")
    const response = adminSuccess({ id: 1 }, "OK")
    expect(response).toBeInstanceOf(Response)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: 1 })
    expect(body.message).toBe("OK")
    expect(response.status).toBe(200)
  })
})

describe("adminCreated", () => {
  it("returns a Response with status 201", async () => {
    const { adminCreated } = await import("./api-response")
    const response = adminCreated({ id: "new" }, "Created")
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})

describe("adminError", () => {
  it("returns a Response with success:false", async () => {
    const { adminError } = await import("./api-response")
    const response = adminError("Bad request", 400)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.message).toBe("Bad request")
  })

  it("includes field errors when provided", async () => {
    const { adminError } = await import("./api-response")
    const response = adminError("Validation failed", 422, { email: ["Invalid email"] })
    const body = await response.json()
    expect(body.errors).toEqual({ email: ["Invalid email"] })
  })

  it("defaults status to 400", async () => {
    const { adminError } = await import("./api-response")
    const response = adminError("Something went wrong")
    expect(response.status).toBe(400)
  })
})

describe("adminUnauthorized", () => {
  it("returns status 401", async () => {
    const { adminUnauthorized } = await import("./api-response")
    const response = adminUnauthorized()
    expect(response.status).toBe(401)
  })

  it("uses custom message", async () => {
    const { adminUnauthorized } = await import("./api-response")
    const response = adminUnauthorized("Access denied")
    const body = await response.json()
    expect(body.message).toBe("Access denied")
  })
})

describe("adminNotFound", () => {
  it("returns status 404", async () => {
    const { adminNotFound } = await import("./api-response")
    const response = adminNotFound()
    expect(response.status).toBe(404)
  })

  it("uses custom message", async () => {
    const { adminNotFound } = await import("./api-response")
    const response = adminNotFound("User not found")
    const body = await response.json()
    expect(body.message).toBe("User not found")
  })
})