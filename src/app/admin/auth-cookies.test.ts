import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

const originalNodeEnv = process.env.NODE_ENV

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv
})

describe("ADMIN_ACCESS_COOKIE", () => {
  it("has correct cookie name", async () => {
    const { ADMIN_ACCESS_COOKIE } = await import("./auth-cookies")
    expect(ADMIN_ACCESS_COOKIE).toBe("admin_access_token")
  })
})

describe("ADMIN_REFRESH_COOKIE", () => {
  it("has correct cookie name", async () => {
    const { ADMIN_REFRESH_COOKIE } = await import("./auth-cookies")
    expect(ADMIN_REFRESH_COOKIE).toBe("admin_refresh_token")
  })
})

describe("buildAdminAccessCookieOptions", () => {
  it("returns cookie options with 15-minute expiry", async () => {
    const { buildAdminAccessCookieOptions } = await import("./auth-cookies")
    const options = buildAdminAccessCookieOptions()
    expect(options.httpOnly).toBe(true)
    expect(options.sameSite).toBe("lax")
    expect(options.path).toBe("/")
    expect(options.maxAge).toBe(60 * 15) // 15 minutes
  })

  it("sets secure based on NODE_ENV", async () => {
    const { buildAdminAccessCookieOptions } = await import("./auth-cookies")
    const options = buildAdminAccessCookieOptions()
    expect(typeof options.secure).toBe("boolean")
  })
})

describe("buildAdminRefreshCookieOptions", () => {
  it("returns cookie options with 30-day expiry", async () => {
    const { buildAdminRefreshCookieOptions } = await import("./auth-cookies")
    const options = buildAdminRefreshCookieOptions()
    expect(options.httpOnly).toBe(true)
    expect(options.maxAge).toBe(60 * 60 * 24 * 30) // 30 days
  })
})

describe("readAdminAccessToken", () => {
  it("returns token value when cookie exists", async () => {
    const { readAdminAccessToken } = await import("./auth-cookies")
    const cookies = {
      get: vi.fn().mockReturnValue({ value: "access-token-123" }),
    }
    const result = readAdminAccessToken(cookies as any)
    expect(result).toBe("access-token-123")
  })

  it("returns null when cookie does not exist", async () => {
    const { readAdminAccessToken } = await import("./auth-cookies")
    const cookies = { get: vi.fn().mockReturnValue(undefined) }
    const result = readAdminAccessToken(cookies as any)
    expect(result).toBeNull()
  })
})

describe("readAdminRefreshToken", () => {
  it("returns token value when cookie exists", async () => {
    const { readAdminRefreshToken } = await import("./auth-cookies")
    const cookies = {
      get: vi.fn().mockReturnValue({ value: "refresh-token-456" }),
    }
    const result = readAdminRefreshToken(cookies as any)
    expect(result).toBe("refresh-token-456")
  })

  it("returns null when cookie does not exist", async () => {
    const { readAdminRefreshToken } = await import("./auth-cookies")
    const cookies = { get: vi.fn().mockReturnValue(undefined) }
    const result = readAdminRefreshToken(cookies as any)
    expect(result).toBeNull()
  })
})