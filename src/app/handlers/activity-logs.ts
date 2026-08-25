import { adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { requirePermission } from "@zbeaver/beaver/app/handlers/guard"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import type { ActivityLogFilters } from "@zbeaver/beaver/app/models/activity-log"
import { listActivityLogs } from "@zbeaver/beaver/app/services/activity-logs"

export async function handleListActivityLogs(session: Session, filters: ActivityLogFilters = {}) {
  const permission = await requirePermission(session, "activity-log.view")
  if (permission) return permission

  try {
    return adminSuccess(await listActivityLogs(filters))
  } catch (error) {
    console.error("Activity log list failed", error)
    return adminError("Activity log could not be loaded.", 500)
  }
}
