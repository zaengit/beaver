import { and, count, desc, eq, gte, like, lt, lte, or, type SQL } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { activityLogs } from "@zbeaver/beaver/app/db/schema"
import type { ActivityLogFilters, ActivityLogItem, ActivityLogMetadata } from "@zbeaver/beaver/app/models/activity-log"
import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/time"
import { clampPagination } from "@zbeaver/beaver/pkg/utils/pagination"
import { affectedRows } from "@zbeaver/beaver/app/db/query"
import { generateId } from "@zbeaver/beaver/pkg/utils/id"

const MAX_FILTER_TEXT_LENGTH = 100

function parseMetadata(value: string | null): ActivityLogMetadata | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
    return parsed as ActivityLogMetadata
  } catch {
    return null
  }
}

function toActivityLogItem(row: typeof activityLogs.$inferSelect): ActivityLogItem {
  return {
    ...row,
    metadata: parseMetadata(row.metadata),
  }
}

export async function createActivityLogRecord(input: {
  actorId?: string | null
  actorName?: string | null
  actorEmail?: string | null
  action: string
  resource: string
  resourceId?: string | null
  metadata?: ActivityLogMetadata | null
  ipAddress?: string | null
  userAgent?: string | null
  success: boolean
  statusCode: number
  createdAt?: number
}) {
  const now = input.createdAt ?? getCurrentTimestamp()
  const row = {
    id: generateId(),
    actorId: input.actorId ?? null,
    actorName: input.actorName ?? null,
    actorEmail: input.actorEmail ?? null,
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    success: input.success ? 1 : 0,
    statusCode: input.statusCode,
    createdAt: now,
  }

  await db.insert(activityLogs).values(row).execute()
  return toActivityLogItem({ ...row, metadata: row.metadata })
}

export async function listActivityLogRecords(filters: ActivityLogFilters = {}) {
  const { page, perPage, offset } = clampPagination(filters)
  const conditions: SQL[] = []

  const search = filters.search?.trim().slice(0, MAX_FILTER_TEXT_LENGTH)
  if (search) {
    const pattern = `%${search}%`
    conditions.push(
      or(
        like(activityLogs.actorName, pattern),
        like(activityLogs.actorEmail, pattern),
        like(activityLogs.action, pattern),
        like(activityLogs.resource, pattern),
        like(activityLogs.resourceId, pattern),
      ) as SQL,
    )
  }
  if (filters.action) conditions.push(eq(activityLogs.action, filters.action))
  if (filters.resource) conditions.push(eq(activityLogs.resource, filters.resource))
  if (filters.success !== undefined) conditions.push(eq(activityLogs.success, filters.success ? 1 : 0))
  if (filters.from !== undefined) conditions.push(gte(activityLogs.createdAt, filters.from))
  if (filters.to !== undefined) conditions.push(lte(activityLogs.createdAt, filters.to))

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined
  const totalQuery = db.select({ value: count() }).from(activityLogs)
  const totalRows = whereClause
    ? await totalQuery.where(whereClause).execute()
    : await totalQuery.execute()
  const total = Number(totalRows[0]?.value ?? 0)
  const lastPage = Math.max(1, Math.ceil(total / perPage))

  const dataQuery = db.select().from(activityLogs)
  const rows = await (whereClause ? dataQuery.where(whereClause) : dataQuery)
    .orderBy(desc(activityLogs.createdAt), desc(activityLogs.id))
    .limit(perPage)
    .offset(offset)
    .execute()

  return {
    data: rows.map(toActivityLogItem),
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage,
      from: total > 0 ? offset + 1 : 0,
      to: Math.min(offset + perPage, total),
    },
  }
}

export async function deleteActivityLogsBefore(timestamp: number) {
  const result = await db.delete(activityLogs)
    .where(lt(activityLogs.createdAt, timestamp))
    .execute()
  return affectedRows(result)
}
