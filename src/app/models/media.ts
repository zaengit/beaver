import type { media } from "@zbeaver/beaver/app/db/schema"

export const MEDIA_TABLE = "media"

export type MediaRecord = typeof media.$inferSelect
export type MediaInsert = typeof media.$inferInsert
