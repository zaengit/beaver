import { and, asc, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { affectedRows } from "@zbeaver/beaver/app/db/query"
import { categories, media, postCategories, posts, users } from "@zbeaver/beaver/app/db/schema"
import type { PostRecord } from "@zbeaver/beaver/app/models/post"
import type { PaginatedResult } from "@zbeaver/beaver/pkg/types"
import type { Post, PostFilters, PostWithRelations, PublicArchiveFilterOptions, PublicArchiveFilters, PublicPost } from "@zbeaver/beaver/pkg/types/posts"
import { generateId } from "@zbeaver/beaver/pkg/utils/id"
import { clampPage, clampPagination, clampPerPage } from "@zbeaver/beaver/pkg/utils/pagination"

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
    author: authorRows[0] ?? null,
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
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.type, type), eq(posts.slug, slug), eq(posts.status, "published")))
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

  if (search) conditions.push(like(posts.title, `%${search}%`))
  if (type) conditions.push(eq(posts.type, type))
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
    authorName: users.name,
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

export async function listPublishedPostRecordsByType(type: string, page = 1, perPage = 12, filters: PublicArchiveFilters = {}) {
  const clampedPage = clampPage(page)
  const clampedPerPage = clampPerPage(perPage, 12)
  const offset = (clampedPage - 1) * clampedPerPage
  const conditions: SQL<unknown>[] = [eq(posts.type, type), eq(posts.status, "published")]

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
      authorName: users.name,
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
    .where(and(eq(posts.type, type), eq(posts.status, "published"), eq(categories.status, "published")))
    .orderBy(asc(categories.name))
    .limit(5_000)
    .execute()

  const tagRows = await db
    .select({ tags: posts.tags })
    .from(posts)
    .where(and(eq(posts.type, type), eq(posts.status, "published")))
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

export async function searchPublishedPostRecords(query: string, page = 1, perPage = 12) {
  const clampedPage = clampPage(page)
  const clampedPerPage = clampPerPage(perPage, 12)
  const offset = (clampedPage - 1) * clampedPerPage
  const pattern = `%${query}%`
  const condition = and(
    eq(posts.status, "published"),
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
      authorName: users.name,
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

export async function listPublishedPostRecordsByTag(tag: string, page = 1, perPage = 12) {
  const clampedPage = clampPage(page)
  const clampedPerPage = clampPerPage(perPage, 12)
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
      authorName: users.name,
      tags: posts.tags,
      customFieldValues: posts.customFieldValues,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt))
    .execute() as FilterablePublicPost[]
  const filtered = rows.filter((row) => hasTag(row.tags, tag))
  return {
    data: filtered.slice(offset, offset + clampedPerPage).map(stripFilterFields),
    meta: buildPaginationMeta(clampedPage, clampedPerPage, filtered.length, offset),
  }
}

export async function getDashboardStatsRecord(): Promise<DashboardStats> {
  const [totalPosts, publishedPosts, draftPosts, totalMedia, totalUsers, totalCategories] = await Promise.all([
    db.select({ value: count() }).from(posts).execute(),
    db.select({ value: count() }).from(posts).where(eq(posts.status, "published")).execute(),
    db.select({ value: count() }).from(posts).where(eq(posts.status, "draft")).execute(),
    db.select({ value: count() }).from(media).execute(),
    db.select({ value: count() }).from(users).execute(),
    db.select({ value: count() }).from(categories).execute(),
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

export async function deletePostRecord(id: string) {
  const result = await db.delete(posts).where(eq(posts.id, id)).execute()
  return affectedRows(result) > 0
}

export async function syncPostCategoriesRecord(postId: string, categoryIds: string[], now: number) {
  await db.delete(postCategories).where(eq(postCategories.postId, postId)).execute()
  for (const categoryId of categoryIds) {
    await db.insert(postCategories).values({ id: generateId(), postId, categoryId, createdAt: now }).execute()
  }
}
