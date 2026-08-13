import { describe, expect, it, vi } from "vitest"

vi.mock("zadm/app/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("drizzle-orm", () => ({
  relations: vi.fn(),
  eq: vi.fn(),
  and: vi.fn(),
  like: vi.fn(),
  asc: vi.fn(),
  desc: vi.fn(),
  sql: vi.fn(),
  or: vi.fn(),
  inArray: vi.fn(),
  gte: vi.fn(),
  lte: vi.fn(),
  count: vi.fn(),
}))

vi.mock("zadm/pkg/utils/index", () => ({
  generateId: vi.fn(() => "mock-role-id"),
  getCurrentTimestamp: vi.fn(() => 1700000000000),
}))

describe("roles repository", () => {
  it("exports all expected functions", async () => {
    const repo = await import("./roles")
    expect(typeof repo.findRoleByIdRecord).toBe("function")
    expect(typeof repo.findRoleBySlugRecord).toBe("function")
    expect(typeof repo.listRolesWithUserCountRecords).toBe("function")
    expect(typeof repo.listAllPermissionRecords).toBe("function")
    expect(typeof repo.listPermissionGroupsRecord).toBe("function")
    expect(typeof repo.createRoleRecord).toBe("function")
    expect(typeof repo.updateRoleRecord).toBe("function")
    expect(typeof repo.deleteRoleRecord).toBe("function")
    expect(typeof repo.getRolePermissionIdsRecord).toBe("function")
  })

  it("findRoleByIdRecord returns row when found", async () => {
    const mockRow = { id: "role-1", name: "Admin", slug: "admin", description: null, createdAt: 1, updatedAt: 1 }
    const mockGet = vi.fn().mockReturnValue(mockRow)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findRoleByIdRecord } = await import("./roles")
    const result = findRoleByIdRecord("role-1")
    expect(result).toEqual(mockRow)
  })

  it("findRoleByIdRecord returns undefined when not found", async () => {
    const mockGet = vi.fn().mockReturnValue(undefined)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findRoleByIdRecord } = await import("./roles")
    const result = findRoleByIdRecord("nonexistent")
    expect(result).toBeUndefined()
  })

  it("listRolesWithUserCountRecords returns roles", async () => {
    const rows = [{ id: "r1", name: "Admin", userCount: 3 }]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockOrderBy = vi.fn().mockReturnValue({ all: mockAll })
    const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy, all: mockAll, where: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue({ value: 3 }) }) })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { listRolesWithUserCountRecords } = await import("./roles")
    const result = listRolesWithUserCountRecords()
    expect(result).toEqual(rows)
  })

  it("listAllPermissionRecords returns permissions", async () => {
    const rows = [{ id: "p1", key: "view_posts", name: "View Posts", group: "posts" }]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockFrom = vi.fn().mockReturnValue({ all: mockAll })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { listAllPermissionRecords } = await import("./roles")
    const result = listAllPermissionRecords()
    expect(result).toEqual(rows)
  })

  it("getRolePermissionIdsRecord returns permission ids", async () => {
    const rows = [{ permissionId: "p1" }, { permissionId: "p2" }]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockWhere = vi.fn().mockReturnValue({ all: mockAll })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { getRolePermissionIdsRecord } = await import("./roles")
    const result = getRolePermissionIdsRecord("role-1")
    expect(result).toEqual(["p1", "p2"])
  })

  it("createRoleRecord calls insert", async () => {
    const mockRun = vi.fn()
    const mockValues = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockValues })

    const { createRoleRecord } = await import("./roles")
    const mockGet = vi.fn().mockReturnValue({ id: "role-1", name: "Editor", slug: "editor" })
    const mockSelectWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockSelectFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockSelectFrom })

    const result = createRoleRecord({ id: "role-1", name: "Editor", slug: "editor", description: null, permissionIds: [], createdAt: 1, updatedAt: 1 })
    expect(result).toBeDefined()
  })

  it("updateRoleRecord calls update", async () => {
    const mockRun = vi.fn()
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet })
    const mockGet = vi.fn().mockReturnValue({ id: "role-1", name: "Updated" })
    const mockSelectWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockSelectFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockSelectFrom })

    const { updateRoleRecord } = await import("./roles")
    const result = updateRoleRecord("role-1", { name: "Updated", updatedAt: 1 })
    expect(result).toBeDefined()
  })

  it("deleteRoleRecord returns true when changes > 0", async () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 })
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { deleteRoleRecord } = await import("./roles")
    const result = deleteRoleRecord("role-1")
    expect(result).toBe(true)
  })
})
