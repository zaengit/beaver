import { and, asc, count, desc, eq, gt, inArray, isNotNull, isNull, like, lte, or, sql, type SQL } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { affectedRows } from "@zbeaver/beaver/app/db/query"
import { categories, media, postCategories, posts, users } from "@zbeaver/beaver/app/db/schema"
import type { PostRecord } from "@zbeaver/beaver/app/models/post"
import type { PaginatedResult } from "@zbeaver/beaver/pkg/types"
import type { Post, PostFilters, PostWithRelations, PublicArchiveFilterOptions, PublicArchiveFilters, PublicPost } from "@zbeaver/beaver/pkg/types/posts"
import { generateId } from "@zbeaver/beaver/pkg/utils/id"
import { clampPage, clampPagination, clampPerPage } from "@zbeaver/beaver/pkg/utils/pagination"
import { getSuperAdminUser, SUPER_ADMIN_USER_ID } from "@zbeaver/beaver/app/admin/super-admin"

type UserAuthor = { id: string; name: string; email: string }
type CategoryRef = { id: string; name: string; slug: string }
type FilterablePublicPost = PublicPost & { tags: string | null; customFieldValues: string | null; createdAt: number }

export type DashboardStats = {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalMedia: number
  totalUsers: number
  totalCategories: number
}

const MAX_FILTER_TEXT_LENGTH = 100

function publicPublishedCondition(now = Date.now()) {
  return and(
    isNull(posts.deletedAt),
    eq(posts.status, "published"),
    or(isNull(posts.publishedAt), lte(posts.publishedAt, now))!,
  )!
}

function activePostCondition() {
  return isNull(posts.deletedAt)
}

function trashedPostCondition() {
  return isNotNull(posts.deletedAt)
}

function authorNameExpression() {
  return sql<string | null>`CASE WHEN ${posts.authorId} = ${SUPER_ADMIN_USER_ID} THEN ${getSuperAdminUser().name} ELSE ${users.name} END`
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

function parseJson(value: string | null | undefined): unknown {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function hasTag(value: string | null | undefined, tag: string) {
  const parsed = parseJson(value)
  return Array.isArray(parsed) && parsed.some((item) => typeof item === "string" && item.toLowerCase() === tag.toLowerCase())
}

function matchesCustomFields(value: string | null | undefined, fields: Record<string, string>) {
  if (Object.keys(fields).length === 0) return true
  const parsed = parseJson(value)
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false
  const record = parsed as Record<string, unknown>
  return Object.entries(fields).every(([key, expected]) => String(record[key] ?? "") === expected)
}

function stripFilterFields(row: FilterablePublicPost): PublicPost {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => key !== "tags" && key !== "customFieldValues" && key !== "createdAt"),
  ) as PublicPost
}

export async function findPostByIdRecord(id: string) {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1).execute()
  const row = rows[0] as PostRecord | undefined
  if (!row) return undefined

  const [authorRows, postCategoriesRows] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, row.authorId))
      .limit(1)
      .execute() as Promise<UserAuthor[]>,
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(postCategories)
      .innerJoin(categories, eq(postCategories.categoryId, categories.id))
      .where(eq(postCategories.postId, id))
      .execute() as Promise<CategoryRef[]>,
  ])

  return {
    ...row,
    author: authorRows[0] ?? (row.authorId === SUPER_ADMIN_USER_ID
      ? (() => {
          const user = getSuperAdminUser()
          return { id: user.id, name: user.name, email: user.email }
        })()
      : null),
    categories: postCategoriesRows,
  } as PostWithRelations
}

export async function findPostBySlugRecord(slug: string) {
  const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1).execute()
  return rows[0] as PostRecord | undefined
}

export async function findPublishedByTypeAndSlugRecord(type: string, slug: string) {
  const rows = await db
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
      authorName: authorNameExpression(),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.type, type), eq(posts.slug, slug), publicPublishedCondition()))
    .limit(1)
    .execute()
  return rows[0] as (Post & { authorName: string | null }) | undefined
}

export async function listPostRecords(filters: PostFilters = {}) {
  const { page, perPage, offset } = clampPagination(filters)
  const conditions: SQL<unknown>[] = []
  const search = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH)
  const type = filters.type?.slice(0, 64)
  const status = filters.status?.slice(0, 32)
  const authorId = filters.authorId?.slice(0, 128)
  const categoryId = filters.categoryId?.slice(0, 128)

  conditions.push(filters.trash ? trashedPostCondition() : activePostCondition())

  if (search) conditions.push(like(posts.title, `%${search}%`))
  if (type) conditions.push(eq(posts.type, type))
  if (filters.types) {
    if (filters.types.length === 0) {
      return { data: [], meta: buildPaginationMeta(page, perPage, 0, offset) }
    }
    conditions.push(inArray(posts.type, filters.types.slice(0, 100)))
  }
  if (status) conditions.push(eq(posts.status, status))
  if (authorId) conditions.push(eq(posts.authorId, authorId))
  if (categoryId) {
    conditions.push(sql`exists (
      select 1 from ${postCategories}
      where ${postCategories.postId} = ${posts.id}
        and ${postCategories.categoryId} = ${categoryId}
    )`)
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const totalQuery = db.select({ value: count() }).from(posts)
  const totalRows = whereClause
    ? await totalQuery.where(whereClause).execute()
    : await totalQuery.execute()
  const total = Number(totalRows[0]?.value ?? 0)

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
    deletedAt: posts.deletedAt,
    authorName: authorNameExpression(),
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id))

  const orderColumn = filters.sortBy === "title"
    ? (filters.sortOrder === "asc" ? posts.title : desc(posts.title))
    : filters.sortBy === "updatedAt" && filters.sortOrder === "asc"
      ? posts.updatedAt
      : desc(posts.updatedAt)

  const data = await (whereClause ? dataQuery.where(whereClause) : dataQuery)
    .orderBy(orderColumn)
    .limit(perPage)
    .offset(offset)
    .execute() as PostRecord[]

  return { data, meta: buildPaginationMeta(page, perPage, total, offset) }
}

export async function listPublishedPostRecordsByType(type: string, page = 1, perPage = 10, filters: PublicArchiveFilters = {}) {
  const clampedPage = clampPage(page)
  const clampedPerPage = clampPerPage(perPage, 10)
  const offset = (clampedPage - 1) * clampedPerPage
  const conditions: SQL<unknown>[] = [eq(posts.type, type), publicPublishedCondition()]

  const search = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH)
  if (search) {
    const pattern = `%${search}%`
    conditions.push(or(like(posts.title, pattern), like(posts.excerpt, pattern), like(posts.description, pattern))!)
  }
  if (filters.category) {
    const categoryRows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(or(eq(categories.slug, filters.category), eq(categories.id, filters.category))!, eq(categories.status, "published")))
      .limit(1)
      .execute()
    const category = categoryRows[0]
    if (!category) return { data: [], meta: buildPaginationMeta(clampedPage, clampedPerPage, 0, offset) }
    conditions.push(sql`exists (
      select 1 from ${postCategories}
      where ${postCategories.postId} = ${posts.id}
        and ${postCategories.categoryId} = ${category.id}
    )`)
  }

  const condition = and(...conditions)
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      excerpt: posts.excerpt,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      publishedAt: posts.publishedAt,
      authorName: authorNameExpression(),
      tags: posts.tags,
      customFieldValues: posts.customFieldValues,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(condition)
    .orderBy(filters.sortBy === "title"
      ? (filters.sortOrder === "desc" ? desc(posts.title) : posts.title)
      : filters.sortOrder === "asc" ? posts.createdAt : desc(posts.createdAt))
    .execute() as FilterablePublicPost[]

  const filtered = rows
    .filter((row) => !filters.tag || hasTag(row.tags, filters.tag))
    .filter((row) => matchesCustomFields(row.customFieldValues, filters.customFields ?? {}))
  const data = filtered.slice(offset, offset + clampedPerPage).map(stripFilterFields)

  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, filtered.length, offset),
  }
}

export async function listPublishedArchiveFilterOptionsByType(type: string): Promise<PublicArchiveFilterOptions> {
  const categoryOptions = await db
    .selectDistinct({ name: categories.name, slug: categories.slug })
    .from(categories)
    .innerJoin(postCategories, eq(categories.id, postCategories.categoryId))
    .innerJoin(posts, eq(postCategories.postId, posts.id))
    .where(and(eq(posts.type, type), publicPublishedCondition(), eq(categories.status, "published")))
    .orderBy(asc(categories.name))
    .limit(5_000)
    .execute()

  const tagRows = await db
    .select({ tags: posts.tags })
    .from(posts)
    .where(and(eq(posts.type, type), publicPublishedCondition()))
    .limit(5_000)
    .execute()
  const tags: string[] = [...new Set((tagRows as Array<{ tags: string | null }>).flatMap(({ tags }) => {
    const value = parseJson(tags)
    return Array.isArray(value)
      ? value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim().slice(0, 100)).filter(Boolean)
      : []
  }))].sort((a, b) => a.localeCompare(b)).slice(0, 5_000)

  return { categories: categoryOptions, tags, customFields: [] }
}

export async function searchPublishedPostRecords(query: string, page = 1, perPage = 10) {
  const clampedPage = clampPage(page)
  const clampedPerPage = clampPerPage(perPage, 10)
  const offset = (clampedPage - 1) * clampedPerPage
  const pattern = `%${query}%`
  const condition = and(
    publicPublishedCondition(),
    or(like(posts.title, pattern), like(posts.excerpt, pattern), like(posts.description, pattern)),
  )

  const data = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      excerpt: posts.excerpt,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      publishedAt: posts.publishedAt,
      authorName: authorNameExpression(),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(condition)
    .orderBy(desc(posts.publishedAt))
    .limit(clampedPerPage)
    .offset(offset)
    .execute() as PublicPost[]

  const totalRows = await db.select({ value: count() }).from(posts).where(condition).execute() as { value: number }[]
  return { data, meta: buildPaginationMeta(clampedPage, clampedPerPage, Number(totalRows[0]?.value ?? 0), offset) }
}

export async function listPublishedPostRecordsByTag(tag: string, page = 1, perPage = 10) {
  const clampedPage = clampPage(page)
  const clampedPerPage = clampPerPage(perPage, 10)
  const offset = (clampedPage - 1) * clampedPerPage
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      type: posts.type,
      excerpt: posts.excerpt,
      featuredImage: posts.featuredImage,
      gallery: posts.gallery,
      publishedAt: posts.publishedAt,
      authorName: authorNameExpression(),
      tags: posts.tags,
      customFieldValues: posts.customFieldValues,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(publicPublishedCondition())
    .orderBy(desc(posts.publishedAt))
    .execute() as FilterablePublicPost[]
  const filtered = rows.filter((row) => hasTag(row.tags, tag))
  return {
    data: filtered.slice(offset, offset + clampedPerPage).map(stripFilterFields),
    meta: buildPaginationMeta(clampedPage, clampedPerPage, filtered.length, offset),
  }
}

export async function getDashboardStatsRecord(authorId?: string): Promise<DashboardStats> {
  const postOwner = authorId ? eq(posts.authorId, authorId) : undefined
  const postScope = authorId
    ? and(postOwner!, activePostCondition())
    : activePostCondition()
  const publishedCondition = authorId
    ? and(postOwner!, publicPublishedCondition())
    : publicPublishedCondition()
  const draftCondition = authorId
    ? and(postOwner!, activePostCondition(), eq(posts.status, "draft"))
    : and(activePostCondition(), eq(posts.status, "draft"))

  const [totalPosts, publishedPosts, draftPosts, totalMedia, totalUsers, totalCategories] = await Promise.all([
    db.select({ value: count() }).from(posts).where(postScope).execute(),
    db.select({ value: count() }).from(posts).where(publishedCondition).execute(),
    db.select({ value: count() }).from(posts).where(draftCondition).execute(),
    authorId
      ? db.select({ value: count() }).from(media).where(eq(media.userId, authorId)).execute()
      : db.select({ value: count() }).from(media).execute(),
    authorId
      ? Promise.resolve([{ value: 0 }])
      : db.select({ value: count() }).from(users).execute(),
    authorId
      ? Promise.resolve([{ value: 0 }])
      : db.select({ value: count() }).from(categories).execute(),
  ])
  return {
    totalPosts: Number(totalPosts[0]?.value ?? 0),
    publishedPosts: Number(publishedPosts[0]?.value ?? 0),
    draftPosts: Number(draftPosts[0]?.value ?? 0),
    totalMedia: Number(totalMedia[0]?.value ?? 0),
    totalUsers: Number(totalUsers[0]?.value ?? 0),
    totalCategories: Number(totalCategories[0]?.value ?? 0),
  }
}

export async function createPostRecord(input: {
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
  await db.insert(posts).values(input).execute()
  const rows = await db.select().from(posts).where(eq(posts.id, input.id)).limit(1).execute()
  return rows[0] as PostRecord
}

export async function updatePostRecord(
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
  await db.update(posts).set(input).where(eq(posts.id, id)).execute()
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1).execute()
  return rows[0] as PostRecord
}

/** Convert legacy future `published` rows to the worker-owned `scheduled` state. */
export async function normalizeLegacyScheduledPostRecords(now: number) {
  const result = await db
    .update(posts)
    .set({ status: "scheduled" })
    .where(and(activePostCondition(), eq(posts.status, "published"), gt(posts.publishedAt, now)))
    .execute()
  return affectedRows(result)
}

export async function listDueScheduledPostRecords(now: number, limit = 100) {
  return await db
    .select({ id: posts.id, publishedAt: posts.publishedAt })
    .from(posts)
    .where(and(activePostCondition(), eq(posts.status, "scheduled"), lte(posts.publishedAt, now)))
    .orderBy(asc(posts.publishedAt), asc(posts.id))
    .limit(limit)
    .execute() as Array<{ id: string; publishedAt: number | null }>
}

/** Publish only if this worker still owns the due scheduled row. */
export async function publishScheduledPostRecord(id: string, now: number) {
  const result = await db
    .update(posts)
    .set({ status: "published", updatedAt: now })
    .where(and(
      eq(posts.id, id),
      activePostCondition(),
      eq(posts.status, "scheduled"),
      lte(posts.publishedAt, now),
    ))
    .execute()
  return affectedRows(result) > 0
}

export async function trashPostRecord(id: string, deletedAt: number) {
  const result = await db
    .update(posts)
    .set({ deletedAt, updatedAt: deletedAt })
    .where(and(eq(posts.id, id), activePostCondition()))
    .execute()
  return affectedRows(result) > 0
}

export async function restorePostRecord(id: string, updatedAt: number) {
  const result = await db
    .update(posts)
    .set({ deletedAt: null, updatedAt })
    .where(and(eq(posts.id, id), trashedPostCondition()))
    .execute()
  return affectedRows(result) > 0
}

export async function permanentlyDeletePostRecord(id: string) {
  const result = await db.delete(posts).where(and(eq(posts.id, id), trashedPostCondition())).execute()
  return affectedRows(result) > 0
}

/** @deprecated Use permanentlyDeletePostRecord for an explicit hard delete. */
export const deletePostRecord = permanentlyDeletePostRecord

export async function syncPostCategoriesRecord(postId: string, categoryIds: string[], now: number) {
  await db.delete(postCategories).where(eq(postCategories.postId, postId)).execute()
  for (const categoryId of categoryIds) {
    await db.insert(postCategories).values({ id: generateId(), postId, categoryId, createdAt: now }).execute()
  }
}
