import { describe, it, expect, beforeEach, vi } from "vitest"

const repoMock = {
  findMediaByIdRecord: vi.fn(),
  listMediaRecords: vi.fn(),
  getMediaFolderRecords: vi.fn(),
  createMediaRecord: vi.fn(),
  updateMediaRecord: vi.fn(),
  deleteMediaRecord: vi.fn(),
}

const utilsMock = {
  generateId: vi.fn(() => "mock-media-id"),
  getCurrentTimestamp: vi.fn(() => 1700000000000),
}

vi.mock("zadm/pkg/utils/index", () => ({
  generateId: utilsMock.generateId,
  getCurrentTimestamp: utilsMock.getCurrentTimestamp,
}))

vi.mock("zadm/app/repositories/media", () => ({
  findMediaByIdRecord: repoMock.findMediaByIdRecord,
  listMediaRecords: repoMock.listMediaRecords,
  getMediaFolderRecords: repoMock.getMediaFolderRecords,
  createMediaRecord: repoMock.createMediaRecord,
  updateMediaRecord: repoMock.updateMediaRecord,
  deleteMediaRecord: repoMock.deleteMediaRecord,
}))

const makeMediaRow = (overrides: Record<string, unknown> = {}) => ({
  id: "media-1",
  userId: "user-1",
  name: "test.jpg",
  fileName: "test.jpg",
  mimeType: "image/jpeg",
  size: 1024,
  url: "/uploads/test.jpg",
  thumbnailUrl: null,
  alt: null,
  caption: null,
  width: 800,
  height: 600,
  folder: null,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  ...overrides,
})

describe("media service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("listMediaService", () => {
    it("returns media list", async () => {
      const rows = [makeMediaRow(), makeMediaRow({ id: "media-2", name: "img2.png" })]
      repoMock.listMediaRecords.mockReturnValue({ data: rows, meta: { total: 2 } })

      const { listMediaService } = await import("./media")
      const result = listMediaService()

      expect(result.success).toBe(true)
    })

    it("passes filters to repository", async () => {
      repoMock.listMediaRecords.mockReturnValue({ data: [], meta: { total: 0 } })

      const { listMediaService } = await import("./media")
      listMediaService({ page: 1, perPage: 12, search: "test", folder: "images" })

      expect(repoMock.listMediaRecords).toHaveBeenCalledWith({
        page: 1, perPage: 12, search: "test", folder: "images",
      })
    })
  })

  describe("getMedia", () => {
    it("returns media by id", async () => {
      repoMock.findMediaByIdRecord.mockReturnValue(makeMediaRow())

      const { getMedia } = await import("./media")
      const result = getMedia("media-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe("media-1")
      }
    })

    it("returns not_found for non-existent media", async () => {
      repoMock.findMediaByIdRecord.mockReturnValue(null)

      const { getMedia } = await import("./media")
      const result = getMedia("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("listFoldersService", () => {
    it("returns folder list", async () => {
      repoMock.getMediaFolderRecords.mockReturnValue(["images", "documents"])

      const { listFoldersService } = await import("./media")
      const result = listFoldersService()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(["images", "documents"])
      }
    })

    it("returns empty when no folders", async () => {
      repoMock.getMediaFolderRecords.mockReturnValue([])

      const { listFoldersService } = await import("./media")
      const result = listFoldersService()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe("createMediaRecord", () => {
    it("creates a media record", async () => {
      const row = makeMediaRow()
      repoMock.createMediaRecord.mockReturnValue(row)

      const { createMediaRecord } = await import("./media")
      const result = createMediaRecord({
        userId: "user-1",
        name: "test.jpg",
        fileName: "test.jpg",
        mimeType: "image/jpeg",
        size: 1024,
        url: "/uploads/test.jpg",
      })

      expect(result.success).toBe(true)
      expect(result.message).toBe("Media uploaded.")
    })
  })

  describe("updateMedia", () => {
    it("updates media metadata", async () => {
      repoMock.findMediaByIdRecord.mockReturnValue(makeMediaRow())
      repoMock.updateMediaRecord.mockReturnValue(makeMediaRow({ name: "renamed.jpg", alt: "Alt text" }))

      const { updateMedia } = await import("./media")
      const result = updateMedia("media-1", { name: "renamed.jpg", alt: "Alt text" })

      expect(result.success).toBe(true)
      expect(result.message).toBe("Media updated.")
    })

    it("returns not_found when media does not exist", async () => {
      repoMock.findMediaByIdRecord.mockReturnValue(null)

      const { updateMedia } = await import("./media")
      const result = updateMedia("nonexistent", { name: "x" })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("deleteMedia", () => {
    it("deletes media", async () => {
      repoMock.findMediaByIdRecord.mockReturnValue(makeMediaRow())

      const { deleteMedia } = await import("./media")
      const result = deleteMedia("media-1")

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
      expect(result.message).toBe("Media deleted.")
    })

    it("returns not_found when media does not exist", async () => {
      repoMock.findMediaByIdRecord.mockReturnValue(null)

      const { deleteMedia } = await import("./media")
      const result = deleteMedia("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })
})