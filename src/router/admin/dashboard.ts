import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { adminSuccess } from "@zaenpm/beaver/app/admin/api-response"
import { getDashboardStatsRecord } from "@zaenpm/beaver/app/repositories/posts"

export const GET: AdminRoute = async () => {
  const stats = getDashboardStatsRecord()
  return adminSuccess(stats)
}
