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

describe("posts repository", () => {
  it("exports all expected functions", async () => {
    const repo = await import("./posts")
    expect(typeof repo.findPostByIdRecord).toBe("function")
    expect(typeof repo.findPostBySlugRecord).toBe("function")
    expect(typeof repo.findPublishedBySlugRecord).toBe("function")
    expect(typeof repo.createPostRecord).toBe("function")
    expect(typeof repo.updatePostRecord).toBe("function")
    expect(typeof repo.deletePostRecord).toBe("function")
    expect(typeof repo.syncPostCategoriesRecord).toBe("function")
    expect(typeof repo.listPostRecords).toBe("function")
    expect(typeof repo.listPublishedPostRecords).toBe("function")
    expect(typeof repo.searchPublishedPostRecords).toBe("function")
    expect(typeof repo.listPublishedArchiveFilterOptionsByType).toBe("function")
  })

  it("findPostByIdRecord returns row when found", async () => {
    const mockRow = { id: "post-1", title: "Test Post", slug: "test-post", content: "content", excerpt: null, type: "article", status: "published", userId: "user-1", featuredImage: null, metaTitle: null, metaDescription: null, publishedAt: 1, createdAt: 1, updatedAt: 1 }
    const mockGet = vi.fn().mockReturnValue(mockRow)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockInnerJoin = vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) }) })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere, innerJoin: mockInnerJoin })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findPostByIdRecord } = await import("./posts")
    const result = findPostByIdRecord("post-1")
    expect(result).toEqual(expect.objectContaining({ ...mockRow, categories: [] }))
  })

  it("findPostByIdRecord returns undefined when not found", async () => {
    const mockGet = vi.fn().mockReturnValue(undefined)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })
    const { findPostByIdRecord } = await import("./posts")
    const result = findPostByIdRecord("nonexistent")
    expect(result).toBeUndefined()
  })

  it("listPostRecords returns paginated data", async () => {
    const rows = [{ id: "p1" }, { id: "p2" }]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockOffset = vi.fn().mockReturnValue({ all: mockAll })
    const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset })
    const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockWhere = vi.fn().mockReturnValue({ offset: mockOffset })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere, leftJoin: vi.fn().mockReturnValue({ orderBy: mockOrderBy }) })
    const { db } = await import("zadm/app/db")
    const mockTotalFrom = vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([{ value: rows.length }]) })
    ;(db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({ from: mockTotalFrom })
      .mockReturnValueOnce({ from: mockFrom })

    const { listPostRecords } = await import("./posts")
    const result = listPostRecords({ page: 1, perPage: 12 })
    expect(result.data).toEqual(rows)
  })

  it("createPostRecord calls insert and returns row", async () => {
    const input = { id: "p1", title: "New", slug: "new", content: "body", type: "article", status: "draft", userId: "u1", createdAt: 1, updatedAt: 1 }
    const mockRun = vi.fn()
    const mockValues = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockValues })
    const mockFrom = vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue(input) }) })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { createPostRecord } = await import("./posts")
    const result = createPostRecord(input)
    expect(result).toBeDefined()
  })

  it("updatePostRecord calls update", async () => {
    const mockRun = vi.fn()
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet })
    const mockFrom = vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue({ id: "p1", title: "Updated" }) }) })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { updatePostRecord } = await import("./posts")
    const result = updatePostRecord("p1", { title: "Updated" })
    expect(result).toBeDefined()
  })

  it("deletePostRecord returns true when changes > 0", async () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 })
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { deletePostRecord } = await import("./posts")
    const result = deletePostRecord("p1")
    expect(result).toBe(true)
  })
})
