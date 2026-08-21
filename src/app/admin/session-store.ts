import { eq, and, gt, inArray, lt, or } from "drizzle-orm"
import { db } from "@zbeaver/beaver/app/db"
import { adminRefreshSessions, users } from "@zbeaver/beaver/app/db/schema"
import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"

const REFRESH_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60
const LEGACY_MILLISECONDS_THRESHOLD = 10_000_000_000

function normalizeExpiry(expiresAt: number) {
  return expiresAt >= LEGACY_MILLISECONDS_THRESHOLD ? Math.floor(expiresAt / 1000) : expiresAt
}

function activeExpiryCondition(now: number) {
  return or(
    gt(adminRefreshSessions.expiresAt, now * 1000),
    and(
      gt(adminRefreshSessions.expiresAt, now),
      lt(adminRefreshSessions.expiresAt, LEGACY_MILLISECONDS_THRESHOLD),
    ),
  )
}

export function getRefreshSessionExpiry() {
  return getCurrentTimestamp() + REFRESH_SESSION_TTL_SECONDS
}

export function saveRefreshSession(sessionId: string, userId: string, expiresAt: number) {
  db.insert(adminRefreshSessions)
    .values({
      id: sessionId,
      userId,
      expiresAt: normalizeExpiry(expiresAt),
      createdAt: getCurrentTimestamp(),
    })
    .run()
}

export function deleteRefreshSession(sessionId: string) {
  db.delete(adminRefreshSessions)
    .where(eq(adminRefreshSessions.id, sessionId))
    .run()
}

export function deleteRefreshSessionsForUser(userId: string) {
  db.delete(adminRefreshSessions)
    .where(eq(adminRefreshSessions.userId, userId))
    .run()
}

export function deleteRefreshSessionsForRole(roleId: string) {
  const roleUsers = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.roleId, roleId))
    .all()
  if (roleUsers.length === 0) return

  db.delete(adminRefreshSessions)
    .where(inArray(adminRefreshSessions.userId, roleUsers.map((user) => user.id)))
    .run()
}

export function findActiveRefreshSession(sessionId: string) {
  const now = getCurrentTimestamp()
  const row = db
    .select({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt })
    .from(adminRefreshSessions)
    .where(and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now)))
    .get()
  return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null
}

/** Atomically consumes one non-expired refresh session, preventing replay races. */
export function consumeRefreshSession(sessionId: string): { userId: string; expiresAt: number } | null {
  const now = getCurrentTimestamp()
  const row = db
    .delete(adminRefreshSessions)
    .where(and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now)))
    .returning({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt })
    .get()
  return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null
}
