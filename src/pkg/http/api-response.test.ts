import { describe, expect, it } from "vitest"

describe("api-response factories", () => {
  it("ok returns 200 with data", async () => {
    const { ok } = await import("./api-response")
    const res = ok("Success", { name: "test" })
    expect(res.success).toBe(true)
    expect(res.status).toBe(200)
    expect(res.data).toEqual({ name: "test" })
  })

  it("created returns 201 with data", async () => {
    const { created } = await import("./api-response")
    const res = created("Created", { id: "1" })
    expect(res.status).toBe(201)
    expect(res.data).toEqual({ id: "1" })
  })

  it("paginated returns 200 with data, meta, and links", async () => {
    const { paginated } = await import("./api-response")
    const res = paginated(
      "OK",
      [{ id: "1" }],
      { current_page: 1, from: 1, last_page: 5, path: "/api/posts", per_page: 10, to: 10, total: 50 },
      { first: "/api/posts?page=1", last: "/api/posts?page=5", prev: null, next: "/api/posts?page=2" }
    )
    expect(res.status).toBe(200)
    expect(res.data).toHaveLength(1)
    expect(res.meta).toBeDefined()
    expect(res.links).toBeDefined()
  })

  it("badRequest returns 400", async () => {
    const { badRequest } = await import("./api-response")
    const res = badRequest("Invalid input")
    expect(res.status).toBe(400)
    expect(res.message).toBe("Invalid input")
  })

  it("unauthorized returns 401", async () => {
    const { unauthorized } = await import("./api-response")
    const res = unauthorized()
    expect(res.status).toBe(401)
  })

  it("forbidden returns 403", async () => {
    const { forbidden } = await import("./api-response")
    const res = forbidden()
    expect(res.status).toBe(403)
  })

  it("notFound returns 404", async () => {
    const { notFound } = await import("./api-response")
    const res = notFound()
    expect(res.status).toBe(404)
  })

  it("conflict returns 409", async () => {
    const { conflict } = await import("./api-response")
    const res = conflict("Already exists")
    expect(res.status).toBe(409)
  })

  it("unprocessableEntity returns 422", async () => {
    const { unprocessableEntity } = await import("./api-response")
    const res = unprocessableEntity("Invalid", { name: ["Required"] })
    expect(res.status).toBe(422)
  })

  it("tooManyRequests returns 429", async () => {
    const { tooManyRequests } = await import("./api-response")
    const res = tooManyRequests()
    expect(res.status).toBe(429)
  })

  it("internalServerError returns 500", async () => {
    const { internalServerError } = await import("./api-response")
    const res = internalServerError()
    expect(res.status).toBe(500)
  })
})