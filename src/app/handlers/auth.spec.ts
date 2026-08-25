import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUserByEmailMock,
  isConfiguredSuperAdminEmailMock,
  isRateLimitAvailableMock,
  isTwoFactorEnabledMock,
  isWithinRateLimitMock,
  resetRateLimitMock,
  verifyPasswordMock,
} = vi.hoisted(() => ({
  getUserByEmailMock: vi.fn(),
  isConfiguredSuperAdminEmailMock: vi.fn(),
  isRateLimitAvailableMock: vi.fn(),
  isTwoFactorEnabledMock: vi.fn(),
  isWithinRateLimitMock: vi.fn(),
  resetRateLimitMock: vi.fn(),
  verifyPasswordMock: vi.fn(),
}))

vi.mock("@zbeaver/beaver/app/auth", () => ({
  verifyPassword: verifyPasswordMock,
}))

vi.mock("@zbeaver/beaver/app/services/users", () => ({
  getUserByEmail: getUserByEmailMock,
}))

vi.mock("@zbeaver/beaver/app/services/two-factor", () => ({
  isTwoFactorEnabled: isTwoFactorEnabledMock,
}))

vi.mock("@zbeaver/beaver/app/admin/super-admin", () => ({
  authenticateSuperAdmin: vi.fn(),
  isConfiguredSuperAdminEmail: isConfiguredSuperAdminEmailMock,
}))

vi.mock("@zbeaver/beaver/app/security/rate-limit", () => ({
  isRateLimitAvailable: isRateLimitAvailableMock,
  isWithinRateLimit: isWithinRateLimitMock,
  resetRateLimit: resetRateLimitMock,
}))

import { handlePasswordLogin } from "./auth"

describe("failed-login rate limits", () => {
  beforeEach(() => {
    getUserByEmailMock.mockReset()
    isConfiguredSuperAdminEmailMock.mockReset()
    isRateLimitAvailableMock.mockReset()
    isTwoFactorEnabledMock.mockReset()
    isWithinRateLimitMock.mockReset()
    resetRateLimitMock.mockReset()
    verifyPasswordMock.mockReset()

    isConfiguredSuperAdminEmailMock.mockReturnValue(false)
    isRateLimitAvailableMock.mockReturnValue(true)
    isTwoFactorEnabledMock.mockResolvedValue(false)
    getUserByEmailMock.mockResolvedValue({
      success: true,
      data: {
        id: "user-1",
        name: "Test User",
        email: "a@mail.com",
        password: "password-hash",
        role: "author",
        emailVerified: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    })
  })

  it("counts invalid credentials as failures", async () => {
    verifyPasswordMock.mockResolvedValue(false)

    const result = await handlePasswordLogin({
      email: "a@mail.com",
      password: "wrong-password",
    }, "203.0.113.10")

    expect(result).toMatchObject({ success: false, status: 401 })
    expect(isWithinRateLimitMock).toHaveBeenCalledTimes(3)
    expect(resetRateLimitMock).not.toHaveBeenCalled()
  })

  it("allows valid credentials even when the failure budget is exhausted", async () => {
    isRateLimitAvailableMock.mockReturnValue(false)
    verifyPasswordMock.mockResolvedValue(true)

    const result = await handlePasswordLogin({
      email: "a@mail.com",
      password: "correct-password",
    }, "203.0.113.10")

    expect(result).toMatchObject({ success: true, status: 200 })
    expect(isWithinRateLimitMock).not.toHaveBeenCalled()
    expect(resetRateLimitMock).toHaveBeenCalledTimes(3)
  })

  it("returns 429 only after the failed-login limit is reached", async () => {
    isRateLimitAvailableMock.mockReturnValue(false)
    verifyPasswordMock.mockResolvedValue(false)

    const result = await handlePasswordLogin({
      email: "a@mail.com",
      password: "wrong-password",
    }, "203.0.113.10")

    expect(result).toMatchObject({
      success: false,
      status: 429,
      message: "Too many requests. Please try again later.",
    })
    expect(isWithinRateLimitMock).not.toHaveBeenCalled()
  })
})
