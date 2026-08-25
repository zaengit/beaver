import { eq, and, gt, lt, or } from "drizzle-orm"
import { db } from "@zbeaver/beaver/app/db"
import { databaseConfig } from "@zbeaver/beaver/app/config/database"
import { adminRefreshSessions } from "@zbeaver/beaver/app/db/schema"
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

export async function saveRefreshSession(sessionId: string, userId: string, expiresAt: number) {
  await db.insert(adminRefreshSessions)
    .values({
      id: sessionId,
      userId,
      expiresAt: normalizeExpiry(expiresAt),
      createdAt: getCurrentTimestamp(),
    })
    .execute()
}

export async function deleteRefreshSession(sessionId: string) {
  await db.delete(adminRefreshSessions)
    .where(eq(adminRefreshSessions.id, sessionId))
    .execute()
}

export async function deleteRefreshSessionsForUser(userId: string) {
  await db.delete(adminRefreshSessions)
    .where(eq(adminRefreshSessions.userId, userId))
    .execute()
}

export async function findActiveRefreshSession(sessionId: string) {
  const now = getCurrentTimestamp()
  const rows = await db
    .select({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt })
    .from(adminRefreshSessions)
    .where(and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now)))
    .limit(1)
    .execute()
  const row = rows[0]
  return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null
}

/** Atomically consumes one non-expired refresh session, preventing replay races. */
export async function consumeRefreshSession(sessionId: string): Promise<{ userId: string; expiresAt: number } | null> {
  const now = getCurrentTimestamp()
  const condition = and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now))

  if (databaseConfig.connection !== "mysql") {
    const rows = await db
      .delete(adminRefreshSessions)
      .where(condition)
      .returning({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt })
      .execute()
    const row = rows[0]
    return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null
  }

  return await db.transaction(async (tx) => {
    const rows = await tx
      .select({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt })
      .from(adminRefreshSessions)
      .where(condition)
      .limit(1)
      .execute()
    const row = rows[0]
    if (!row) return null
    await tx.delete(adminRefreshSessions).where(condition).execute()
    return { ...row, expiresAt: normalizeExpiry(row.expiresAt) }
  })
}
