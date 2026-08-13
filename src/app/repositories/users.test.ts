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
  count: vi.fn(),
}))

vi.mock("zadm/pkg/utils/index", () => ({
  generateId: vi.fn(() => "mock-user-id"),
  getCurrentTimestamp: vi.fn(() => 1700000000000),
}))

const makeUserRow = (overrides: Record<string, unknown> = {}) => ({
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  password: "hashed-secret",
  roleId: "role-1",
  emailVerified: 0,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  ...overrides,
})

describe("users repository", () => {
  it("exports all expected functions", async () => {
    const repo = await import("./users")
    expect(typeof repo.findUserByIdRecord).toBe("function")
    expect(typeof repo.findUserByEmailRecord).toBe("function")
    expect(typeof repo.listUsersPaginatedRecord).toBe("function")
    expect(typeof repo.userCountByRoleRecord).toBe("function")
    expect(typeof repo.createUserRecord).toBe("function")
    expect(typeof repo.updateUserRecord).toBe("function")
    expect(typeof repo.deleteUserRecord).toBe("function")
  })

  it("findUserByIdRecord returns row when found", async () => {
    const row = makeUserRow()
    const mockGet = vi.fn().mockReturnValue(row)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findUserByIdRecord } = await import("./users")
    const result = findUserByIdRecord("user-1")
    expect(result).toEqual(row)
  })

  it("findUserByIdRecord returns undefined when not found", async () => {
    const mockGet = vi.fn().mockReturnValue(undefined)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findUserByIdRecord } = await import("./users")
    const result = findUserByIdRecord("nonexistent")
    expect(result).toBeUndefined()
  })

  it("findUserByEmailRecord returns row when found", async () => {
    const row = makeUserRow({ email: "test@example.com" })
    const mockGet = vi.fn().mockReturnValue(row)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findUserByEmailRecord } = await import("./users")
    const result = findUserByEmailRecord("test@example.com")
    expect(result).toEqual(row)
  })

  it("findUserByEmailRecord returns undefined when not found", async () => {
    const mockGet = vi.fn().mockReturnValue(undefined)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findUserByEmailRecord } = await import("./users")
    const result = findUserByEmailRecord("unknown@example.com")
    expect(result).toBeUndefined()
  })

  it("listUsersPaginatedRecord returns paginated data with users sans passwords", async () => {
    const rows = [makeUserRow(), makeUserRow({ id: "user-2", name: "Jane" })]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockOrderBy = vi.fn().mockReturnValue({ all: mockAll })
    const mockLimit = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
    const mockOffset = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockWhere = vi.fn().mockReturnValue({ offset: mockOffset })
    const mockTotal = vi.fn().mockReturnValue([{ value: rows.length }])
    const mockTotalFrom = vi.fn().mockReturnValue({ all: mockTotal })
    const mockPaged = vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ offset: vi.fn().mockReturnValue({ all: mockAll }) }) })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere, orderBy: mockPaged })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({ from: mockTotalFrom })
      .mockReturnValueOnce({ from: mockFrom })

    const { listUsersPaginatedRecord } = await import("./users")
    const result = listUsersPaginatedRecord({ page: 1, perPage: 10 })
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).not.toHaveProperty("password")
  })

  it("userCountByRoleRecord returns count", async () => {
    const mockGet = vi.fn().mockReturnValue({ value: 5 })
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { userCountByRoleRecord } = await import("./users")
    const result = userCountByRoleRecord("role-1")
    expect(result).toBe(5)
  })

  it("createUserRecord calls insert and returns safe user", async () => {
    const mockRun = vi.fn()
    const mockValues = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockValues })
    const mockGet = vi.fn().mockReturnValue(makeUserRow({ id: "mock-user-id" }))
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { createUserRecord } = await import("./users")
    const result = createUserRecord({ id: "mock-user-id", name: "New User", email: "new@example.com", passwordHash: "hash", roleId: "role-1", createdAt: 1, updatedAt: 1 })
    expect(result).toBeDefined()
    expect(result).not.toHaveProperty("passwordHash")
  })

  it("updateUserRecord calls update and returns updated user", async () => {
    const mockRun = vi.fn()
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet })
    const mockGet = vi.fn().mockReturnValue(makeUserRow({ name: "Updated" }))
    const mockWhereSelect = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { updateUserRecord } = await import("./users")
    const result = updateUserRecord("user-1", { name: "Updated", updatedAt: 1 })
    expect(result).toBeDefined()
  })

  it("deleteUserRecord calls delete", async () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 })
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { deleteUserRecord } = await import("./users")
    const result = deleteUserRecord("user-1")
    expect(result).toBe(true)
  })
})
