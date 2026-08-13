import { describe, expect, it } from "vitest"

describe("redirectResponse", () => {
  it("returns redirect response with default 302 status", async () => {
    const { redirectResponse } = await import("./response")
    const response = redirectResponse("/new-location")
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe("/new-location")
    expect(response.body).toBeNull()
  })

  it("uses custom status code when provided", async () => {
    const { redirectResponse } = await import("./response")
    const response = redirectResponse("/permanent", 301)
    expect(response.status).toBe(301)
    expect(response.headers.get("Location")).toBe("/permanent")
  })
})