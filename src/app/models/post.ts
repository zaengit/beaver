import type { posts } from "zadm/app/db/schema"

export const POST_TABLE = "posts"

export type PostRecord = typeof posts.$inferSelect
export type PostInsert = typeof posts.$inferInsert
