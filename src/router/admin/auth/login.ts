import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handlePasswordLogin } from "@zbeaver/beaver/app/handlers"
import { getUserPermissions } from "@zbeaver/beaver/app/admin/permissions"
import { signAccessToken, signRefreshToken } from "@zbeaver/beaver/app/admin/jwt"
import {
  buildAdminAccessCookieOptions,
  buildAdminRefreshCookieOptions,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from "@zbeaver/beaver/app/admin/auth-cookies"
import { saveRefreshSession } from "@zbeaver/beaver/app/admin/session-store"

export const POST: AdminRoute = async ({ request, cookies }) => {
  const body = await request.json()
  const result = await handlePasswordLogin(body)
  if (!result.success || !result.user) {
    return Response.json({ success: false, message: result.message }, { status: result.status })
  }

  const permissions = await getUserPermissions(result.user.id)
  const sessionId = crypto.randomUUID()
  const accessToken = await signAccessToken({
    sub: result.user.id,
    email: result.user.email,
    roleId: result.user.roleId,
    permissions,
  })
  const refreshToken = await signRefreshToken({
    sub: result.user.id,
    sessionId,
  })

  saveRefreshSession(sessionId, result.user.id, Date.now() + 30 * 24 * 60 * 60 * 1000)
  cookies.set(ADMIN_ACCESS_COOKIE, accessToken, buildAdminAccessCookieOptions())
  cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, buildAdminRefreshCookieOptions())

  return Response.json({
    success: true,
    message: "Login successful.",
    data: {
      user: result.user,
      permissions,
    },
  })
}
