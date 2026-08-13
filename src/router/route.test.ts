import { describe, expect, it, vi } from "vitest"

vi.mock("hono/cookie", () => ({
  getCookie: vi.fn((_ctx: any, name: string) => (name === "session" ? "session-val" : undefined)),
  setCookie: vi.fn(),
}))

const createMockContext = (session: { user: { id: string } } | null = null) => ({
  req: {
    raw: new Request("http://localhost/api/test"),
    param: () => ({ id: "123" }),
  },
  get: vi.fn().mockReturnValue(session),
} as any)

describe("createAdminRouteContext", () => {
  it("returns context with request, params, cookies, and locals", async () => {
    const { createAdminRouteContext } = await import("./route")
    const mockContext = createMockContext()
    const ctx = createAdminRouteContext(mockContext)

    expect(ctx.request).toBeInstanceOf(Request)
    expect(ctx.params).toEqual({ id: "123" })
    expect(typeof ctx.cookies.get).toBe("function")
    expect(typeof ctx.cookies.set).toBe("function")
    expect(ctx.locals).toHaveProperty("session")
  })

  it("sets session to null when no session exists", async () => {
    const { createAdminRouteContext } = await import("./route")
    const mockContext = createMockContext(null)
    const ctx = createAdminRouteContext(mockContext)
    expect(ctx.locals.session).toBeNull()
  })

  it("sets session from context variable", async () => {
    const { createAdminRouteContext } = await import("./route")
    const sessionData = { user: { id: "user-1" } }
    const mockContext = createMockContext(sessionData)
    const ctx = createAdminRouteContext(mockContext)
    expect(ctx.locals.session).toEqual(sessionData)
  })

  it("get cookie returns value when cookie exists", async () => {
    const { createAdminRouteContext } = await import("./route")
    const ctx = createAdminRouteContext(createMockContext())
    const value = ctx.cookies.get("session")
    expect(value).toEqual({ value: "session-val" })
  })

  it("get cookie returns undefined when cookie does not exist", async () => {
    const { createAdminRouteContext } = await import("./route")
    const ctx = createAdminRouteContext(createMockContext())
    const value = ctx.cookies.get("nonexistent")
    expect(value).toBeUndefined()
  })

  it("set cookie calls setCookie", async () => {
    const { setCookie } = await import("hono/cookie")
    const { createAdminRouteContext } = await import("./route")
    const ctx = createAdminRouteContext(createMockContext())
    ctx.cookies.set("token", "abc123", { httpOnly: true })
    expect(setCookie).toHaveBeenCalled()
  })
})