import { afterEach, describe, expect, it, vi } from "vitest"

import { adminApiGet, setAdminUnauthorizedHandler } from "zadm/ui/admin/shared/api-client"

describe("adminApiGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    setAdminUnauthorizedHandler(null)
  })

  it("refreshes an expired access token and retries the request once", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: "Unauthorized." }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { roles: [] } }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(adminApiGet<{ roles: unknown[] }>("/api/admin/roles")).resolves.toEqual({ roles: [] })

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/admin/roles", expect.objectContaining({ credentials: "include" }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/admin/roles", expect.objectContaining({ credentials: "include" }))
  })

  it("returns the unauthorized error when refresh fails", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: "Unauthorized." }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: "Unauthorized." }), { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(adminApiGet("/api/admin/roles")).rejects.toThrow("Unauthorized.")
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("notifies the session owner when the retry remains unauthorized", async () => {
    const onUnauthorized = vi.fn()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: "Unauthorized." }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: "Unauthorized." }), { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)
    setAdminUnauthorizedHandler(onUnauthorized)

    await expect(adminApiGet("/api/admin/roles")).rejects.toThrow("Unauthorized.")

    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })
})
