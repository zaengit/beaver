import { and, count, desc, eq, like } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { media } from "@zbeaver/beaver/app/db/schema"
import type { MediaRecord } from "@zbeaver/beaver/app/models/media"
import { clampPagination } from "@zbeaver/beaver/pkg/utils/pagination"
import { affectedRows } from "@zbeaver/beaver/app/db/query"

export type MediaRow = MediaRecord
const MAX_FILTER_TEXT_LENGTH = 100

export async function findMediaByIdRecord(id: string) {
  const rows = await db.select().from(media).where(eq(media.id, id)).limit(1).execute()
  return rows[0] as MediaRow | undefined
}

export async function listMediaRecords(filters: {
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
        ? like(media.mimeType, `${mimeType.slice(0, -1)}%`)
        : eq(media.mimeType, mimeType),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  let query = db.select().from(media)
  if (whereClause) query = query.where(whereClause) as typeof query

  const totalQuery = db.select({ value: count() }).from(media)
  const totalRows = whereClause ? await (totalQuery.where(whereClause) as typeof totalQuery).execute() : await totalQuery.execute()
  const total = totalRows[0]?.value ?? 0
  const data = await query.orderBy(desc(media.createdAt)).limit(perPage).offset(offset).execute() as MediaRow[]

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

export async function createMediaRecord(input: {
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
  await db.insert(media).values(input).execute()
  return (await findMediaByIdRecord(input.id))!
}

export async function updateMediaRecord(id: string, input: {
  name?: string
  alt?: string | null
  caption?: string | null
  folder?: string | null
  updatedAt: number
}) {
  await db.update(media).set(input).where(eq(media.id, id)).execute()
  return await findMediaByIdRecord(id) ?? null
}

export async function deleteMediaRecord(id: string) {
  const result = await db.delete(media).where(eq(media.id, id)).execute()
  return affectedRows(result) > 0
}
