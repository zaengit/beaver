import type { users } from "@zbeaver/beaver/app/db/schema"

export type UserRecord = typeof users.$inferSelect
