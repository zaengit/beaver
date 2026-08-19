import type { users } from "@zaenpm/beaver/app/db/schema"

export const USER_TABLE = "users"

export type UserRecord = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
