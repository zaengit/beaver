import { and, asc, count, desc, eq, inArray, like, or, sql, type SQL } from "drizzle-orm"

import { db } from "@zaenpm/beaver/app/db"
import { categories, media, postCategories, posts, users } from "@zaenpm/beaver/app/db/schema"
import type { PostRecord } from "@zaenpm/beaver/app/models/post"
import type { PaginatedResult } from "@zaenpm/beaver/pkg/types"
import type { Post, PostFilters, PostWithRelations, PublicArchiveFilterOptions, PublicArchiveFilters, PublicPost, PublicSearchResult } from "@zaenpm/beaver/pkg/types/posts"

type UserAuthor = { id: string; name: string; email: string }
type CategoryRef = { id: string; name: string; slug: string }

export type DashboardStats = {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalMedia: number
  totalUsers: number
  totalCategories: number
}

function clampPagination(filters: { page?: number; perPage?: number }) {
  const page = Math.max(1, filters.page ?? 1)
  const perPage = Math.min(100, Math.max(1, filters.perPage ?? 20))
  const offset = (page - 1) * perPage
  return { page, perPage, offset }
}

function buildPaginationMeta(
  page: number,
  perPage: number,
  total: number,
  offset: number,
): PaginatedResult<unknown>["meta"] {
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const from = total > 0 ? offset + 1 : 0
  const to = Math.min(offset + perPage, total)
  return { currentPage: page, perPage, total, lastPage, from, to }
}

function generateUlid() {
  const ts = Date.now().toString(32).padStart(10, "0").toUpperCase()
  const rand = Array.from(
    { length: 16 },
    () => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)],
  ).join("")
  return ts + rand
}

export function findPostByIdRecord(id: string) {
  const row = db.select().from(posts).where(eq(posts.id, id)).get() as PostRecord | undefined
  if (!row) return undefined

  const author = db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, row.authorId))
    .get() as UserAuthor | undefined

  const postCategoriesRows = db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(postCategories)
    .innerJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(eq(postCategories.postId, id))
    .all() as CategoryRef[]

  return {
    ...row,
    author: author ?? null,
    categories: postCategoriesRows,
  } as PostWithRelations
}

export function findPostBySlugRecord(slug: string) {
  return db.select().from(posts).where(eq(posts.slug, slug)).get() as PostRecord | undefined
}

export function findPublishedBySlugRecord(slug: string) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      status: posts.status,
      excerpt: posts.excerpt,
      description: posts.description,
      tags: posts.tags,
      sections: posts.sections,
      customFieldValues: posts.customFieldValues,
      metaTitle: posts.metaTitle,
      metaDescription: posts.metaDescription,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      authorId: posts.authorId,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .get() as (Post & { authorName: string | null }) | undefined
}

export function findPublishedByTypeAndSlugRecord(type: string, slug: string) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      status: posts.status,
      excerpt: posts.excerpt,
      description: posts.description,
      tags: posts.tags,
      sections: posts.sections,
      customFieldValues: posts.customFieldValues,
      metaTitle: posts.metaTitle,
      metaDescription: posts.metaDescription,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      authorId: posts.authorId,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.type, type), eq(posts.slug, slug), eq(posts.status, "published")))
    .get() as (Post & { authorName: string | null }) | undefined
}

export function listPostRecords(filters: PostFilters = {}) {
  const { page, perPage, offset } = clampPagination(filters)
  const conditions: SQL<unknown>[] = []

  if (filters.search) {
    conditions.push(like(posts.title, `%${filters.search}%`))
  }
  if (filters.type) {
    conditions.push(eq(posts.type, filters.type))
  }
  if (filters.status) {
    conditions.push(eq(posts.status, filters.status))
  }
  if (filters.authorId) {
    conditions.push(eq(posts.authorId, filters.authorId))
  }
  if (filters.categoryId) {
    const matchingPostIds = db
      .select({ postId: postCategories.postId })
      .from(postCategories)
      .where(eq(postCategories.categoryId, filters.categoryId))
      .all()
      .map((row) => row.postId)

    if (matchingPostIds.length === 0) {
      return { data: [], meta: buildPaginationMeta(page, perPage, 0, offset) }
    }

    conditions.push(inArray(posts.id, matchingPostIds))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const totalQuery = db.select({ value: count() }).from(posts)
  const totalRows = whereClause
    ? (totalQuery.where(whereClause) as typeof totalQuery).all()
    : totalQuery.all()
  const total = totalRows[0]?.value ?? 0

  const dataQuery = db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    status: posts.status,
    excerpt: posts.excerpt,
    description: posts.description,
    tags: posts.tags,
    sections: posts.sections,
    customFieldValues: posts.customFieldValues,
    metaTitle: posts.metaTitle,
    metaDescription: posts.metaDescription,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    authorId: posts.authorId,
    publishedAt: posts.publishedAt,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    authorName: users.name,
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id))

  // Build orderBy clause from sort params
  const orderColumn = filters.sortBy === "title"
    ? (filters.sortOrder === "asc" ? posts.title : desc(posts.title))
    : filters.sortBy === "updatedAt" && filters.sortOrder === "asc"
      ? posts.updatedAt
      : desc(posts.updatedAt)

  const data = (whereClause ? dataQuery.where(whereClause) : dataQuery)
    .orderBy(orderColumn)
    .limit(perPage)
    .offset(offset)
    .all() as PostRecord[]

  return {
    data,
    meta: buildPaginationMeta(page, perPage, total, offset),
  }
}

export function listPublishedPostRecords(page = 1, perPage = 12) {
  const clampedPage = Math.max(1, page)
  const clampedPerPage = Math.min(100, Math.max(1, perPage))
  const offset = (clampedPage - 1) * clampedPerPage

  const data = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      excerpt: posts.excerpt,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      publishedAt: posts.publishedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .limit(clampedPerPage)
    .offset(offset)
    .all() as PublicPost[]

  const total =
    (
      db
        .select({ value: count() })
        .from(posts)
        .where(eq(posts.status, "published"))
        .all() as { value: number }[]
    )[0]?.value ?? 0

  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, total, offset),
  }
}

export function listPublishedPostRecordsByType(type: string, page = 1, perPage = 12, filters: PublicArchiveFilters = {}) {
  const clampedPage = Math.max(1, page)
  const clampedPerPage = Math.min(100, Math.max(1, perPage))
  const offset = (clampedPage - 1) * clampedPerPage
  const conditions: SQL<unknown>[] = [eq(posts.type, type), eq(posts.status, "published")]

  if (filters.search) {
    const pattern = `%${filters.search}%`
    conditions.push(or(like(posts.title, pattern), like(posts.excerpt, pattern), like(posts.description, pattern))!)
  }
  if (filters.category) {
    const category = db.select({ id: categories.id }).from(categories).where(and(or(eq(categories.slug, filters.category), eq(categories.id, filters.category))!, eq(categories.status, "published"))).get()
    if (!category) return { data: [], meta: buildPaginationMeta(clampedPage, clampedPerPage, 0, offset) }
    const matchingPostIds = db.select({ postId: postCategories.postId }).from(postCategories).where(eq(postCategories.categoryId, category.id)).all().map((row) => row.postId)
    if (matchingPostIds.length === 0) return { data: [], meta: buildPaginationMeta(clampedPage, clampedPerPage, 0, offset) }
    conditions.push(inArray(posts.id, matchingPostIds))
  }
  if (filters.tag) {
    conditions.push(sql`json_valid(${posts.tags})`)
    conditions.push(sql`exists (select 1 from json_each(${posts.tags}) where lower(value) = lower(${filters.tag}))`)
  }
  for (const [fieldName, value] of Object.entries(filters.customFields ?? {})) {
    conditions.push(sql`json_valid(${posts.customFieldValues})`)
    conditions.push(sql`cast(json_extract(${posts.customFieldValues}, ${`$.${fieldName}`}) as text) = ${value}`)
  }
  const condition = and(...conditions)

  const data = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      excerpt: posts.excerpt,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      publishedAt: posts.publishedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(condition)
    .orderBy(filters.sortBy === "title"
      ? (filters.sortOrder === "desc" ? desc(posts.title) : posts.title)
      : filters.sortOrder === "asc" ? posts.createdAt : desc(posts.createdAt))
    .limit(clampedPerPage)
    .offset(offset)
    .all() as PublicPost[]

  const total = (db.select({ value: count() }).from(posts).where(condition).all() as { value: number }[])[0]?.value ?? 0

  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, total, offset),
  }
}

export function listPublishedArchiveFilterOptionsByType(type: string): PublicArchiveFilterOptions {
  const categoryOptions = db
    .selectDistinct({ name: categories.name, slug: categories.slug })
    .from(categories)
    .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
    .innerJoin(posts, eq(postCategories.postId, posts.id))
    .where(and(eq(posts.type, type), eq(posts.status, "published"), eq(categories.status, "published")))
    .orderBy(asc(categories.name))
    .all()

  const tagRows = db
    .select({ tags: posts.tags })
    .from(posts)
    .where(and(eq(posts.type, type), eq(posts.status, "published")))
    .all()
  const tags = [...new Set(tagRows.flatMap(({ tags }) => {
    try {
      const value = tags ? JSON.parse(tags) : []
      return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean) : []
    } catch {
      return []
    }
  }))].sort((a, b) => a.localeCompare(b))

  return { categories: categoryOptions, tags, customFields: [] }
}

/** Search only content which is safe to expose on the public website. */
export function searchPublishedPostRecords(query: string, page = 1, perPage = 12) {
  const clampedPage = Math.max(1, page)
  const clampedPerPage = Math.min(100, Math.max(1, perPage))
  const offset = (clampedPage - 1) * clampedPerPage
  const pattern = `%${query}%`
  const condition = and(
    eq(posts.status, "published"),
    or(
      like(posts.title, pattern),
      like(posts.excerpt, pattern),
      like(posts.description, pattern),
    ),
  )

  const data = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      excerpt: posts.excerpt,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      publishedAt: posts.publishedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(condition)
    .orderBy(desc(posts.publishedAt))
    .limit(clampedPerPage)
    .offset(offset)
    .all() as PublicSearchResult[]

  const total = (db.select({ value: count() }).from(posts).where(condition).all() as { value: number }[])[0]?.value ?? 0

  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, total, offset),
  }
}

/** List published items whose JSON tag list contains the requested tag. */
export function listPublishedPostRecordsByTag(tag: string, page = 1, perPage = 12) {
  const clampedPage = Math.max(1, page)
  const clampedPerPage = Math.min(100, Math.max(1, perPage))
  const offset = (clampedPage - 1) * clampedPerPage
  const condition = and(
    eq(posts.status, "published"),
    sql`json_valid(${posts.tags})`,
    sql`exists (select 1 from json_each(${posts.tags}) where lower(value) = lower(${tag}))`,
  )

  const data = db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      excerpt: posts.excerpt,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      publishedAt: posts.publishedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(condition)
    .orderBy(desc(posts.publishedAt))
    .limit(clampedPerPage)
    .offset(offset)
    .all() as PublicPost[]

  const total = (db.select({ value: count() }).from(posts).where(condition).all() as { value: number }[])[0]?.value ?? 0

  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, total, offset),
  }
}

export function getDashboardStatsRecord(): DashboardStats {
  return {
    totalPosts: (db.select({ value: count() }).from(posts).all() as { value: number }[])[0]?.value ?? 0,
    publishedPosts:
      (db.select({ value: count() }).from(posts).where(eq(posts.status, "published")).all() as { value: number }[])[0]?.value ?? 0,
    draftPosts:
      (db.select({ value: count() }).from(posts).where(eq(posts.status, "draft")).all() as { value: number }[])[0]?.value ?? 0,
    totalMedia: (db.select({ value: count() }).from(media).all() as { value: number }[])[0]?.value ?? 0,
    totalUsers: (db.select({ value: count() }).from(users).all() as { value: number }[])[0]?.value ?? 0,
    totalCategories:
      (db.select({ value: count() }).from(categories).all() as { value: number }[])[0]?.value ?? 0,
  }
}

export function listRecentPostRecords(limit = 5) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      createdAt: posts.createdAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .all() as { id: string; title: string; status: string; createdAt: number; authorName: string | null }[]
}

export function listCategoriesForPostRecord(postId: string) {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(postCategories)
    .innerJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(eq(postCategories.postId, postId))
    .all() as CategoryRef[]
}

export function createPostRecord(input: {
  id: string
  title: string
  slug: string
  type: string
  status: string
  excerpt: string | null
  description: string | null
  tags: string | null
  sections: string | null
  customFieldValues: string | null
  metaTitle: string | null
  metaDescription: string | null
  featuredImage: string | null
  gallery: string | null
  authorId: string
  publishedAt: number | null
  createdAt: number
  updatedAt: number
}) {
  db.insert(posts).values(input).run()
  return db.select().from(posts).where(eq(posts.id, input.id)).get() as PostRecord
}

export function updatePostRecord(
  id: string,
  input: Partial<{
    title: string
    slug: string
    type: string
    status: string
    excerpt: string | null
    description: string | null
    tags: string | null
    sections: string | null
    customFieldValues: string | null
    metaTitle: string | null
    metaDescription: string | null
    featuredImage: string | null
    gallery: string | null
    publishedAt: number | null
    updatedAt: number
  }>,
) {
  db.update(posts).set(input).where(eq(posts.id, id)).run()
  return db.select().from(posts).where(eq(posts.id, id)).get() as PostRecord
}

export function deletePostRecord(id: string) {
  return db.delete(posts).where(eq(posts.id, id)).run().changes > 0
}

export function syncPostCategoriesRecord(postId: string, categoryIds: string[], now: number) {
  db.delete(postCategories).where(eq(postCategories.postId, postId)).run()

  for (const categoryId of categoryIds) {
    db.insert(postCategories)
      .values({
        id: generateUlid(),
        postId,
        categoryId,
        createdAt: now,
      })
      .run()
  }
}
