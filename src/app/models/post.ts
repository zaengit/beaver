import type { posts } from "@zbeaver/beaver/app/db/schema"

export const POST_TABLE = "posts"

export type PostRecord = typeof posts.$inferSelect
export type PostInsert = typeof posts.$inferInsert
