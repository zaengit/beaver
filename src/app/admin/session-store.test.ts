import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("zadm/app/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock("zadm/app/db/schema", () => ({
  adminRefreshSessions: {
    id: { name: "id" },
    userId: { name: "userId" },
    expiresAt: { name: "expiresAt" },
    createdAt: { name: "createdAt" },
  },
}))

vi.mock("drizzle-orm", () => ({
  relations: vi.fn(),
  eq: vi.fn(),
  and: vi.fn(),
  gt: vi.fn(),
}))

vi.mock("zadm/pkg/utils/index", () => ({
  getCurrentTimestamp: vi.fn(() => 1700000000000),
}))

describe("saveRefreshSession", () => {
  it("calls db.insert with correct values", async () => {
    const { db } = await import("zadm/app/db")
    const mockRun = vi.fn()
    const mockValues = vi.fn().mockReturnValue({ run: mockRun })
    ;(db.insert as ReturnType<typeof vi.fn>).mockReturnValue({ values: mockValues })

    const { saveRefreshSession } = await import("./session-store")
    saveRefreshSession("session-1", "user-1", 1700086400000)

    expect(db.insert).toHaveBeenCalled()
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "session-1",
        userId: "user-1",
        expiresAt: 1700086400000,
      })
    )
    expect(mockRun).toHaveBeenCalled()
  })
})

describe("readRefreshSession", () => {
  it("returns userId and expiresAt when session found", async () => {
    const mockRow = { userId: "user-1", expiresAt: 1700086400000 }
    const mockGet = vi.fn().mockReturnValue(mockRow)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { readRefreshSession } = await import("./session-store")
    const result = readRefreshSession("session-1")

    expect(result).toEqual(mockRow)
  })

  it("returns null when session not found", async () => {
    const mockGet = vi.fn().mockReturnValue(undefined)
    const mockWhere = vi.fn().mockReturnValue({ get: mockGet })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    const { db } = await import("zadm/app/db")
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: mockFrom })

    const { readRefreshSession } = await import("./session-store")
    const result = readRefreshSession("expired-session")

    expect(result).toBeNull()
  })
})

describe("deleteRefreshSession", () => {
  it("calls db.delete", async () => {
    const { db } = await import("zadm/app/db")
    const mockRun = vi.fn()
    const mockWhere = vi.fn().mockReturnValue({ run: mockRun })
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { deleteRefreshSession } = await import("./session-store")
    deleteRefreshSession("session-1")

    expect(db.delete).toHaveBeenCalled()
    expect(mockRun).toHaveBeenCalled()
  })
})

describe("consumeRefreshSession", () => {
  it("atomically deletes and returns a valid refresh session", async () => {
    const mockRow = { userId: "user-1", expiresAt: 1700086400000 }
    const mockGet = vi.fn().mockReturnValue(mockRow)
    const mockReturning = vi.fn().mockReturnValue({ get: mockGet })
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    const { db } = await import("zadm/app/db")
    ;(db.delete as ReturnType<typeof vi.fn>).mockReturnValue({ where: mockWhere })

    const { consumeRefreshSession } = await import("./session-store")
    expect(consumeRefreshSession("session-1")).toEqual(mockRow)
    expect(db.delete).toHaveBeenCalled()
    expect(mockReturning).toHaveBeenCalled()
  })
})
