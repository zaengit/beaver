import { beforeEach, describe, expect, it, vi } from "vitest"

const handleUploadMedia = vi.fn()

vi.mock("zadm/app/handlers/media", () => ({
  handleUploadMedia,
}))

describe("POST /api/admin/media/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when there is no authenticated session", async () => {
    handleUploadMedia.mockResolvedValue(
      Response.json({
        success: false,
        message: "Unauthorized.",
      }, { status: 401 }),
    )
    const { POST } = await import("./upload")

    const response = await POST({
      request: new Request("http://localhost/api/admin/media/upload", {
        method: "POST",
        body: new FormData(),
      }),
      locals: { session: null },
    } as never)

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      message: "Unauthorized.",
    })
    expect(handleUploadMedia).toHaveBeenCalledWith(null, expect.any(FormData))
  })

  it("uploads media for an authorized session", async () => {
    const formData = new FormData()
    formData.set(
      "file",
      new File(["hello"], "hello.txt", { type: "text/plain" }),
    )

    handleUploadMedia.mockResolvedValue(
      Response.json({
        success: true,
        message: "Media uploaded.",
        data: { id: "media_123" },
      }),
    )

    const { POST } = await import("./upload")
    const response = await POST({
      request: new Request("http://localhost/api/admin/media/upload", {
        method: "POST",
        body: formData,
      }),
      locals: { session: { user: { id: "user_123" } } },
    } as never)

    expect(handleUploadMedia).toHaveBeenCalledTimes(1)
    expect(handleUploadMedia).toHaveBeenCalledWith(
      {
        user: { id: "user_123" },
      },
      expect.any(FormData),
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      message: "Media uploaded.",
      data: { id: "media_123" },
    })
  })
})
