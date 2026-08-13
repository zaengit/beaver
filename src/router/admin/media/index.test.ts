import { describe, expect, it, vi } from "vitest"

vi.mock("zadm/app/services/media", () => ({
  listMediaService: vi.fn(() => ({
    success: true,
    data: {
      data: [{ id: "media_123", name: "photo.jpg", mimeType: "image/jpeg", size: 1024, createdAt: 1, updatedAt: 1 }],
      meta: { currentPage: 1, perPage: 20, total: 1, lastPage: 1, from: 1, to: 1 },
    },
  })),
}))

describe("GET /api/admin/media", () => {
  it("returns the media list", async () => {
    const { GET } = await import("./index")
    const response = await GET({ request: new Request("http://localhost/api/admin/media") } as never)
    expect(response.status).toBe(200)
  })
})
