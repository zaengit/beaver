import type { AdminRoute } from "@zbeaver/beaver/router/route"

import {
  buildAdminAccessCookieOptions,
  buildAdminRefreshCookieOptions,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  clearAdminTwoFactorChallengeCookie,
  readAdminRefreshToken,
} from "@zbeaver/beaver/app/admin/auth-cookies"
import { verifyRefreshToken } from "@zbeaver/beaver/app/admin/jwt"
import { deleteRefreshSession } from "@zbeaver/beaver/app/admin/session-store"

export const POST: AdminRoute = async ({ cookies }) => {
  const refresh = readAdminRefreshToken(cookies)
  if (refresh) {
    try {
      const payload = await verifyRefreshToken(refresh)
      await deleteRefreshSession(payload.sessionId)
    } catch {}
  }

  cookies.set(ADMIN_ACCESS_COOKIE, "", { ...buildAdminAccessCookieOptions(), maxAge: 0 })
  cookies.set(ADMIN_REFRESH_COOKIE, "", { ...buildAdminRefreshCookieOptions(), maxAge: 0 })
  clearAdminTwoFactorChallengeCookie(cookies)

  return Response.json({ success: true, message: "Logged out." })
}
