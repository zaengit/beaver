import type { categories } from "@zaenpm/beaver/app/db/schema"

export const CATEGORY_TABLE = "categories"

export type CategoryRecord = typeof categories.$inferSelect
export type CategoryInsert = typeof categories.$inferInsert
