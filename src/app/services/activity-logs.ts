import { getActivityLogRetentionCutoff } from "@zbeaver/beaver/app/config/activity-log"
import { findCategoryByIdRecord } from "@zbeaver/beaver/app/repositories/categories"
import { findMediaByIdRecord } from "@zbeaver/beaver/app/repositories/media"
import { findMenuById } from "@zbeaver/beaver/app/repositories/menus"
import { findPostByIdRecord } from "@zbeaver/beaver/app/repositories/posts"
import { findSafeUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"
import { getSiteSettings } from "@zbeaver/beaver/app/services/settings"
import {
  createActivityLogRecord,
  deleteActivityLogsBefore,
  listActivityLogRecords,
} from "@zbeaver/beaver/app/repositories/activity-logs"
import type { ActivityLogFilters, ActivityLogMetadata } from "@zbeaver/beaver/app/models/activity-log"

export interface ActivityRequestDescriptor {
  resource: string
  action: string
  resourceId: string | null
  authenticationEvent: boolean
}

function getPathSegments(pathname: string) {
  const prefix = pathname.startsWith("/api/admin/")
    ? "/api/admin/"
    : pathname.startsWith("/admin/")
      ? "/admin/"
      : null
  if (!prefix) return null
  return pathname.slice(prefix.length).split("/").filter(Boolean)
}

function collectionDescriptor(resource: string, segments: string[], method: string): ActivityRequestDescriptor | null {
  const second = segments[1]
  const third = segments[2]

  if (second === "bulk") {
    if (!third || method !== "POST") return null
    const action = third === "permanent-delete" ? "permanent_delete" : third
    return { resource, action: `bulk_${action}`, resourceId: null, authenticationEvent: false }
  }

  if (resource === "media" && second === "upload" && method === "POST") {
    return { resource, action: "upload", resourceId: null, authenticationEvent: false }
  }

  if (resource === "menus" && second === "reorder" && method === "POST") {
    return { resource, action: "reorder", resourceId: null, authenticationEvent: false }
  }

  if (!second && method === "POST") {
    return { resource, action: "create", resourceId: null, authenticationEvent: false }
  }

  if (!second) return null

  if (third === "duplicate" && method === "POST") {
    return { resource, action: "duplicate", resourceId: second, authenticationEvent: false }
  }

  if (third === "restore" && method === "POST") {
    return { resource, action: "restore", resourceId: second, authenticationEvent: false }
  }

  if (third === "permanent-delete" && method === "DELETE") {
    return { resource, action: "permanent_delete", resourceId: second, authenticationEvent: false }
  }

  if (resource === "users" && third === "2fa" && segments[3] === "disable" && method === "POST") {
    return { resource, action: "disable_2fa", resourceId: second, authenticationEvent: false }
  }

  if (method === "PUT") return { resource, action: "update", resourceId: second, authenticationEvent: false }
  if (method === "DELETE") return { resource, action: "delete", resourceId: second, authenticationEvent: false }
  return null
}

export function describeActivityRequest(pathname: string, method: string): ActivityRequestDescriptor | null {
  const segments = getPathSegments(pathname)
  if (!segments || segments.length === 0) return null

  const [resource, second] = segments
  if (resource === "auth") {
    if (second === "login" && method === "POST") return { resource, action: "login", resourceId: null, authenticationEvent: true }
    if (second === "logout" && method === "POST") return { resource, action: "logout", resourceId: null, authenticationEvent: true }
    if (second === "refresh" && method === "POST") return null
    if (second === "profile" && method === "PUT") return { resource: "profile", action: "update", resourceId: null, authenticationEvent: false }
    if (second === "2fa" && segments[2] === "verify" && method === "POST") return { resource, action: "login_2fa", resourceId: null, authenticationEvent: true }
    if (second === "2fa" && (segments[2] === "setup" || segments[2] === "enable" || segments[2] === "disable") && method === "POST") {
      return { resource, action: `${segments[2]}_2fa`, resourceId: null, authenticationEvent: false }
    }
    return null
  }

  if (resource === "settings" && !second && method === "PUT") {
    return { resource, action: "update", resourceId: null, authenticationEvent: false }
  }

  if (resource === "posts") return collectionDescriptor("post", segments, method)
  if (resource === "categories") return collectionDescriptor("category", segments, method)
  if (resource === "users") return collectionDescriptor("user", segments, method)
  if (resource === "media") return collectionDescriptor("media", segments, method)
  if (resource === "menus") return collectionDescriptor("menu", segments, method)
  return null
}

type ActivitySnapshot = Record<string, unknown>
interface ActivitySnapshotItem {
  id: string
  value: ActivitySnapshot | null
}
type ActivitySnapshotState = ActivitySnapshot | ActivitySnapshotItem[] | null

const TECHNICAL_CHANGE_KEYS = new Set(["id", "createdAt", "updatedAt", "authorId", "author", "categories"])
const SENSITIVE_KEY_PATTERN = /(password|token|secret|authorization|cookie|otp|code)/i
const CHANGE_ACTIONS = new Set([
  "create",
  "update",
  "delete",
  "restore",
  "permanent_delete",
  "duplicate",
  "upload",
  "reorder",
  "publish",
  "unpublish",
  "bulk_create",
  "bulk_update",
  "bulk_delete",
  "bulk_restore",
  "bulk_permanent_delete",
  "bulk_duplicate",
  "bulk_publish",
  "bulk_unpublish",
  "bulk_status",
])
const STATUS_ONLY_BULK_ACTIONS = new Set(["bulk_status"])
const MAX_ACTIVITY_STRING_LENGTH = 2_000
const MAX_ACTIVITY_OBJECT_KEYS = 100
const MAX_ACTIVITY_ARRAY_ITEMS = 50
const MAX_ACTIVITY_VALUE_DEPTH = 4

function isSensitiveActivityKey(key: string) {
  return SENSITIVE_KEY_PATTERN.test(key)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function toActivityValue(value: unknown, key = "", depth = 0): import("@zbeaver/beaver/app/models/activity-log").ActivityLogValue {
  if (isSensitiveActivityKey(key)) return "[redacted]"
  if (value === null || value === undefined) return null
  if (typeof value === "string") return value.length > MAX_ACTIVITY_STRING_LENGTH
    ? `${value.slice(0, MAX_ACTIVITY_STRING_LENGTH)}…`
    : value
  if (typeof value === "number" || typeof value === "boolean") return value
  if (typeof value === "bigint") return Number(value)
  if (value instanceof Date) return value.toISOString()
  if (depth >= MAX_ACTIVITY_VALUE_DEPTH) return "[truncated]"
  if (Array.isArray(value)) return value
    .slice(0, MAX_ACTIVITY_ARRAY_ITEMS)
    .map((item) => toActivityValue(item, key, depth + 1))
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, MAX_ACTIVITY_OBJECT_KEYS)
        .map(([entryKey, entryValue]) => [entryKey, toActivityValue(entryValue, entryKey, depth + 1)]),
    )
  }
  return String(value)
}

function asActivitySnapshot(value: unknown): ActivitySnapshot | null {
  return isObject(value) ? value : null
}

function bulkActivityIds(value: unknown) {
  if (!isObject(value) || !Array.isArray(value.ids)) return []
  return value.ids.filter((id): id is string => typeof id === "string").slice(0, MAX_ACTIVITY_ARRAY_ITEMS)
}

async function findActivityResourceSnapshot(resource: string, resourceId: string) {
  if (resource === "post") return asActivitySnapshot(await findPostByIdRecord(resourceId))
  if (resource === "category") return asActivitySnapshot(await findCategoryByIdRecord(resourceId))
  if (resource === "media") return asActivitySnapshot(await findMediaByIdRecord(resourceId))
  if (resource === "menu") return asActivitySnapshot(await findMenuById(resourceId))
  if (resource === "user" || resource === "profile") return asActivitySnapshot(await findSafeUserByIdRecord(resourceId))
  return null
}

/** Capture the pre-mutation state without allowing audit logging to block a request. */
export async function captureActivitySnapshot(input: {
  pathname: string
  method: string
  actorId?: string | null
  requestBody?: unknown
}): Promise<ActivitySnapshotState> {
  const descriptor = describeActivityRequest(input.pathname, input.method)
  if (!descriptor) return null

  try {
    if (descriptor.resource === "settings") {
      return asActivitySnapshot(await getSiteSettings())
    }

    if (descriptor.action.startsWith("bulk_")) {
      const ids = bulkActivityIds(input.requestBody)
      if (ids.length === 0) return null
      return await Promise.all(ids.map(async (id) => ({
        id,
        value: await findActivityResourceSnapshot(descriptor.resource, id).catch(() => null),
      })))
    }

    const resourceId = descriptor.resourceId ?? (descriptor.resource === "profile" ? input.actorId ?? null : null)
    if (!resourceId) return null
    return await findActivityResourceSnapshot(descriptor.resource, resourceId)
  } catch {
    // Audit capture is best effort and must never prevent the requested mutation.
  }
  return null
}

async function responseBody(response: Response) {
  try {
    const body = await response.clone().json() as unknown
    return isObject(body) ? body : null
  } catch {
    return null
  }
}

function responseActorId(body: Record<string, unknown> | null) {
  if (!body || !isObject(body.data)) return null
  const user = body.data.user
  if (!isObject(user) || typeof user.id !== "string") return null
  return user.id
}

function valuesEqual(
  left: import("@zbeaver/beaver/app/models/activity-log").ActivityLogValue,
  right: import("@zbeaver/beaver/app/models/activity-log").ActivityLogValue,
) {
  try {
    return JSON.stringify(left) === JSON.stringify(right)
  } catch {
    return false
  }
}

function isBulkActivitySnapshot(value: ActivitySnapshotState): value is ActivitySnapshotItem[] {
  return Array.isArray(value) && value.every((item) => (
    isObject(item) && typeof item.id === "string" && Object.prototype.hasOwnProperty.call(item, "value")
  ))
}

function bulkSnapshotRecords(value: ActivitySnapshotState) {
  if (!isBulkActivitySnapshot(value)) return []
  return value.map((item) => ({ id: item.id, data: item.value }))
}

function statusOnlyBulkRecords(records: unknown[]) {
  return records.flatMap((record) => {
    if (!isObject(record) || typeof record.id !== "string") return []
    const data = isObject(record.data) ? record.data : null
    return [{ id: record.id, data: { status: data?.status ?? null } }]
  })
}

function buildBulkActivityChanges(
  before: ActivitySnapshotState,
  after: ActivitySnapshotState,
  requestBody: unknown,
  action: string,
  responseBody: Record<string, unknown> | null,
) {
  const changes: Record<string, import("@zbeaver/beaver/app/models/activity-log").ActivityLogValue> = {}
  const ids = bulkActivityIds(requestBody)
  if (ids.length > 0) {
    changes.ids = { before: null, after: toActivityValue(ids, "ids") }
  }

  const rawBeforeRecords = bulkSnapshotRecords(before)
  const rawAfterRecords = action === "bulk_duplicate" && responseBody && Array.isArray(responseBody.data)
    ? responseBody.data
    : bulkSnapshotRecords(after)
  const beforeRecords = STATUS_ONLY_BULK_ACTIONS.has(action)
    ? statusOnlyBulkRecords(rawBeforeRecords)
    : rawBeforeRecords
  const afterRecords = STATUS_ONLY_BULK_ACTIONS.has(action) && Array.isArray(rawAfterRecords)
    ? statusOnlyBulkRecords(rawAfterRecords)
    : rawAfterRecords
  if (beforeRecords.length > 0 || afterRecords.length > 0) {
    const beforeValue = toActivityValue(beforeRecords, "records")
    const afterValue = toActivityValue(afterRecords, "records")
    if (!valuesEqual(beforeValue, afterValue)) {
      changes.records = { before: beforeValue, after: afterValue }
    }
  }

  return Object.keys(changes).length > 0 ? changes : undefined
}

export function buildActivityChanges(
  before: ActivitySnapshotState,
  after: unknown,
  requestBody: unknown,
  action: string,
  responseBody: Record<string, unknown> | null = null,
) {
  if (!CHANGE_ACTIONS.has(action)) return undefined
  if (action.startsWith("bulk_")) {
    return buildBulkActivityChanges(before, after as ActivitySnapshotState, requestBody, action, responseBody)
  }

  const beforeRecord = isObject(before) ? before : null
  const afterRecord = asActivitySnapshot(after)
  const submittedRecord = asActivitySnapshot(requestBody)
  const keys = new Set([
    ...Object.keys(beforeRecord ?? {}),
    ...Object.keys(afterRecord ?? {}),
    ...Object.keys(submittedRecord ?? {}),
  ])
  const changes: Record<string, import("@zbeaver/beaver/app/models/activity-log").ActivityLogValue> = {}

  for (const key of keys) {
    if (TECHNICAL_CHANGE_KEYS.has(key)) continue

    const hasBefore = Boolean(beforeRecord && Object.prototype.hasOwnProperty.call(beforeRecord, key))
    const hasAfter = Boolean(afterRecord && Object.prototype.hasOwnProperty.call(afterRecord, key))
    const hasSubmitted = Boolean(submittedRecord && Object.prototype.hasOwnProperty.call(submittedRecord, key))
    if (isSensitiveActivityKey(key) && hasSubmitted) {
      changes[key] = { before: "[redacted]", after: "[redacted]" }
      continue
    }

    const beforeValue = toActivityValue(hasBefore ? beforeRecord![key] : null, key)
    const afterValue = toActivityValue(
      hasAfter ? afterRecord![key] : hasSubmitted ? submittedRecord![key] : null,
      key,
    )
    if (valuesEqual(beforeValue, afterValue)) continue
    changes[key] = { before: beforeValue, after: afterValue }
  }

  return Object.keys(changes).length > 0 ? changes : undefined
}

function requestMetadata(
  pathname: string,
  method: string,
  descriptor: ActivityRequestDescriptor,
  response: Response,
  changes?: Record<string, import("@zbeaver/beaver/app/models/activity-log").ActivityLogValue>,
): ActivityLogMetadata {
  return {
    path: pathname,
    method,
    statusCode: response.status,
    ...(descriptor.resourceId ? { resourceId: descriptor.resourceId } : {}),
    ...(changes ? { changes } : {}),
  }
}

export async function recordActivityRequest(input: {
  request: Request
  pathname: string
  method: string
  response: Response
  actorId?: string | null
  ipAddress?: string | null
  before?: ActivitySnapshotState
  requestBody?: unknown
}) {
  const descriptor = describeActivityRequest(input.pathname, input.method)
  if (!descriptor) return

  const success = input.response.status >= 200 && input.response.status < 400
  if (!descriptor.authenticationEvent && !success) return

  const body = await responseBody(input.response)
  const actorId = input.actorId ?? responseActorId(body)
  const actor = actorId ? await findSafeUserByIdRecord(actorId).catch(() => null) : null
  const userAgent = input.request.headers.get("user-agent")?.slice(0, 1_024) ?? null
  const responseData = body && "data" in body ? body.data : null
  const after = descriptor.action.startsWith("bulk_")
    ? await captureActivitySnapshot({
        pathname: input.pathname,
        method: input.method,
        actorId,
        requestBody: input.requestBody,
      })
    : responseData
  const changes = buildActivityChanges(
    input.before ?? null,
    after,
    input.requestBody,
    descriptor.action,
    body,
  )

  await createActivityLogRecord({
    actorId,
    actorName: actor?.name ?? null,
    actorEmail: actor?.email ?? null,
    action: descriptor.action,
    resource: descriptor.resource,
    resourceId: descriptor.resourceId,
    metadata: requestMetadata(input.pathname, input.method, descriptor, input.response, changes),
    ipAddress: input.ipAddress ?? null,
    userAgent,
    success,
    statusCode: input.response.status,
  }).catch((error) => {
    console.error("Activity log write failed", error)
  })

}

export async function listActivityLogs(filters: ActivityLogFilters = {}) {
  return listActivityLogRecords(filters)
}

export async function purgeExpiredActivityLogs() {
  return deleteActivityLogsBefore(getActivityLogRetentionCutoff())
}
