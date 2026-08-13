import { describe, it, expect, beforeEach, vi } from "vitest"

const mockRepo = {
  findUserByIdRecord: vi.fn(),
  findUserByEmailRecord: vi.fn(),
  listUsersPaginatedRecord: vi.fn(),
  userCountByRoleRecord: vi.fn(),
  createUserRecord: vi.fn(),
  updateUserRecord: vi.fn(),
  deleteUserRecord: vi.fn(),
}

vi.mock("zadm/app/repositories/users", () => mockRepo)

vi.mock("zadm/app/auth", () => ({
  hashPassword: vi.fn((pw: string) => Promise.resolve(`hashed_${pw}`)),
}))

vi.mock("zadm/pkg/utils/index", () => ({
  generateId: vi.fn(() => "new-id-123"),
  getCurrentTimestamp: vi.fn(() => 1700000000000),
}))

const makeUserRow = (overrides: Record<string, unknown> = {}) => ({
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  password: "secret-hash",
  roleId: "role-1",
  emailVerified: 0,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  ...overrides,
})

const makeUserSafe = (overrides: Record<string, unknown> = {}) => {
  const { password, ...safe } = makeUserRow(overrides)
  return safe
}

describe("users service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getUser", () => {
    it("returns user without password field", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      const { getUser } = await import("./users")
      const result = getUser("user-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty("password")
        expect(result.data.name).toBe("John Doe")
      }
    })

    it("returns not_found for non-existent user", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(null)
      const { getUser } = await import("./users")
      const result = getUser("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("getUserByEmail", () => {
    it("returns user by email", async () => {
      mockRepo.findUserByEmailRecord.mockReturnValue(makeUserRow())
      const { getUserByEmail } = await import("./users")
      const result = getUserByEmail("john@example.com")

      expect(result.success).toBe(true)
    })

    it("returns not_found when email not found", async () => {
      mockRepo.findUserByEmailRecord.mockReturnValue(null)
      const { getUserByEmail } = await import("./users")
      const result = getUserByEmail("unknown@example.com")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("listUsersAction", () => {
    it("returns users list", async () => {
      mockRepo.listUsersPaginatedRecord.mockReturnValue({ data: [makeUserSafe()], meta: {} })
      const { listUsersAction } = await import("./users")
      const result = listUsersAction()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
    })
  })

  describe("listUsersPaginated", () => {
    it("returns paginated users", async () => {
      const paginated = {
        data: [makeUserSafe()],
        meta: { currentPage: 1, perPage: 10, total: 1, lastPage: 1, from: 1, to: 1 },
      }
      mockRepo.listUsersPaginatedRecord.mockReturnValue(paginated)
      const { listUsersPaginated } = await import("./users")
      const result = listUsersPaginated({ page: 1, perPage: 10 })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.meta).toEqual(paginated.meta)
      }
    })
  })

  describe("createUser", () => {
    it("creates a user with hashed password", async () => {
      mockRepo.findUserByEmailRecord.mockReturnValue(null)
      mockRepo.createUserRecord.mockReturnValue(makeUserSafe())

      const { createUser } = await import("./users")
      const result = await createUser({ name: "Jane", email: "jane@example.com", password: "pass123" })

      expect(result.success).toBe(true)
      expect(mockRepo.createUserRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane",
          email: "jane@example.com",
          passwordHash: "hashed_pass123",
        })
      )
    })

    it("returns conflict on duplicate email", async () => {
      mockRepo.findUserByEmailRecord.mockReturnValue(makeUserRow())

      const { createUser } = await import("./users")
      const result = await createUser({ name: "Jane", email: "john@example.com", password: "pass" })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("conflict")
        expect(result.error.message).toBe("A user with this email already exists.")
      }
    })
  })

  describe("updateUser", () => {
    it("updates user successfully", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      mockRepo.findUserByEmailRecord.mockReturnValue(null)
      mockRepo.updateUserRecord.mockReturnValue(makeUserSafe({ name: "Updated" }))

      const { updateUser } = await import("./users")
      const result = await updateUser("user-1", { name: "Updated" }, "admin-id")

      expect(result.success).toBe(true)
    })

    it("prevents changing own role", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())

      const { updateUser } = await import("./users")
      const result = await updateUser("user-1", { roleId: "admin-role" }, "user-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("forbidden")
        expect(result.error.message).toBe("You cannot change your own role.")
      }
    })

    it("allows admin to change another user's role", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      mockRepo.updateUserRecord.mockReturnValue(makeUserSafe({ roleId: "new-role" }))

      const { updateUser } = await import("./users")
      const result = await updateUser("user-1", { roleId: "new-role" }, "admin-id")

      expect(result.success).toBe(true)
    })
  })

  describe("deleteUser", () => {
    it("deletes a user", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      const { deleteUser } = await import("./users")
      const result = deleteUser("user-1", "admin-id")

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
      expect(mockRepo.deleteUserRecord).toHaveBeenCalledWith("user-1")
    })

    it("prevents self-deletion", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      const { deleteUser } = await import("./users")
      const result = deleteUser("user-1", "user-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("forbidden")
        expect(result.error.message).toBe("You cannot delete your own account.")
      }
      expect(mockRepo.deleteUserRecord).not.toHaveBeenCalled()
    })

    it("returns not_found for non-existent user", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(null)
      const { deleteUser } = await import("./users")
      const result = deleteUser("nonexistent", "admin-id")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("duplicateUser", () => {
    it("duplicates a user with unique email", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      mockRepo.findUserByEmailRecord.mockReturnValue(null)
      mockRepo.createUserRecord.mockReturnValue(makeUserSafe({ id: "new-id", name: "John Doe (Copy)" }))

      const { duplicateUser } = await import("./users")
      const result = duplicateUser("user-1", "admin-id")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("John Doe (Copy)")
      }
    })
  })

  describe("bulkDeleteUsers", () => {
    it("deletes multiple users", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      const { bulkDeleteUsers } = await import("./users")
      const result = bulkDeleteUsers(["user-1", "user-2"], "admin-id")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].success).toBe(true)
      }
    })
  })

  describe("bulkDuplicateUsers", () => {
    it("duplicates multiple users", async () => {
      mockRepo.findUserByIdRecord.mockReturnValue(makeUserRow())
      mockRepo.findUserByEmailRecord.mockReturnValue(null)
      mockRepo.createUserRecord.mockReturnValue(makeUserSafe({ id: "new-id" }))

      const { bulkDuplicateUsers } = await import("./users")
      const result = bulkDuplicateUsers(["user-1"], "admin-id")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0]).toEqual({ id: "user-1", success: true, newId: "new-id" })
      }
    })
  })
})