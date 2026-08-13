import { describe, expect, it, vi } from "vitest"

const createRole = vi.fn()
const can = vi.fn()

vi.mock("zadm/app/services/roles", () => ({
  createRole,
}))

vi.mock("zadm/app/admin/permissions", () => ({
  can,
}))

describe("POST /api/admin/roles", () => {
  it("creates a role when authenticated and authorized", async () => {
    can.mockResolvedValue(true)
    createRole.mockReturnValue({
      success: true,
      data: { id: "role_123", name: "Editor" },
      message: "Role created.",
    })

    const { POST } = await import("./index")
    const response = await POST({
      request: new Request("http://localhost/api/admin/roles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Editor",
          permissionIds: ["01ARZ3NDEKTSV4RRFFQ69G5FAV"],
        }),
      }),
      locals: { session: { user: { id: "admin_123" } } },
    } as never)

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: "Role created.",
      data: { id: "role_123" },
    })
    expect(createRole).toHaveBeenCalledWith({
      name: "Editor",
      permissionIds: ["01ARZ3NDEKTSV4RRFFQ69G5FAV"],
    })
  })
})
