import { describe, it, expect, beforeEach, vi } from "vitest"

const mockFindUserByIdRecord = vi.fn()
const mockUpdateUserRecord = vi.fn()
const mockFindUserByEmailRecord = vi.fn()

vi.mock("zadm/app/repositories/users", () => ({
  findUserByIdRecord: mockFindUserByIdRecord,
  updateUserRecord: mockUpdateUserRecord,
  findUserByEmailRecord: mockFindUserByEmailRecord,
}))

const mockHashPassword = vi.fn((pw: string) => Promise.resolve(`hashed_${pw}`))

vi.mock("zadm/app/auth", () => ({
  hashPassword: mockHashPassword,
}))

const mockGetCurrentTimestamp = vi.fn(() => 1700000000000)

vi.mock("zadm/pkg/utils/index", () => ({
  getCurrentTimestamp: mockGetCurrentTimestamp,
}))

const makeUserRow = (overrides: Record<string, unknown> = {}) => ({
  id: "user-1",
  name: "John",
  email: "john@example.com",
  roleId: "role-1",
  emailVerified: 0,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  ...overrides,
})

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates profile name successfully", async () => {
    mockFindUserByIdRecord.mockReturnValue(makeUserRow())
    mockUpdateUserRecord.mockReturnValue(makeUserRow({ name: "John Updated" }))

    const { updateProfile } = await import("./profile")
    const result = await updateProfile("user-1", { name: "John Updated" })

    expect(result.success).toBe(true)
    expect(mockUpdateUserRecord).toHaveBeenCalledWith("user-1", expect.objectContaining({ name: "John Updated" }))
  })

  it("updates email with uniqueness check", async () => {
    mockFindUserByIdRecord.mockReturnValue(makeUserRow())
    mockFindUserByEmailRecord.mockReturnValue(null)
    mockUpdateUserRecord.mockReturnValue(makeUserRow({ email: "new@example.com" }))

    const { updateProfile } = await import("./profile")
    const result = await updateProfile("user-1", { email: "new@example.com" })

    expect(result.success).toBe(true)
    expect(mockUpdateUserRecord).toHaveBeenCalledWith("user-1", expect.objectContaining({ email: "new@example.com" }))
  })

  it("returns conflict on duplicate email", async () => {
    mockFindUserByIdRecord.mockReturnValue(makeUserRow({ email: "old@example.com" }))
    mockFindUserByEmailRecord.mockReturnValue(makeUserRow({ id: "user-2" }))

    const { updateProfile } = await import("./profile")
    const result = await updateProfile("user-1", { email: "taken@example.com" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("conflict")
      expect(result.error.message).toBe("A user with this email already exists.")
    }
  })

  it("does not check email uniqueness when same email", async () => {
    mockFindUserByIdRecord.mockReturnValue(makeUserRow({ email: "john@example.com" }))
    mockUpdateUserRecord.mockReturnValue(makeUserRow())

    const { updateProfile } = await import("./profile")
    const result = await updateProfile("user-1", { name: "John", email: "john@example.com" })

    expect(result.success).toBe(true)
    expect(mockFindUserByEmailRecord).not.toHaveBeenCalled()
  })

  it("hashes password when changing password", async () => {
    mockFindUserByIdRecord.mockReturnValue(makeUserRow())
    mockUpdateUserRecord.mockReturnValue(makeUserRow())

    const { updateProfile } = await import("./profile")
    const result = await updateProfile("user-1", { password: "newpass123" })

    expect(result.success).toBe(true)
    expect(mockHashPassword).toHaveBeenCalledWith("newpass123")
    expect(mockUpdateUserRecord).toHaveBeenCalledWith("user-1", expect.objectContaining({ passwordHash: "hashed_newpass123" }))
  })

  it("returns not_found when user does not exist", async () => {
    mockFindUserByIdRecord.mockReturnValue(null)

    const { updateProfile } = await import("./profile")
    const result = await updateProfile("nonexistent", { name: "X" })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe("not_found")
    }
  })

  it("updates multiple fields at once", async () => {
    mockFindUserByIdRecord.mockReturnValue(makeUserRow())
    mockFindUserByEmailRecord.mockReturnValue(null)
    mockUpdateUserRecord.mockReturnValue(makeUserRow({ name: "Jane", email: "jane@example.com" }))

    const { updateProfile } = await import("./profile")
    const result = await updateProfile("user-1", { name: "Jane", email: "jane@example.com", password: "newpass" })

    expect(result.success).toBe(true)
    expect(mockUpdateUserRecord).toHaveBeenCalledWith("user-1",
      expect.objectContaining({ name: "Jane", email: "jane@example.com", passwordHash: "hashed_newpass" })
    )
  })
})