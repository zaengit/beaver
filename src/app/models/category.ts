import type { categories } from "@zbeaver/beaver/app/db/schema"

export type CategoryRecord = typeof categories.$inferSelect
