import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { getDashboardStatsRecord } from "@zbeaver/beaver/app/repositories/posts"

export const GET: AdminRoute = async () => {
  const stats = getDashboardStatsRecord()
  return adminSuccess(stats)
}
