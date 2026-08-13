import { describe, expect, it, vi } from "vitest"

vi.mock("zadm/app/services/posts", () => ({
  listPosts: vi.fn(() => ({
    success: true,
    data: {
      data: [{ id: "post_123", title: "Hello", status: "draft", type: "post", updatedAt: 1 }],
      meta: { currentPage: 1, perPage: 20, total: 1, lastPage: 1, from: 1, to: 1 },
    },
  })),
}))

vi.mock("zadm/app/handlers/posts", () => ({
  handleListPosts: vi.fn(() => new Response(JSON.stringify({ success: true }), { status: 200 })),
  handleCreatePost: vi.fn(),
}))

describe("GET /api/admin/posts", () => {
  it("returns the posts list", async () => {
    const { GET } = await import("./index")
    const response = await GET({
      request: new Request("http://localhost/api/admin/posts"),
      locals: { session: { user: { id: "user_123" } } },
    } as never)
    expect(response.status).toBe(200)
  })
})
