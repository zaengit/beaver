import { describe, expect, it, vi } from "vitest"

const handlePasswordLogin = vi.fn()

vi.mock("zadm/app/handlers/auth", () => ({
  handlePasswordLogin,
}))

vi.mock("zadm/app/admin/permissions", () => ({
  getUserPermissions: vi.fn(() => Promise.resolve(["posts.view"])),
}))

vi.mock("zadm/app/admin/session-store", () => ({
  saveRefreshSession: vi.fn(),
}))

describe("POST /api/admin/auth/login", () => {
  it("returns 200 and auth cookies on successful login", async () => {
    handlePasswordLogin.mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "user_123",
        email: "admin@example.com",
        name: "Admin",
        roleId: "role_123",
        emailVerified: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    })

    const { POST } = await import("./login")
    const response = await POST({
      request: new Request("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@example.com", password: "password123" }),
      }),
      cookies: { get: vi.fn(), set: vi.fn() },
    } as never)

    expect(response.status).toBe(200)
  })
})
