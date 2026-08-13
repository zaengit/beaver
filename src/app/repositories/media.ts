import { and, desc, eq, like } from "drizzle-orm"

import { db } from "zadm/app/db"
import { media } from "zadm/app/db/schema"
import type { MediaRecord } from "zadm/app/models/media"

export type MediaRow = MediaRecord

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
  const page = Math.max(1, filters.page ?? 1)
  const perPage = Math.min(100, Math.max(1, filters.perPage ?? 20))
  const conditions = []

  if (filters.search) {
    conditions.push(like(media.name, `%${filters.search}%`))
  }
  if (filters.folder !== undefined) {
    conditions.push(filters.folder === null ? eq(media.folder, null as unknown as string) : eq(media.folder, filters.folder))
  }
  if (filters.mimeType && filters.mimeType !== "all") {
    conditions.push(
      filters.mimeType.endsWith("/*")
        ? like(media.mimeType, filters.mimeType.replace("*", "%"))
        : eq(media.mimeType, filters.mimeType),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  let query = db.select().from(media)
  if (whereClause) query = query.where(whereClause) as typeof query

  const totalQuery = db.select({ id: media.id }).from(media)
  const total = whereClause ? (totalQuery.where(whereClause) as typeof totalQuery).all().length : totalQuery.all().length
  const data = query.orderBy(desc(media.createdAt)).limit(perPage).offset((page - 1) * perPage).all() as MediaRow[]

  return {
    data,
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage: Math.max(1, Math.ceil(total / perPage)),
      from: total === 0 ? 0 : (page - 1) * perPage + 1,
      to: Math.min(page * perPage, total),
    },
  }
}

export function getMediaFolderRecords() {
  return (
    db
      .selectDistinct({ folder: media.folder })
      .from(media)
      .all() as { folder: string | null }[]
  )
    .map((row) => row.folder)
    .filter((folder): folder is string => folder !== null)
    .sort()
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
