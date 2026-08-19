import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { getAdminSession, refreshAdminSession } from "@zaenpm/beaver/app/admin/api-guard"
import { getRoleNameRecord } from "@zaenpm/beaver/app/repositories/roles"

export const GET: AdminRoute = async ({ cookies }) => {
  // Coba access token dulu — kalau masih valid, langsung return.
  let session = await getAdminSession(cookies)

  // Access token expired? Coba refresh — penting agar user tidak selalu logout.
  if (!session) {
    session = await refreshAdminSession(cookies)
  }

  if (!session) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 })
  }

  const roleName = session.user.roleId ? getRoleNameRecord(session.user.roleId) : null

  return Response.json({
    success: true,
    data: {
      user: session.user,
      permissions: session.permissions,
      roleName,
    },
  })
}
