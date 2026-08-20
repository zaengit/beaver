import { eq, and, gt } from "drizzle-orm"
import { db } from "@zbeaver/beaver/app/db"
import { adminRefreshSessions } from "@zbeaver/beaver/app/db/schema"
import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"

export function saveRefreshSession(sessionId: string, userId: string, expiresAt: number) {
  db.insert(adminRefreshSessions)
    .values({
      id: sessionId,
      userId,
      expiresAt,
      createdAt: getCurrentTimestamp(),
    })
    .run()
}

export function readRefreshSession(sessionId: string): { userId: string; expiresAt: number } | null {
  const now = getCurrentTimestamp()
  const row = db
    .select({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt })
    .from(adminRefreshSessions)
    .where(
      and(
        eq(adminRefreshSessions.id, sessionId),
        gt(adminRefreshSessions.expiresAt, now),
      ),
    )
    .get()
  return row ?? null
}

export function deleteRefreshSession(sessionId: string) {
  db.delete(adminRefreshSessions)
    .where(eq(adminRefreshSessions.id, sessionId))
    .run()
}

/** Atomically consumes one non-expired refresh session, preventing replay races. */
export function consumeRefreshSession(sessionId: string): { userId: string; expiresAt: number } | null {
  const now = getCurrentTimestamp()
  const row = db
    .delete(adminRefreshSessions)
    .where(and(eq(adminRefreshSessions.id, sessionId), gt(adminRefreshSessions.expiresAt, now)))
    .returning({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt })
    .get()
  return row ?? null
}
