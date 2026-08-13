import { describe, expect, it, vi } from "vitest"

vi.mock("astro:middleware", () => ({
  defineMiddleware: (handler: any) => handler,
}))

vi.mock("../app/admin/admin-path", () => ({
  ADMIN_PATH: "/admin",
}))


const createCtx = (pathname: string) => {
  const locals: Record<string, unknown> = {}
  return {
    url: new URL(`http://localhost${pathname}`),
    request: new Request(`http://localhost${pathname}`),
    locals,
    rewrite: vi.fn().mockResolvedValue(new Response("rewritten")),
  }
}

describe("onRequest middleware", () => {
  it("calls next() for normal paths", async () => {
    const { onRequest } = await import("./middleware")
    const ctx = createCtx("/")
    const next = vi.fn().mockResolvedValue(new Response("page"))
    const res = await onRequest(ctx as any, next)
    expect(next).toHaveBeenCalled()
    expect(await res.text()).toBe("page")
  })

  it("rewrites /admin to /__cms/control-panel", async () => {
    const { onRequest } = await import("./middleware")
    const ctx = createCtx("/admin")
    await onRequest(ctx as any, vi.fn())
    expect(ctx.rewrite).toHaveBeenCalled()
  })

  it("rewrites /admin/sub/path to control-panel", async () => {
    const { onRequest } = await import("./middleware")
    const ctx = createCtx("/admin/users/edit")
    await onRequest(ctx as any, vi.fn())
    expect(ctx.rewrite).toHaveBeenCalled()
  })

  it("rewrites /api path to /__cms/http", async () => {
    const { onRequest } = await import("./middleware")
    const ctx = createCtx("/api/posts")
    await onRequest(ctx as any, vi.fn())
    expect(ctx.rewrite).toHaveBeenCalled()
  })

  it("blocks direct /__cms/ access with 404", async () => {
    const { onRequest } = await import("./middleware")
    const ctx = createCtx("/__cms/x")
    const res = await onRequest(ctx as any, vi.fn())
    expect(res.status).toBe(404)
  })

  it("allows /__cms/ when internally rewritten", async () => {
    const { onRequest } = await import("./middleware")
    const ctx = createCtx("/__cms/panel")
    ctx.locals.__zadmInternalRewrite = true
    const next = vi.fn().mockResolvedValue(new Response("ok"))
    const res = await onRequest(ctx as any, next)
    expect(res.status).toBe(200)
  })
})
