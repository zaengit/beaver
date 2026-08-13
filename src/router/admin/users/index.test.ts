import { describe, expect, it, vi } from "vitest"

const createUser = vi.fn()
const can = vi.fn()
const canAny = vi.fn()

vi.mock("zadm/app/services/users", () => ({
  createUser,
  listUsersPaginated: vi.fn(() => ({
    success: true,
    data: {
      data: [],
      meta: {
        currentPage: 1,
        perPage: 20,
        total: 0,
        lastPage: 1,
        from: 0,
        to: 0,
      },
    },
  })),
}))

vi.mock("zadm/app/admin/permissions", () => ({
  can,
  canAny,
}))

describe("POST /api/admin/users", () => {
  it("creates a user when authenticated and authorized", async () => {
    canAny.mockResolvedValue(true)
    createUser.mockResolvedValue({
      success: true,
      data: { id: "user_123", name: "Jane Doe" },
      message: "User created.",
    })

    const { POST } = await import("./index")
    const response = await POST({
      request: new Request("http://localhost/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Jane Doe",
          email: "jane@example.com",
          password: "password123",
        }),
      }),
      locals: { session: { user: { id: "admin_123" } } },
    } as never)

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: "User created.",
      data: { id: "user_123" },
    })
    expect(createUser).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    })
  })
})
