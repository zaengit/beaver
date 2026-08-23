import { db } from "@zbeaver/beaver/app/db"
import { settings } from "@zbeaver/beaver/app/db/schema"
import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"
import { eq } from "drizzle-orm"
import type { SettingRow } from "@zbeaver/beaver/app/models/setting"

// ─── Get All Settings ────────────────────────────────────────────────────────

export async function getAllSettingsRecords(): Promise<SettingRow[]> {
  return await db.select().from(settings).execute()
}

// ─── Get Single Setting ──────────────────────────────────────────────────────

async function getSettingRecord(key: string): Promise<SettingRow | undefined> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1)
    .execute()
  return rows[0]
}

// ─── Upsert Setting (insert or update) ───────────────────────────────────────

export async function upsertSettingRecord(key: string, value: string): Promise<SettingRow> {
  const now = getCurrentTimestamp()
  const existing = await getSettingRecord(key)

  if (existing) {
    await db.update(settings)
      .set({ value, updatedAt: now })
      .where(eq(settings.key, key))
      .execute()

    return { key, value, createdAt: existing.createdAt, updatedAt: now }
  }

  await db.insert(settings)
    .values({ key, value, createdAt: now, updatedAt: now })
    .execute()

  return { key, value, createdAt: now, updatedAt: now }
}
