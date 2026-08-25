import type { users } from "@zbeaver/beaver/app/db/schema"
import type { StaticRole } from "@zbeaver/beaver/pkg/types/roles"

export type UserRecord = Omit<typeof users.$inferSelect, "role"> & { role: StaticRole }
