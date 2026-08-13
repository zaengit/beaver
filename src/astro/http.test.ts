import { describe, expect, it, vi } from "vitest"

vi.mock("../router/app", () => ({
  apiApp: { fetch: vi.fn().mockResolvedValue(new Response("api-ok")) },
}))

describe("astro http ALL handler", () => {
  it("exports prerender = false", async () => {
    const { prerender } = await import("./http")
    expect(prerender).toBe(false)
  })

  it("returns 404 outside the public API path", async () => {
    const { ALL } = await import("./http")
    const ctx = { url: new URL("http://localhost/cms"), request: new Request("http://localhost/cms") }
    const r = await ALL(ctx as any)
    expect(r.status).toBe(404)
  })

  it("returns 404 for non-API paths", async () => {
    const { ALL } = await import("./http")
    const ctx = { url: new URL("http://localhost/cms?request=%2Fother"), request: new Request("http://localhost/cms?request=%2Fother") }
    const r = await ALL(ctx as any)
    expect(r.status).toBe(404)
  })

  it("forwards valid /api requests to apiApp.fetch", async () => {
    const { apiApp } = await import("../router/app")
    vi.mocked(apiApp.fetch).mockResolvedValue(new Response("posts", { status: 200 }))
    const { ALL } = await import("./http")
    const ctx = { url: new URL("http://localhost/cms?request=%2Fapi%2Fposts"), request: new Request("http://localhost/cms?request=%2Fapi%2Fposts") }
    const r = await ALL(ctx as any)
    expect(apiApp.fetch).toHaveBeenCalled()
    expect(await r.text()).toBe("posts")
  })
})
