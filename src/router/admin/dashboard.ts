import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { requirePermission } from "@zbeaver/beaver/app/handlers/guard"
import { getDashboardStatsRecord } from "@zbeaver/beaver/app/repositories/posts"
import { findUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"

export const GET: AdminRoute = async ({ locals }) => {
  const session = locals.session as { user: { id: string } } | null
  const permission = await requirePermission(session, "dashboard.view")
  if (permission) return permission

  const user = await findUserByIdRecord(session!.user.id)
  const stats = await getDashboardStatsRecord(user?.role === "author" ? user.id : undefined)
  return adminSuccess(stats)
}
