/// <reference types="vitest/globals" />

import { adminApiGet, setAdminForbiddenHandler, setAdminUnauthorizedHandler } from "@zbeaver/beaver/ui/admin/shared/api-client"

describe("admin API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    setAdminForbiddenHandler(null)
    setAdminUnauthorizedHandler(null)
  })

  it("notifies the forbidden handler on a 403 response", async () => {
    const forbiddenHandler = vi.fn()
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, message: "Insufficient permissions." }),
      { status: 403, headers: { "content-type": "application/json" } },
    )))
    setAdminForbiddenHandler(forbiddenHandler)

    await expect(adminApiGet("/api/admin/categories?type=post")).rejects.toThrow("Insufficient permissions.")
    expect(forbiddenHandler).toHaveBeenCalledTimes(1)
  })
})
