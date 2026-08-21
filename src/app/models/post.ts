import type { posts } from "@zbeaver/beaver/app/db/schema"

export type PostRecord = typeof posts.$inferSelect
