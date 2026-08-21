import type { roles } from "@zbeaver/beaver/app/db/schema"

export type RoleRecord = typeof roles.$inferSelect
