import { describe, it, expect, beforeEach, vi } from "vitest"

const mockRepo = {
  findCategoryByIdRecord: vi.fn(),
  listCategoryRecords: vi.fn(),
  categorySlugExistsRecord: vi.fn(),
  createCategoryRecord: vi.fn(),
  updateCategoryRecord: vi.fn(),
  deleteCategoryRecord: vi.fn(),
}
const mockGenerateId = vi.fn()
const mockGetCurrentTimestamp = vi.fn()
const mockSlugify = vi.fn()

vi.mock("zadm/pkg/utils/index", () => ({
  generateId: mockGenerateId,
  getCurrentTimestamp: mockGetCurrentTimestamp,
  slugify: mockSlugify,
}))

vi.mock("zadm/app/repositories/categories", async () => {
  return mockRepo
})

const makeCategoryRow = (overrides: Record<string, unknown> = {}) => ({
  id: "cat-1",
  name: "Technology",
  slug: "technology",
  type: "category",
  description: "All tech news",
  image: null,
  status: "published" as const,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  ...overrides,
})

describe("categories service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGenerateId.mockReturnValue("new-id")
    mockGetCurrentTimestamp.mockReturnValue(1700000000000)
    mockSlugify.mockReturnValue("technology")
    mockRepo.categorySlugExistsRecord.mockReturnValue(false)
  })

  describe("createCategoryAsync", () => {
    it("creates a category with default values", async () => {
      const row = makeCategoryRow()
      mockRepo.createCategoryRecord.mockReturnValue(row)

      const { createCategoryAsync } = await import("./categories")
      const result = await createCategoryAsync({ name: "Technology" })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Technology")
        expect(result.data.slug).toBe("technology")
        expect(result.data.type).toBe("category")
        expect(result.message).toBe("Category created.")
      }
      expect(mockRepo.createCategoryRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Technology",
          slug: "technology",
          type: "category",
          status: "published",
        })
      )
    })

    it("creates a category with all custom fields", async () => {
      const row = makeCategoryRow({ name: "Web Dev", type: "page", description: "desc", image: "https://img.co/pic.png", status: "draft" })
      mockRepo.createCategoryRecord.mockReturnValue(row)

      const { createCategoryAsync } = await import("./categories")
      const result = await createCategoryAsync({
        name: "Web Dev",
        type: "page",
        description: "desc",
        image: "https://img.co/pic.png",
        status: "draft",
      })

      expect(result.success).toBe(true)
      expect(mockRepo.createCategoryRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Web Dev",
          type: "page",
          description: "desc",
          image: "https://img.co/pic.png",
          status: "draft",
        })
      )
    })

    it("generates unique slug when slug exists", async () => {
      mockRepo.categorySlugExistsRecord
        .mockReturnValueOnce(true)
        .mockReturnValue(false)
      mockSlugify.mockReturnValue("technology")

      const row = makeCategoryRow({ slug: "technology-1" })
      mockRepo.createCategoryRecord.mockReturnValue(row)

      const { createCategoryAsync } = await import("./categories")
      const result = await createCategoryAsync({ name: "Technology" })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe("technology-1")
      }
    })

    it("uses fallback slug when slugify returns empty", async () => {
      mockSlugify.mockReturnValue("")
      const row = makeCategoryRow({ slug: "category", name: "!!! " })
      mockRepo.createCategoryRecord.mockReturnValue(row)

      const { createCategoryAsync } = await import("./categories")
      const result = await createCategoryAsync({ name: "!!! " })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe("category")
      }
    })
  })

  describe("updateCategory", () => {
    it("updates an existing category", async () => {
      const existing = makeCategoryRow()
      const updated = makeCategoryRow({ name: "Updated", slug: "updated" })
      mockRepo.findCategoryByIdRecord.mockReturnValue(existing)
      mockRepo.updateCategoryRecord.mockReturnValue(updated)
      mockSlugify.mockReturnValue("updated")

      const { updateCategory } = await import("./categories")
      const result = await updateCategory("cat-1", { name: "Updated" })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Updated")
        expect(result.message).toBe("Category updated.")
      }
      expect(mockRepo.updateCategoryRecord).toHaveBeenCalledWith("cat-1",
        expect.objectContaining({ name: "Updated", slug: "updated" })
      )
    })

    it("returns not_found when category does not exist", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(undefined)

      const { updateCategory } = await import("./categories")
      const result = await updateCategory("nonexistent", { name: "X" })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })

    it("does not change slug when name unchanged", async () => {
      const existing = makeCategoryRow()
      const updated = makeCategoryRow({ name: "Technology" })
      mockRepo.findCategoryByIdRecord.mockReturnValue(existing)
      mockRepo.updateCategoryRecord.mockReturnValue(updated)

      const { updateCategory } = await import("./categories")
      const result = await updateCategory("cat-1", { name: "Technology", description: "new desc" })

      expect(result.success).toBe(true)
      expect(mockRepo.updateCategoryRecord).toHaveBeenCalledWith("cat-1",
        expect.not.objectContaining({ slug: expect.anything() })
      )
    })
  })

  describe("deleteCategory", () => {
    it("deletes an existing category", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(makeCategoryRow())
      mockRepo.deleteCategoryRecord.mockReturnValue(true)

      const { deleteCategory } = await import("./categories")
      const result = deleteCategory("cat-1")

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
      expect(result.message).toBe("Category deleted.")
    })

    it("returns not_found when category does not exist", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(undefined)

      const { deleteCategory } = await import("./categories")
      const result = deleteCategory("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("duplicateCategory", () => {
    it("duplicates an existing category", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(makeCategoryRow())
      mockRepo.categorySlugExistsRecord.mockReturnValue(false)
      const dup = makeCategoryRow({ id: "new-id", name: "Technology (Copy)", slug: "technology-copy" })
      mockRepo.createCategoryRecord.mockReturnValue(dup)

      const { duplicateCategory } = await import("./categories")
      const result = duplicateCategory("cat-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Technology (Copy)")
        expect(result.data.slug).toBe("technology-copy")
        expect(result.message).toBe("Category duplicated.")
      }
    })

    it("appends timestamp when copy slug already exists", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(makeCategoryRow())
      mockRepo.categorySlugExistsRecord.mockReturnValue(true)
      mockGetCurrentTimestamp.mockReturnValue(1712345678999)
      const dup = makeCategoryRow({ id: "new-id", slug: "technology-copy-2v" })
      mockRepo.createCategoryRecord.mockReturnValue(dup)

      const { duplicateCategory } = await import("./categories")
      const result = duplicateCategory("cat-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe("technology-copy-2v")
      }
    })

    it("returns not_found when source category does not exist", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(undefined)

      const { duplicateCategory } = await import("./categories")
      const result = duplicateCategory("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })

    it("returns db_error when create fails", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(makeCategoryRow())
      mockRepo.categorySlugExistsRecord.mockReturnValue(false)
      mockRepo.createCategoryRecord.mockImplementation(() => { throw new Error("DB error") })

      const { duplicateCategory } = await import("./categories")
      const result = duplicateCategory("cat-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("db_error")
        expect(result.error.message).toBe("Failed to duplicate category.")
      }
    })
  })

  describe("bulkDeleteCategories", () => {
    it("deletes multiple categories", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(makeCategoryRow())
      mockRepo.deleteCategoryRecord.mockReturnValue(true)

      const { bulkDeleteCategories } = await import("./categories")
      const result = bulkDeleteCategories(["cat-1", "cat-2"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([
          { id: "cat-1", success: true },
          { id: "cat-2", success: true },
        ])
      }
    })

    it("marks as failed when category not found", async () => {
      mockRepo.findCategoryByIdRecord
        .mockReturnValueOnce(makeCategoryRow())
        .mockReturnValueOnce(undefined)
      mockRepo.deleteCategoryRecord.mockReturnValue(true)

      const { bulkDeleteCategories } = await import("./categories")
      const result = bulkDeleteCategories(["cat-1", "nonexistent"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([
          { id: "cat-1", success: true },
          { id: "nonexistent", success: false },
        ])
      }
    })

    it("handles delete errors gracefully", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(makeCategoryRow())
      mockRepo.deleteCategoryRecord.mockImplementation(() => { throw new Error("DB error") })

      const { bulkDeleteCategories } = await import("./categories")
      const result = bulkDeleteCategories(["cat-1"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([{ id: "cat-1", success: false }])
      }
    })
  })

  describe("bulkDuplicateCategories", () => {
    it("duplicates multiple categories", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(makeCategoryRow())
      mockRepo.categorySlugExistsRecord.mockReturnValue(false)
      const dup = makeCategoryRow({ id: "new-id", name: "Technology (Copy)", slug: "technology-copy" })
      mockRepo.createCategoryRecord.mockReturnValue(dup)

      const { bulkDuplicateCategories } = await import("./categories")
      const result = bulkDuplicateCategories(["cat-1", "cat-2"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0]).toEqual({ id: "cat-1", success: true, newId: "new-id" })
      }
    })

    it("marks as failed when source not found", async () => {
      mockRepo.findCategoryByIdRecord.mockReturnValue(undefined)

      const { bulkDuplicateCategories } = await import("./categories")
      const result = bulkDuplicateCategories(["nonexistent"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([{ id: "nonexistent", success: false }])
      }
    })
  })

  describe("bulkUpdateCategoryStatus", () => {
    it("publishes multiple categories", async () => {
      mockRepo.updateCategoryRecord.mockReturnValue(makeCategoryRow({ status: "published" }))

      const { bulkUpdateCategoryStatus } = await import("./categories")
      const result = bulkUpdateCategoryStatus(["cat-1", "cat-2"], "published")

      expect(result.success).toBe(true)
      expect(result.message).toBe("Categories published.")
      if (result.success) {
        expect(result.data).toEqual([
          { id: "cat-1", success: true },
          { id: "cat-2", success: true },
        ])
      }
    })

    it("unpublishes multiple categories", async () => {
      mockRepo.updateCategoryRecord.mockImplementation(() => null)

      const { bulkUpdateCategoryStatus } = await import("./categories")
      const result = bulkUpdateCategoryStatus(["cat-1"], "draft")

      expect(result.success).toBe(true)
      expect(result.message).toBe("Categories unpublished.")
      if (result.success) {
        expect(result.data).toEqual([{ id: "cat-1", success: false }])
      }
    })
  })

  describe("listCategories", () => {
    it("returns all categories", async () => {
      const rows = [makeCategoryRow(), makeCategoryRow({ id: "cat-2", name: "Science", slug: "science" })]
      mockRepo.listCategoryRecords.mockReturnValue(rows)

      const { listCategories } = await import("./categories")
      const result = listCategories()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.message).toBe("Categories retrieved.")
      }
    })

    it("passes filters to repository", async () => {
      mockRepo.listCategoryRecords.mockReturnValue([])

      const { listCategories } = await import("./categories")
      listCategories({ type: "page", search: "web", sortBy: "name", sortOrder: "asc" })

      expect(mockRepo.listCategoryRecords).toHaveBeenCalledWith({
        type: "page",
        search: "web",
        sortBy: "name",
        sortOrder: "asc",
      })
    })

    it("returns empty array when no categories exist", async () => {
      mockRepo.listCategoryRecords.mockReturnValue([])

      const { listCategories } = await import("./categories")
      const result = listCategories()

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })
  })
})
