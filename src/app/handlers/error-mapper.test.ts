import { describe, expect, it } from "vitest"

describe("mapServiceError", () => {
  it("maps validation error to 422", async () => {
    const { mapServiceError } = await import("./error-mapper")
    const result = mapServiceError({
      error: { code: "validation", message: "Validation error.", fieldErrors: { name: ["Required"] } },
    })
    expect(result.status).toBe(422)
  })

  it("maps conflict error to 409", async () => {
    const { mapServiceError } = await import("./error-mapper")
    const result = mapServiceError({
      error: { code: "conflict", message: "A record with this email already exists." },
    })
    expect(result.status).toBe(409)
  })

  it("maps not_found error to 404", async () => {
    const { mapServiceError } = await import("./error-mapper")
    const result = mapServiceError({
      error: { code: "not_found", message: "Post not found." },
    })
    expect(result.status).toBe(404)
  })

  it("maps forbidden error to 403", async () => {
    const { mapServiceError } = await import("./error-mapper")
    const result = mapServiceError({
      error: { code: "forbidden", message: "Forbidden." },
    })
    expect(result.status).toBe(403)
  })

  it("maps unauthorized error to 401", async () => {
    const { mapServiceError } = await import("./error-mapper")
    const result = mapServiceError({
      error: { code: "unauthorized", message: "Unauthorized." },
    })
    expect(result.status).toBe(401)
  })

  it("falls back to custom status for unknown codes", async () => {
    const { mapServiceError } = await import("./error-mapper")
    const result = mapServiceError({
      error: { code: "unknown", message: "Something went wrong." },
    }, 400)
    expect(result.status).toBe(400)
  })

  it("falls back to 400 when no error object", async () => {
    const { mapServiceError } = await import("./error-mapper")
    const result = mapServiceError({})
    expect(result.status).toBe(400)
  })
})