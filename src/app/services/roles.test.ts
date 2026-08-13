import { describe, it, expect, beforeEach, vi } from "vitest"

const mockGenerateId = vi.fn(() => "new-id")
const mockGetCurrentTimestamp = vi.fn(() => 1700000000000)
const mockSlugify = vi.fn((s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-"))

vi.mock("zadm/pkg/utils/index", () => ({
  generateId: mockGenerateId,
  getCurrentTimestamp: mockGetCurrentTimestamp,
  slugify: mockSlugify,
}))

const mockRepo = {
  findRoleByIdRecord: vi.fn(),
  findRoleBySlugRecord: vi.fn(),
  listRolesWithUserCountRecords: vi.fn(),
  listAllPermissionRecords: vi.fn(),
  listPermissionGroupsRecord: vi.fn(),
  createRoleRecord: vi.fn(),
  updateRoleRecord: vi.fn(),
  deleteRoleRecord: vi.fn(),
  getRolePermissionIdsRecord: vi.fn(),
}

vi.mock("zadm/app/repositories/roles", () => mockRepo)

const makeRoleRow = (overrides: Record<string, unknown> = {}) => ({
  id: "role-1",
  name: "Editor",
  slug: "editor",
  description: "Content editor",
  isSystem: 0,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  ...overrides,
})

describe("roles service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo.getRolePermissionIdsRecord.mockReturnValue(["perm-1", "perm-2"])
  })

  describe("listRolesService", () => {
    it("returns roles with user count and permissions", async () => {
      mockRepo.listRolesWithUserCountRecords.mockReturnValue([
        { ...makeRoleRow(), userCount: 5 },
        { ...makeRoleRow({ id: "role-2", name: "Admin", slug: "admin" }), userCount: 2 },
      ])

      const { listRolesService } = await import("./roles")
      const result = listRolesService()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0]).toHaveProperty("userCount", 5)
        expect(result.data[0]).toHaveProperty("permissionIds", ["perm-1", "perm-2"])
      }
    })

    it("passes filters to repository", async () => {
      mockRepo.listRolesWithUserCountRecords.mockReturnValue([])

      const { listRolesService } = await import("./roles")
      listRolesService({ search: "admin", sortBy: "name", sortOrder: "asc" })

      expect(mockRepo.listRolesWithUserCountRecords).toHaveBeenCalledWith({
        search: "admin", sortBy: "name", sortOrder: "asc",
      })
    })
  })

  describe("getRole", () => {
    it("returns role with permissions", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow())

      const { getRole } = await import("./roles")
      const result = getRole("role-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Editor")
        expect(result.data.permissionIds).toEqual(["perm-1", "perm-2"])
      }
    })

    it("returns not_found for non-existent role", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(null)

      const { getRole } = await import("./roles")
      const result = getRole("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("listPermissionsService", () => {
    it("returns grouped permissions", async () => {
      mockRepo.listPermissionGroupsRecord.mockReturnValue({ posts: [{ id: "perm-1", name: "view_posts" }] })

      const { listPermissionsService } = await import("./roles")
      const result = listPermissionsService()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ posts: [{ id: "perm-1", name: "view_posts" }] })
      }
    })
  })

  describe("createRole", () => {
    it("creates a role with generated slug", async () => {
      mockRepo.findRoleBySlugRecord.mockReturnValue(null)
      const created = makeRoleRow({ id: "new-id", slug: "editor" })
      mockRepo.createRoleRecord.mockReturnValue(created)

      const { createRole } = await import("./roles")
      const result = createRole({ name: "Editor", permissionIds: ["perm-1"] })

      expect(result.success).toBe(true)
      expect(mockRepo.createRoleRecord).toHaveBeenCalledWith(expect.objectContaining({ name: "Editor", slug: "editor" }))
    })

    it("returns conflict on duplicate slug", async () => {
      mockRepo.findRoleBySlugRecord.mockReturnValue(makeRoleRow())

      const { createRole } = await import("./roles")
      const result = createRole({ name: "Editor", permissionIds: [] })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("conflict")
      }
    })
  })

  describe("updateRole", () => {
    it("updates a role", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow())
      mockRepo.findRoleBySlugRecord.mockReturnValue(null)
      mockRepo.updateRoleRecord.mockReturnValue(makeRoleRow({ name: "Updated" }))

      const { updateRole } = await import("./roles")
      const result = updateRole("role-1", { name: "Updated" })

      expect(result.success).toBe(true)
    })

    it("prevents modifying system roles", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow({ isSystem: 1 }))

      const { updateRole } = await import("./roles")
      const result = updateRole("role-1", { name: "Try" })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("forbidden")
        expect(result.error.message).toBe("System roles cannot be modified.")
      }
    })
  })

  describe("deleteRole", () => {
    it("deletes a role", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow())

      const { deleteRole } = await import("./roles")
      const result = deleteRole("role-1")

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it("prevents deleting system roles", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow({ isSystem: 1 }))

      const { deleteRole } = await import("./roles")
      const result = deleteRole("role-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("forbidden")
        expect(result.error.message).toBe("System roles cannot be deleted.")
      }
    })
  })

  describe("duplicateRole", () => {
    it("duplicates a role", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow())
      mockRepo.findRoleBySlugRecord.mockReturnValue(null)
      const dup = makeRoleRow({ id: "new-id", name: "Editor (Copy)", slug: "editor-copy" })
      mockRepo.createRoleRecord.mockReturnValue(dup)

      const { duplicateRole } = await import("./roles")
      const result = duplicateRole("role-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Editor (Copy)")
      }
    })

    it("appends counter when copy slug exists", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow())
      mockRepo.findRoleBySlugRecord
        .mockReturnValueOnce(makeRoleRow({ id: "existing", slug: "editor-copy" }))
        .mockReturnValueOnce(null)
      const dup = makeRoleRow({ id: "new-id", slug: "editor-copy-1" })
      mockRepo.createRoleRecord.mockReturnValue(dup)

      const { duplicateRole } = await import("./roles")
      const result = duplicateRole("role-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe("editor-copy-1")
      }
    })
  })

  describe("bulkDeleteRoles", () => {
    it("deletes multiple roles", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow())

      const { bulkDeleteRoles } = await import("./roles")
      const result = bulkDeleteRoles(["role-1", "role-2"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([
          { id: "role-1", success: true, error: undefined },
          { id: "role-2", success: true, error: undefined },
        ])
      }
    })
  })

  describe("bulkDuplicateRoles", () => {
    it("duplicates multiple roles", async () => {
      mockRepo.findRoleByIdRecord.mockReturnValue(makeRoleRow())
      mockRepo.findRoleBySlugRecord.mockReturnValue(null)
      const dup = makeRoleRow({ id: "new-id", name: "Editor (Copy)" })
      mockRepo.createRoleRecord.mockReturnValue(dup)

      const { bulkDuplicateRoles } = await import("./roles")
      const result = bulkDuplicateRoles(["role-1"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0]).toEqual({ id: "role-1", success: true, newId: "new-id" })
      }
    })
  })
})