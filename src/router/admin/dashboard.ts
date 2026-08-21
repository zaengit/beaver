import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { requirePermission } from "@zbeaver/beaver/app/handlers/guard"
import { getDashboardStatsRecord } from "@zbeaver/beaver/app/repositories/posts"

export const GET: AdminRoute = async ({ locals }) => {
  const permission = await requirePermission(locals.session as { user: { id: string } } | null, "dashboard.view")
  if (permission) return permission

  const stats = getDashboardStatsRecord()
  return adminSuccess(stats)
}
