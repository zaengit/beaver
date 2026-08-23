import { and, asc, desc, eq, like, type SQL } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { categories } from "@zbeaver/beaver/app/db/schema"
import type { CategoryRecord } from "@zbeaver/beaver/app/models/category"
import { sanitizeText } from "@zbeaver/beaver/pkg/security/sanitize"
import { affectedRows } from "@zbeaver/beaver/app/db/query"

export type CategoryRow = Pick<
  CategoryRecord,
  "id" | "name" | "slug" | "type" | "description" | "image" | "status" | "createdAt" | "updatedAt"
>

const MAX_CATEGORY_ROWS = 5_000

export async function findCategoryByIdRecord(id: string) {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      type: categories.type,
      description: categories.description,
      image: categories.image,
      status: categories.status,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)
    .execute()
  return rows[0] as CategoryRow | undefined
}

export async function findCategoryBySlugRecord(slug: string) {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      type: categories.type,
      description: categories.description,
      image: categories.image,
      status: categories.status,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)
    .execute()
  return rows[0] as CategoryRow | undefined
}

export async function listCategoryRecords(filters?: { type?: string; search?: string; sortBy?: string; sortOrder?: string }) {
  const conditions: SQL<unknown>[] = []
  const type = filters?.type?.slice(0, 64)
  const search = filters?.search?.slice(0, 100)

  if (type) {
    conditions.push(eq(categories.type, type))
  }
  if (search) {
    conditions.push(like(categories.name, `%${search}%`))
  }

  // Build sort
  let orderColumn = desc(categories.updatedAt)
  if (filters?.sortBy) {
    const column =
      filters.sortBy === "name" ? categories.name :
      filters.sortBy === "createdAt" ? categories.createdAt :
      null
    if (column) {
      orderColumn = filters.sortOrder === "asc" ? asc(column) : desc(column)
    }
  }

  const query = db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      type: categories.type,
      description: categories.description,
      image: categories.image,
      status: categories.status,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
    })
    .from(categories)
    .orderBy(orderColumn)

  return await (conditions.length > 0 ? query.where(and(...conditions)) : query).limit(MAX_CATEGORY_ROWS).execute() as CategoryRow[]
}

export async function categorySlugExistsRecord(slug: string, excludeId?: string) {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)
    .execute()

  return excludeId ? rows.some((row: { id: string }) => row.id !== excludeId) : rows.length > 0
}

export async function createCategoryRecord(input: {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  image: string | null
  status: "draft" | "published"
  createdAt: number
  updatedAt: number
}) {
  await db.insert(categories).values({
    ...input,
    name: sanitizeText(input.name),
    description: input.description ? sanitizeText(input.description) : null,
  }).execute()

  return {
    id: input.id,
    name: sanitizeText(input.name),
    slug: input.slug,
    type: input.type,
    description: input.description ? sanitizeText(input.description) : null,
    image: input.image,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }
}

export async function updateCategoryRecord(id: string, input: {
  name?: string
  slug?: string
  type?: string
  description?: string | null
  image?: string | null
  status?: "draft" | "published"
  updatedAt: number
}) {
  const updates: Record<string, unknown> = { updatedAt: input.updatedAt }
  if (input.name !== undefined) updates.name = sanitizeText(input.name)
  if (input.slug !== undefined) updates.slug = input.slug
  if (input.type !== undefined) updates.type = input.type
  if (input.description !== undefined) updates.description = input.description ? sanitizeText(input.description) : null
  if (input.image !== undefined) updates.image = input.image
  if (input.status !== undefined) updates.status = input.status

  await db.update(categories).set(updates).where(eq(categories.id, id)).execute()

  return await findCategoryByIdRecord(id) ?? null
}

export async function deleteCategoryRecord(id: string) {
  const result = await db.delete(categories).where(eq(categories.id, id)).execute()
  return affectedRows(result) > 0
}
