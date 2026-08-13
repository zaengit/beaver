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

describe("media repository", () => {
  it("exports all expected functions", async () => {
    const repo = await import("./media")
    expect(typeof repo.findMediaByIdRecord).toBe("function")
    expect(typeof repo.listMediaRecords).toBe("function")
    expect(typeof repo.getMediaFolderRecords).toBe("function")
    expect(typeof repo.createMediaRecord).toBe("function")
    expect(typeof repo.updateMediaRecord).toBe("function")
    expect(typeof repo.deleteMediaRecord).toBe("function")
  })

  it("findMediaByIdRecord returns row when found", async () => {
    const mockRow = { id: "media-1", userId: "user-1", name: "test.jpg", fileName: "test.jpg", mimeType: "image/jpeg", size: 1024, url: "/uploads/test.jpg", thumbnailUrl: null, alt: null, caption: null, width: 800, height: 600, folder: null, createdAt: 1, updatedAt: 1 }
    const mockGet = vi.fn().mockReturnValue(mockRow)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findMediaByIdRecord } = await import("./media")
    const result = findMediaByIdRecord("media-1")
    expect(result).toEqual(mockRow)
  })

  it("findMediaByIdRecord returns undefined when not found", async () => {
    const mockGet = vi.fn().mockReturnValue(undefined)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { findMediaByIdRecord } = await import("./media")
    const result = findMediaByIdRecord("nonexistent")
    expect(result).toBeUndefined()
  })

  it("listMediaRecords returns paginated data", async () => {
    const rows = [{ id: "m1" }, { id: "m2" }]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockOffset = vi.fn().mockReturnValue({ all: mockAll })
    const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset })
    const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockWhere = vi.fn().mockReturnValue({ offset: mockOffset })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere, orderBy: mockOrderBy })
    const { db } = await import("zadm/app/db")
    const mockTotalFrom = vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([{ id: "m1" }, { id: "m2" }]) })
    ;(db.select as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({ from: mockFrom })
      .mockReturnValueOnce({ from: mockTotalFrom })

    const { listMediaRecords } = await import("./media")
    const result = listMediaRecords({ page: 1, perPage: 12 })
    expect(result.data).toEqual(rows)
  })

  it("getMediaFolderRecords returns folders", async () => {
    const rows = [{ folder: "images" }, { folder: "documents" }, { folder: null }]
    const mockAll = vi.fn().mockReturnValue(rows)
    const mockOrderBy = vi.fn().mockReturnValue({ all: mockAll })
    const mockFrom = vi.fn().mockReturnValue({ orderBy: mockOrderBy, all: mockAll })
    const mockSelectDistinct = vi.fn().mockReturnValue({ from: mockFrom })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })
    ;(db.selectDistinct as unknown as ReturnType<typeof vi.fn>) = mockSelectDistinct

    const { getMediaFolderRecords } = await import("./media")
    const result = getMediaFolderRecords()
    expect(result).toContain("images")
  })

  it("createMediaRecord calls insert and returns row", async () => {
    const input = { id: "m1", userId: "u1", name: "test.jpg", fileName: "test.jpg", mimeType: "image/jpeg", size: 1024, url: "/uploads/test.jpg", thumbnailUrl: null, alt: null, caption: null, width: 800, height: 600, folder: null, createdAt: 1, updatedAt: 1 }
    const mockRun = vi.fn()
    const mockValues = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockValues })
    const mockGet = vi.fn().mockReturnValue(input)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { createMediaRecord } = await import("./media")
    const result = createMediaRecord(input)
    expect(result).toBeDefined()
  })

  it("updateMediaRecord calls update", async () => {
    const mockRun = vi.fn()
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: mockSet })
    const mockWhereSelect = vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue({ id: "m1", name: "updated.jpg" }) })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhereSelect })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { updateMediaRecord } = await import("./media")
    const result = updateMediaRecord("m1", { name: "updated.jpg" })
    expect(result).toBeDefined()
  })

  it("deleteMediaRecord returns true when changes > 0", async () => {
    const mockRun = vi.fn().mockReturnValue({ changes: 1 })
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    const { db } = await import("zadm/app/db")
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { deleteMediaRecord } = await import("./media")
    const result = deleteMediaRecord("m1")
    expect(result).toBe(true)
  })
})
