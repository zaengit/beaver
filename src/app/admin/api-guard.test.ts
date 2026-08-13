import { describe, expect, it, vi } from "vitest"

import {
  buildAdminAccessCookieOptions,
  buildAdminRefreshCookieOptions,
  readAdminAccessToken,
  readAdminRefreshToken,
} from "zadm/app/admin/auth-cookies"

describe("admin auth cookie helpers", () => {
  it("reads admin cookies and marks them httpOnly", () => {
    const cookies = {
      get(name: string) {
        if (name === "admin_access_token") return { value: "access" }
        if (name === "admin_refresh_token") return { value: "refresh" }
        return undefined
      },
      set() {},
    }

    expect(readAdminAccessToken(cookies)).toBe("access")
    expect(readAdminRefreshToken(cookies)).toBe("refresh")
    expect(buildAdminAccessCookieOptions().httpOnly).toBe(true)
    expect(buildAdminRefreshCookieOptions().httpOnly).toBe(true)
  })
})

describe("admin api guard", () => {
  it("returns null when access token is missing", async () => {
    const { getAdminSession } = await import("zadm/app/admin/api-guard")
    const result = await getAdminSession({
      get() {
        return undefined
      },
      set() {},
    })
    expect(result).toBeNull()
  })
})
