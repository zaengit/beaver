import type { AdminRoute } from "zadm/router/route"

import { adminSuccess } from "zadm/app/admin/api-response"
import { getDashboardStatsRecord } from "zadm/app/repositories/posts"

export const GET: AdminRoute = async () => {
  const stats = getDashboardStatsRecord()
  return adminSuccess(stats)
}
