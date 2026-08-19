import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { refreshAdminSession } from "@zaenpm/beaver/app/admin/api-guard"

export const POST: AdminRoute = async ({ cookies }) => {
  const session = await refreshAdminSession(cookies)
  if (!session) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 })
  }

  return Response.json({ success: true, data: session })
}
