import { and, count, desc, eq, like } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { media } from "@zbeaver/beaver/app/db/schema"
import type { MediaRecord } from "@zbeaver/beaver/app/models/media"
import { clampPagination } from "@zbeaver/beaver/pkg/utils/pagination"

export type MediaRow = MediaRecord
const MAX_FILTER_TEXT_LENGTH = 100

export function findMediaByIdRecord(id: string) {
  return db.select().from(media).where(eq(media.id, id)).get() as MediaRow | undefined
}

export function listMediaRecords(filters: {
  page?: number
  perPage?: number
  search?: string
  folder?: string | null
  mimeType?: string
}) {
  const { page, perPage, offset } = clampPagination(filters)
  const conditions = []
  const search = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH)
  const folder = filters.folder === null ? null : filters.folder?.slice(0, 255)
  const mimeType = filters.mimeType?.slice(0, 100)

  if (search) {
    conditions.push(like(media.name, `%${search}%`))
  }
  if (filters.folder !== undefined) {
    if (folder === null) conditions.push(eq(media.folder, null as unknown as string))
    else if (folder !== undefined) conditions.push(eq(media.folder, folder))
  }
  if (mimeType && mimeType !== "all") {
    conditions.push(
      mimeType.endsWith("/*")
        ? like(media.mimeType, mimeType.replace("*", "%"))
        : eq(media.mimeType, mimeType),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  let query = db.select().from(media)
  if (whereClause) query = query.where(whereClause) as typeof query

  const totalQuery = db.select({ value: count() }).from(media)
  const totalRows = whereClause ? (totalQuery.where(whereClause) as typeof totalQuery).all() : totalQuery.all()
  const total = totalRows[0]?.value ?? 0
  const data = query.orderBy(desc(media.createdAt)).limit(perPage).offset(offset).all() as MediaRow[]

  return {
    data,
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage: Math.max(1, Math.ceil(total / perPage)),
      from: total === 0 ? 0 : offset + 1,
      to: Math.min(offset + perPage, total),
    },
  }
}

export function createMediaRecord(input: {
  id: string
  userId: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string | null
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  folder?: string | null
  createdAt: number
  updatedAt: number
}) {
  db.insert(media).values(input).run()
  return findMediaByIdRecord(input.id)!
}

export function updateMediaRecord(id: string, input: {
  name?: string
  alt?: string | null
  caption?: string | null
  folder?: string | null
  updatedAt: number
}) {
  db.update(media).set(input).where(eq(media.id, id)).run()
  return findMediaByIdRecord(id) ?? null
}

export function deleteMediaRecord(id: string) {
  return db.delete(media).where(eq(media.id, id)).run().changes > 0
}
