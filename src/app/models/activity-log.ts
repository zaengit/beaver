import type { activityLogs } from "@zbeaver/beaver/app/db/schema"

export type ActivityLogRow = typeof activityLogs.$inferSelect

export type ActivityLogValue =
  | string
  | number
  | boolean
  | null
  | ActivityLogValue[]
  | { [key: string]: ActivityLogValue }

export type ActivityLogMetadata = Record<string, ActivityLogValue>

export interface ActivityLogItem extends Omit<ActivityLogRow, "metadata"> {
  metadata: ActivityLogMetadata | null
}

export interface ActivityLogFilters {
  page?: number
  perPage?: number
  search?: string
  action?: string
  resource?: string
  success?: boolean
  from?: number
  to?: number
}
