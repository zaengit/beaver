import { describe, it, expect, beforeEach, vi } from "vitest"

const mockRepo = {
  findPostByIdRecord: vi.fn(),
  findPostBySlugRecord: vi.fn(),
  findPublishedBySlugRecord: vi.fn(),
  findPublishedByTypeAndSlugRecord: vi.fn(),
  listPostRecords: vi.fn(),
  listPublishedPostRecords: vi.fn(),
  listPublishedPostRecordsByType: vi.fn(),
  listPublishedPostRecordsByTag: vi.fn(),
  listPublishedArchiveFilterOptionsByType: vi.fn(),
  searchPublishedPostRecords: vi.fn(),
  createPostRecord: vi.fn(),
  updatePostRecord: vi.fn(),
  deletePostRecord: vi.fn(),
  syncPostCategoriesRecord: vi.fn(),
}

vi.mock("zadm/app/repositories/posts", () => mockRepo)
vi.mock("zadm/pkg/security/sanitize", () => ({
  sanitizeText: (t: string) => t,
  sanitizeHtml: (h: string) => h,
}))
vi.mock("zadm/pkg/utils/id", () => ({
  generateId: vi.fn(() => "new-post-id"),
}))
vi.mock("zadm/app/cache/public-data-cache", () => ({
  getCachedPublicData: (_key: string, fn: () => unknown) => fn(),
  invalidatePublicDataCache: vi.fn(),
}))
vi.mock("@content-type-registry", () => ({
  default: { contentTypes: [], templates: [] },
}))

const makePostRow = (overrides: Record<string, unknown> = {}) => ({
  id: "post-1",
  title: "Hello World",
  slug: "hello-world",
  type: "post",
  status: "draft" as const,
  excerpt: null,
  description: null,
  tags: null,
  sections: null,
  customFieldValues: null,
  metaTitle: null,
  metaDescription: null,
  featuredImage: null,
  gallery: null,
  authorId: "user-1",
  publishedAt: null,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  ...overrides,
})

describe("posts service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createPost", () => {
    it("creates a post successfully", async () => {
      const { createPost } = await import("./posts")
      mockRepo.findPostBySlugRecord.mockReturnValue(null)
      mockRepo.createPostRecord.mockReturnValue(makePostRow())

      const result = createPost({ title: "Hello World" }, "user-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Hello World")
        expect(result.message).toBe("Post created.")
      }
    })

    it("returns conflict when slug already exists", async () => {
      const { createPost } = await import("./posts")
      mockRepo.findPostBySlugRecord.mockReturnValue(makePostRow())

      const result = createPost({ title: "Hello World" }, "user-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("conflict")
      }
    })

    it("syncs categories when provided", async () => {
      const { createPost } = await import("./posts")
      mockRepo.findPostBySlugRecord.mockReturnValue(null)
      mockRepo.createPostRecord.mockReturnValue(makePostRow())

      createPost({ title: "Post", categoryIds: ["cat-1", "cat-2"] }, "user-1")

      expect(mockRepo.syncPostCategoriesRecord).toHaveBeenCalledWith(
        "new-post-id", ["cat-1", "cat-2"], expect.any(Number)
      )
    })

    it("returns db_error on exception", async () => {
      const { createPost } = await import("./posts")
      mockRepo.findPostBySlugRecord.mockReturnValue(null)
      mockRepo.createPostRecord.mockImplementation(() => { throw new Error("DB") })

      const result = createPost({ title: "Fail" }, "user-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("db_error")
      }
    })
  })

  describe("updatePost", () => {
    it("updates an existing post", async () => {
      const { updatePost } = await import("./posts")
      const existing = makePostRow()
      mockRepo.findPostByIdRecord.mockReturnValue(existing)
      mockRepo.updatePostRecord.mockReturnValue(makePostRow({ title: "Updated" }))

      const result = updatePost("post-1", { title: "Updated" }, "user-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Updated")
      }
    })

    it("returns not_found when post does not exist", async () => {
      const { updatePost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(null)

      const result = updatePost("nonexistent", { title: "X" }, "user-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })

    it("returns conflict on duplicate slug", async () => {
      const { updatePost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow({ slug: "old-slug" }))
      mockRepo.findPostBySlugRecord.mockReturnValue(makePostRow({ id: "other" }))

      const result = updatePost("post-1", { slug: "taken" }, "user-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("conflict")
      }
    })

    it("syncs categories when categoryIds provided", async () => {
      const { updatePost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow())
      mockRepo.updatePostRecord.mockReturnValue(makePostRow())

      updatePost("post-1", { categoryIds: ["cat-1"] }, "user-1")

      expect(mockRepo.syncPostCategoriesRecord).toHaveBeenCalledWith("post-1", ["cat-1"], expect.any(Number))
    })
  })

  describe("deletePost", () => {
    it("deletes an existing post", async () => {
      const { deletePost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow())

      const result = deletePost("post-1")

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it("returns not_found for non-existent post", async () => {
      const { deletePost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(null)

      const result = deletePost("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("duplicatePost", () => {
    it("duplicates a post", async () => {
      const { duplicatePost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow())
      mockRepo.findPostBySlugRecord.mockReturnValue(null)
      mockRepo.createPostRecord.mockReturnValue(makePostRow({ id: "new-id", title: "Hello World (Copy)", slug: "hello-world-copy", status: "draft" }))

      const result = duplicatePost("post-1", "user-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Hello World (Copy)")
        expect(result.data.status).toBe("draft")
      }
    })

    it("returns not_found when source does not exist", async () => {
      const { duplicatePost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(null)

      const result = duplicatePost("nonexistent", "user-1")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("bulkDeletePosts", () => {
    it("deletes multiple posts", async () => {
      const { bulkDeletePosts } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow())

      const result = bulkDeletePosts(["post-1", "post-2"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([
          { id: "post-1", success: true },
          { id: "post-2", success: true },
        ])
      }
    })

    it("marks as failed when post not found", async () => {
      const { bulkDeletePosts } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(null)

      const result = bulkDeletePosts(["nonexistent"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([{ id: "nonexistent", success: false }])
      }
    })
  })

  describe("bulkPublishPosts", () => {
    it("publishes multiple posts", async () => {
      const { bulkPublishPosts } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow())

      const result = bulkPublishPosts(["post-1", "post-2"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([
          { id: "post-1", success: true },
          { id: "post-2", success: true },
        ])
      }
    })
  })

  describe("bulkUnpublishPosts", () => {
    it("unpublishes multiple posts", async () => {
      const { bulkUnpublishPosts } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow())

      const result = bulkUnpublishPosts(["post-1"])

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([{ id: "post-1", success: true }])
      }
    })
  })

  describe("getPost", () => {
    it("returns a post by id", async () => {
      const { getPost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(makePostRow())

      const result = getPost("post-1")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe("post-1")
      }
    })

    it("returns not_found for non-existent post", async () => {
      const { getPost } = await import("./posts")
      mockRepo.findPostByIdRecord.mockReturnValue(null)

      const result = getPost("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("getPublishedPost", () => {
    it("returns published post by slug", async () => {
      const { getPublishedPost } = await import("./posts")
      mockRepo.findPublishedBySlugRecord.mockReturnValue(makePostRow({ authorName: "Admin" }))

      const result = getPublishedPost("hello-world")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe("hello-world")
      }
    })

    it("returns not_found when not found", async () => {
      const { getPublishedPost } = await import("./posts")
      mockRepo.findPublishedBySlugRecord.mockReturnValue(null)

      const result = getPublishedPost("nonexistent")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe("not_found")
      }
    })
  })

  describe("searchPublishedPosts", () => {
    it("returns empty for empty query", async () => {
      const { searchPublishedPosts } = await import("./posts")

      const result = searchPublishedPosts("")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data).toEqual([])
      }
    })

    it("searches with normalized query", async () => {
      const { searchPublishedPosts } = await import("./posts")
      mockRepo.searchPublishedPostRecords.mockReturnValue({ data: [makePostRow()], meta: { currentPage: 1, perPage: 12, total: 1, lastPage: 1, from: 1, to: 1 } })

      const result = searchPublishedPosts("hello")

      expect(result.success).toBe(true)
    })
  })

  describe("listPublishedPostsByTag", () => {
    it("returns empty for empty tag", async () => {
      const { listPublishedPostsByTag } = await import("./posts")

      const result = listPublishedPostsByTag("")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data).toEqual([])
      }
    })

    it("returns posts for valid tag", async () => {
      const { listPublishedPostsByTag } = await import("./posts")
      mockRepo.listPublishedPostRecordsByTag.mockReturnValue({ data: [], meta: { currentPage: 1, perPage: 12, total: 0, lastPage: 1, from: 0, to: 0 } })

      const result = listPublishedPostsByTag("javascript")

      expect(result.success).toBe(true)
    })
  })
})