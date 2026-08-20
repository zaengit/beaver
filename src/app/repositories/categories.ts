import { and, asc, desc, eq, like, type SQL } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { categories } from "@zbeaver/beaver/app/db/schema"
import type { CategoryRecord } from "@zbeaver/beaver/app/models/category"

export type CategoryRow = Pick<
  CategoryRecord,
  "id" | "name" | "slug" | "type" | "description" | "image" | "status" | "createdAt" | "updatedAt"
>

export function findCategoryByIdRecord(id: string) {
  return db
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
    .get() as CategoryRow | undefined
}

export function findCategoryBySlugRecord(slug: string) {
  return db
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
    .get() as CategoryRow | undefined
}

export function listCategoryRecords(filters?: { type?: string; search?: string; sortBy?: string; sortOrder?: string }) {
  const conditions: SQL<unknown>[] = []

  if (filters?.type) {
    conditions.push(eq(categories.type, filters.type))
  }
  if (filters?.search) {
    conditions.push(like(categories.name, `%${filters.search}%`))
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

  return (conditions.length > 0 ? query.where(and(...conditions)) : query).all() as CategoryRow[]
}

export function categorySlugExistsRecord(slug: string, excludeId?: string) {
  const rows = db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .all()

  return excludeId ? rows.some((row) => row.id !== excludeId) : rows.length > 0
}

export function createCategoryRecord(input: {
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
  db.insert(categories).values(input).run()

  return {
    id: input.id,
    name: input.name,
    slug: input.slug,
    type: input.type,
    description: input.description,
    image: input.image,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }
}

export function updateCategoryRecord(id: string, input: {
  name?: string
  slug?: string
  type?: string
  description?: string | null
  image?: string | null
  status?: "draft" | "published"
  updatedAt: number
}) {
  const updates: Record<string, unknown> = { updatedAt: input.updatedAt }
  if (input.name !== undefined) updates.name = input.name
  if (input.slug !== undefined) updates.slug = input.slug
  if (input.type !== undefined) updates.type = input.type
  if (input.description !== undefined) updates.description = input.description
  if (input.image !== undefined) updates.image = input.image
  if (input.status !== undefined) updates.status = input.status

  db.update(categories).set(updates).where(eq(categories.id, id)).run()

  return findCategoryByIdRecord(id) ?? null
}

export function deleteCategoryRecord(id: string) {
  return db.delete(categories).where(eq(categories.id, id)).run().changes > 0
}
