import { beforeEach, describe, expect, it, vi } from "vitest"

const { getAdminSessionMock, refreshAdminSessionMock } = vi.hoisted(() => ({
  getAdminSessionMock: vi.fn(),
  refreshAdminSessionMock: vi.fn(),
}))

vi.mock("@zbeaver/beaver/app/admin/api-guard", () => ({
  getAdminSession: getAdminSessionMock,
  refreshAdminSession: refreshAdminSessionMock,
}))

import { GET } from "./session"

describe("admin session route", () => {
  beforeEach(() => {
    getAdminSessionMock.mockReset()
    refreshAdminSessionMock.mockReset()
  })

  it("passes the 2FA status through to the admin UI", async () => {
    getAdminSessionMock.mockResolvedValue({
      user: { id: "user-1", role: "admin" },
      permissions: ["dashboard.view"],
      twoFactorEnabled: true,
    })

    const response = await GET({ cookies: {} } as Parameters<typeof GET>[0])
    const body = await response.json()

    expect(body.data.twoFactorEnabled).toBe(true)
  })
})
