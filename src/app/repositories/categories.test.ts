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

describe("categories repository", () => {
  it("exports all expected functions", async () => {
    const repo = await import("./categories")
    expect(typeof repo.findCategoryByIdRecord).toBe("function")
    expect(typeof repo.findCategoryBySlugRecord).toBe("function")
    expect(typeof repo.listCategoryRecords).toBe("function")
    expect(typeof repo.categorySlugExistsRecord).toBe("function")
    expect(typeof repo.createCategoryRecord).toBe("function")
    expect(typeof repo.updateCategoryRecord).toBe("function")
    expect(typeof repo.deleteCategoryRecord).toBe("function")
  })

  it("findCategoryByIdRecord returns row when found", async () => {
    const mockRow = { id: "cat-1", name: "Tech", slug: "tech", type: "post", status: "published", description: null, image: null, createdAt: 1, updatedAt: 1 }
    const mockGet = vi.fn().mockReturnValue(mockRow)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findCategoryByIdRecord } = await import("./categories")
    const result = findCategoryByIdRecord("cat-1")
    expect(result).toEqual(mockRow)
  })

  it("findCategoryByIdRecord returns undefined when not found", async () => {
    const mockGet = vi.fn().mockReturnValue(undefined)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })

    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findCategoryByIdRecord } = await import("./categories")
    const result = findCategoryByIdRecord("nonexistent")
    expect(result).toBeUndefined()
  })

  it("listCategoryRecords returns empty array with no filters", async () => {
    const mockAll = vi.fn().mockReturnValue([])
    // chain: select -> from -> orderBy -> (optionally where) -> all
    const mockWhereWithAll = vi.fn().mockReturnValue({ all: mockAll })
    const mockOrderBy = vi.fn().mockReturnValue({ where: mockWhereWithAll, all: mockAll })
    const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { listCategoryRecords } = await import("./categories")
    const result = listCategoryRecords()
    expect(result).toEqual([])
  })

  it("createCategoryRecord calls insert and returns row", async () => {
    const input = { id: "new-id", name: "Science", slug: "science", type: "category", status: "published" as const, createdAt: 1, updatedAt: 1, description: null, image: null }
    const mockRun = vi.fn()
    const mockValues = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockValues })

    const { createCategoryRecord } = await import("./categories")
    const result = createCategoryRecord(input)
    expect(result).toBeDefined()
    expect(result.id).toBe("new-id")
  })

  it("updateCategoryRecord calls update and returns updated row", async () => {
    const mockRun = vi.fn()
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })

    // updateCategoryRecord also calls findCategoryByIdRecord internally,
    // so we need db.select to work too
    const mockGet = vi.fn().mockReturnValue({ id: "cat-1", name: "Updated" })
    const mockSelectWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockSelectFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })

    const { db } = await import("zadm/app/db")
    ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockSelectFrom })

    const { updateCategoryRecord } = await import("./categories")
    const result = updateCategoryRecord("cat-1", { name: "Updated", updatedAt: Date.now() })
    expect(result).toBeDefined()
  })

  it("deleteCategoryRecord returns true when changes > 0", async () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 })
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { deleteCategoryRecord } = await import("./categories")
    const result = deleteCategoryRecord("cat-1")
    expect(result).toBe(true)
  })

  it("deleteCategoryRecord returns false when changes === 0", async () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 0 })
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { deleteCategoryRecord } = await import("./categories")
    const result = deleteCategoryRecord("nonexistent")
    expect(result).toBe(false)
  })
})