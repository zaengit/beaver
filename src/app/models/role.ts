import type { roles } from "@zaenpm/beaver/app/db/schema"

export const ROLE_TABLE = "roles"

export type RoleRecord = typeof roles.$inferSelect
export type RoleInsert = typeof roles.$inferInsert
