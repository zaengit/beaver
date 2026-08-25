import { eq } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { adminTwoFactor } from "@zbeaver/beaver/app/db/schema"

export type AdminTwoFactorRecord = typeof adminTwoFactor.$inferSelect

export async function findTwoFactorRecord(userId: string) {
  const rows = await db
    .select()
    .from(adminTwoFactor)
    .where(eq(adminTwoFactor.userId, userId))
    .limit(1)
    .execute()

  return rows[0] as AdminTwoFactorRecord | undefined
}

export async function saveTwoFactorSetup(userId: string, secret: string, now: number) {
  const existing = await findTwoFactorRecord(userId)
  if (existing) {
    await db
      .update(adminTwoFactor)
      .set({ secret, enabled: 0, updatedAt: now })
      .where(eq(adminTwoFactor.userId, userId))
      .execute()
    return
  }

  await db.insert(adminTwoFactor).values({
    userId,
    secret,
    enabled: 0,
    createdAt: now,
    updatedAt: now,
  }).execute()
}

export async function enableTwoFactor(userId: string, now: number) {
  await db
    .update(adminTwoFactor)
    .set({ enabled: 1, updatedAt: now })
    .where(eq(adminTwoFactor.userId, userId))
    .execute()
}

export async function deleteTwoFactorRecord(userId: string) {
  await db.delete(adminTwoFactor).where(eq(adminTwoFactor.userId, userId)).execute()
}
