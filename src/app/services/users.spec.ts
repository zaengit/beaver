import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  deleteRefreshSessionsForUserMock,
  deleteTwoFactorRecordMock,
  findSafeUserByIdRecordMock,
  findTwoFactorRecordMock,
  findUserByIdRecordMock,
  hasAdminPermissionMock,
  isTwoFactorEnabledMock,
  loadAdminActorMock,
} = vi.hoisted(() => ({
  deleteRefreshSessionsForUserMock: vi.fn(),
  deleteTwoFactorRecordMock: vi.fn(),
  findSafeUserByIdRecordMock: vi.fn(),
  findTwoFactorRecordMock: vi.fn(),
  findUserByIdRecordMock: vi.fn(),
  hasAdminPermissionMock: vi.fn(),
  isTwoFactorEnabledMock: vi.fn(),
  loadAdminActorMock: vi.fn(),
}))

vi.mock("@zbeaver/beaver/app/auth", () => ({
  hashPassword: vi.fn(),
}))

vi.mock("@zbeaver/beaver/app/repositories/users", () => ({
  findUserByIdRecord: findUserByIdRecordMock,
  findUserByEmailRecord: vi.fn(),
  findSafeUserByIdRecord: findSafeUserByIdRecordMock,
  listUsersPaginatedRecord: vi.fn(),
  createUserRecord: vi.fn(),
  updateUserRecord: vi.fn(),
  deleteUserRecord: vi.fn(),
}))

vi.mock("@zbeaver/beaver/app/admin/authorization", () => ({
  canAssignRole: vi.fn(),
  canManageSensitiveUserFields: vi.fn(),
  hasAdminPermission: hasAdminPermissionMock,
  hasAnyAdminPermission: vi.fn(),
  loadAdminActor: loadAdminActorMock,
}))

vi.mock("@zbeaver/beaver/app/admin/session-store", () => ({
  deleteRefreshSessionsForUser: deleteRefreshSessionsForUserMock,
}))

vi.mock("@zbeaver/beaver/app/repositories/two-factor", () => ({
  deleteTwoFactorRecord: deleteTwoFactorRecordMock,
  findTwoFactorRecord: findTwoFactorRecordMock,
}))

vi.mock("@zbeaver/beaver/app/services/two-factor", () => ({
  isTwoFactorEnabled: isTwoFactorEnabledMock,
}))

import { disableUserTwoFactor, getUser } from "./users"

describe("admin user two-factor controls", () => {
  beforeEach(() => {
    deleteRefreshSessionsForUserMock.mockReset()
    deleteTwoFactorRecordMock.mockReset()
    findSafeUserByIdRecordMock.mockReset()
    findTwoFactorRecordMock.mockReset()
    findUserByIdRecordMock.mockReset()
    hasAdminPermissionMock.mockReset()
    isTwoFactorEnabledMock.mockReset()
    loadAdminActorMock.mockReset()

    loadAdminActorMock.mockResolvedValue({
      id: "admin-id",
      role: "admin",
      isSuperAdmin: false,
      permissions: new Set(["users.manage"]),
    })
    hasAdminPermissionMock.mockReturnValue(true)
    findUserByIdRecordMock.mockResolvedValue({ id: "target-id", role: "author" })
  })

  it("returns the target user's 2FA status in the edit payload", async () => {
    findSafeUserByIdRecordMock.mockResolvedValue({
      id: "target-id",
      name: "Target User",
      email: "target@example.com",
      role: "author",
      emailVerified: 1,
      createdAt: 1,
      updatedAt: 1,
    })
    isTwoFactorEnabledMock.mockResolvedValue(true)

    const result = await getUser("target-id")

    expect(result.success).toBe(true)
    if (result.success) expect(result.data.twoFactorEnabled).toBe(true)
  })

  it("removes enabled 2FA and invalidates the target user's sessions", async () => {
    findTwoFactorRecordMock.mockResolvedValue({ userId: "target-id", enabled: 1 })

    const result = await disableUserTwoFactor("target-id", "admin-id")

    expect(result).toEqual({
      success: true,
      data: { enabled: false },
      message: "Two-factor authentication disabled.",
    })
    expect(deleteTwoFactorRecordMock).toHaveBeenCalledWith("target-id")
    expect(deleteRefreshSessionsForUserMock).toHaveBeenCalledWith("target-id")
  })

  it("does not allow an admin to disable their own 2FA here", async () => {
    const result = await disableUserTwoFactor("admin-id", "admin-id")

    expect(result).toMatchObject({
      success: false,
      error: { code: "forbidden" },
    })
    expect(findTwoFactorRecordMock).not.toHaveBeenCalled()
    expect(deleteTwoFactorRecordMock).not.toHaveBeenCalled()
  })

  it("does not delete anything when 2FA is not enabled", async () => {
    findTwoFactorRecordMock.mockResolvedValue({ userId: "target-id", enabled: 0 })

    const result = await disableUserTwoFactor("target-id", "admin-id")

    expect(result).toMatchObject({
      success: false,
      error: {
        code: "validation",
        message: "Two-factor authentication is not enabled.",
      },
    })
    expect(deleteTwoFactorRecordMock).not.toHaveBeenCalled()
    expect(deleteRefreshSessionsForUserMock).not.toHaveBeenCalled()
  })
})
