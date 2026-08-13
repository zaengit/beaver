import { db } from "zadm/app/db"
import { settings } from "zadm/app/db/schema"
import { getCurrentTimestamp } from "zadm/pkg/utils/index"
import { eq } from "drizzle-orm"
import type { SettingRow } from "zadm/app/models/setting"

// ─── Get All Settings ────────────────────────────────────────────────────────

export function getAllSettingsRecords(): SettingRow[] {
  return db.select().from(settings).all()
}

// ─── Get Single Setting ──────────────────────────────────────────────────────

export function getSettingRecord(key: string): SettingRow | undefined {
  return db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get()
}

// ─── Upsert Setting (insert or update) ───────────────────────────────────────

export function upsertSettingRecord(key: string, value: string): SettingRow {
  const now = getCurrentTimestamp()
  const existing = getSettingRecord(key)

  if (existing) {
    db.update(settings)
      .set({ value, updatedAt: now })
      .where(eq(settings.key, key))
      .run()

    return { key, value, createdAt: existing.createdAt, updatedAt: now }
  }

  db.insert(settings)
    .values({ key, value, createdAt: now, updatedAt: now })
    .run()

  return { key, value, createdAt: now, updatedAt: now }
}

// ─── Upsert Multiple Settings ────────────────────────────────────────────────

export function upsertSettingsRecord(entries: Array<{ key: string; value: string }>): SettingRow[] {
  return entries.map(({ key, value }) => upsertSettingRecord(key, value))
}
