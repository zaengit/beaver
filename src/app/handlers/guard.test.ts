import { describe, expect, it, beforeEach, vi } from "vitest"

const mockSessionStore = {
  validateSession: vi.fn(),
  getSession: vi.fn(),
  createSession: vi.fn(),
  destroySession: vi.fn(),
  refreshSession: vi.fn(),
}

vi.mock("zadm/app/admin/session-store", () => mockSessionStore)

const mockCookieOptions = {
  name: "cms_session",
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 86400,
}

vi.mock("zadm/app/admin/auth-cookies", () => ({
  COOKIE_OPTIONS: mockCookieOptions,
  parseAuthCookies: vi.fn(() => ({ sessionToken: "token-123" })),
  setSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
}))

vi.mock("zadm/app/admin/permissions", () => ({
  can: vi.fn(),
  canAny: vi.fn(),
}))

describe("requireAuth", () => {
  it("returns null when session has user", async () => {
    const { requireAuth } = await import("./guard")
    const result = requireAuth({ user: { id: "user-1" } } as any)
    expect(result).toBeNull()
  })

  it("returns error response when session has no user", async () => {
    const { requireAuth } = await import("./guard")
    const result = requireAuth({} as any)
    expect(result).toBeDefined()
    expect(result!.status).toBe(401)
  })

  it("returns error response when session is null", async () => {
    const { requireAuth } = await import("./guard")
    const result = requireAuth(null as any)
    expect(result).toBeDefined()
    expect(result!.status).toBe(401)
  })
})

describe("requirePermission", () => {
  it("returns null when user has permission", async () => {
    const { can } = await import("zadm/app/admin/permissions")
    ;(can as ReturnType<typeof vi.fn>).mockResolvedValue(true)

    const { requirePermission } = await import("./guard")
    const result = await requirePermission({ user: { id: "user-1" } } as any, "view_posts")
    expect(result).toBeNull()
  })

  it("returns 403 when user lacks permission", async () => {
    const { can } = await import("zadm/app/admin/permissions")
    ;(can as ReturnType<typeof vi.fn>).mockResolvedValue(false)

    const { requirePermission } = await import("./guard")
    const result = await requirePermission({ user: { id: "user-1" } } as any, "delete_posts")
    expect(result).toBeDefined()
    expect(result!.status).toBe(403)
  })

  it("returns 401 when session has no user", async () => {
    const { requirePermission } = await import("./guard")
    const result = await requirePermission({} as any, "view_posts")
    expect(result).toBeDefined()
    expect(result!.status).toBe(401)
  })

  it("returns 401 when session is null", async () => {
    const { requirePermission } = await import("./guard")
    const result = await requirePermission(null as any, "view_posts")
    expect(result).toBeDefined()
    expect(result!.status).toBe(401)
  })
})

describe("requireAnyPermission", () => {
  it("returns null when user has any of the permissions", async () => {
    const { canAny } = await import("zadm/app/admin/permissions")
    ;(canAny as ReturnType<typeof vi.fn>).mockResolvedValue(true)

    const { requireAnyPermission } = await import("./guard")
    const result = await requireAnyPermission({ user: { id: "user-1" } } as any, ["view_posts", "edit_posts"])
    expect(result).toBeNull()
  })

  it("returns 403 when user lacks all permissions", async () => {
    const { canAny } = await import("zadm/app/admin/permissions")
    ;(canAny as ReturnType<typeof vi.fn>).mockResolvedValue(false)

    const { requireAnyPermission } = await import("./guard")
    const result = await requireAnyPermission({ user: { id: "user-1" } } as any, ["delete_users", "manage_system"])
    expect(result).toBeDefined()
    expect(result!.status).toBe(403)
  })

  it("returns 401 when session has no user", async () => {
    const { requireAnyPermission } = await import("./guard")
    const result = await requireAnyPermission({} as any, ["view_posts"])
    expect(result).toBeDefined()
    expect(result!.status).toBe(401)
  })

  it("returns 401 when session is null", async () => {
    const { requireAnyPermission } = await import("./guard")
    const result = await requireAnyPermission(null as any, ["view_posts"])
    expect(result).toBeDefined()
    expect(result!.status).toBe(401)
  })
})
