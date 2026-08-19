import type { AdminRoute } from "@zaenpm/beaver/router/route"

import {
  buildAdminAccessCookieOptions,
  buildAdminRefreshCookieOptions,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  readAdminRefreshToken,
} from "@zaenpm/beaver/app/admin/auth-cookies"
import { verifyRefreshToken } from "@zaenpm/beaver/app/admin/jwt"
import { deleteRefreshSession } from "@zaenpm/beaver/app/admin/session-store"

export const POST: AdminRoute = async ({ cookies }) => {
  const refresh = readAdminRefreshToken(cookies)
  if (refresh) {
    try {
      const payload = await verifyRefreshToken(refresh)
      deleteRefreshSession(payload.sessionId)
    } catch {}
  }

  cookies.set(ADMIN_ACCESS_COOKIE, "", { ...buildAdminAccessCookieOptions(), maxAge: 0 })
  cookies.set(ADMIN_REFRESH_COOKIE, "", { ...buildAdminRefreshCookieOptions(), maxAge: 0 })

  return Response.json({ success: true, message: "Logged out." })
}
