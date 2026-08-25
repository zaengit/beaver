import { Hono } from "hono"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { canMock, getAdminSessionMock } = vi.hoisted(() => ({
  canMock: vi.fn(),
  getAdminSessionMock: vi.fn(),
}))

vi.mock("@zbeaver/beaver/app/admin/api-guard", () => ({
  getAdminSession: getAdminSessionMock,
}))

vi.mock("@zbeaver/beaver/app/admin/permissions", () => ({
  can: canMock,
}))

import { adminSecurity, type AdminApiEnvironment } from "./middleware"

function createApp() {
  const app = new Hono<AdminApiEnvironment>().basePath("/api")
  app.use("/admin/*", adminSecurity)
  app.post("/admin/users/:id/2fa/disable", (context) => context.json({ ok: true }))
  return app
}

describe("admin user 2FA permissions", () => {
  beforeEach(() => {
    canMock.mockReset()
    getAdminSessionMock.mockReset()
    getAdminSessionMock.mockResolvedValue({
      user: { id: "viewer" },
      permissions: [],
    })
  })

  it("requires users.manage for the disable endpoint", async () => {
    canMock.mockResolvedValue(false)

    const response = await createApp().request("http://localhost/api/admin/users/target/2fa/disable", {
      method: "POST",
    })

    expect(response.status).toBe(403)
    expect(canMock).toHaveBeenCalledWith("viewer", "users.manage")
  })

  it("allows an admin with users.manage through", async () => {
    canMock.mockImplementation(async (_userId: string, permission: string) => permission === "users.manage")

    const response = await createApp().request("http://localhost/api/admin/users/target/2fa/disable", {
      method: "POST",
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })
})
