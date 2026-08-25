import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { getAdminSession, refreshAdminSession } from "@zbeaver/beaver/app/admin/api-guard"
import { getStaticRoleName } from "@zbeaver/beaver/pkg/types/roles"

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

  const roleName = getStaticRoleName(session.user.role)

  return Response.json({
    success: true,
    data: {
      user: session.user,
      permissions: session.permissions,
      roleName,
      twoFactorEnabled: session.twoFactorEnabled,
    },
  })
}
