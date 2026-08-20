import type { AstroLikeCookies } from "@zbeaver/beaver/app/http/request-context"
import { findSafeUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"
import { getUserPermissions } from "@zbeaver/beaver/app/admin/permissions"
import {
  buildAdminAccessCookieOptions,
  buildAdminRefreshCookieOptions,
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  readAdminAccessToken,
  readAdminRefreshToken,
} from "@zbeaver/beaver/app/admin/auth-cookies"
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@zbeaver/beaver/app/admin/jwt"
import { consumeRefreshSession, saveRefreshSession } from "@zbeaver/beaver/app/admin/session-store"

export async function getAdminSession(cookies: AstroLikeCookies) {
  const access = readAdminAccessToken(cookies)
  if (!access) return null

  try {
    const payload = await verifyAccessToken(access)
    const user = findSafeUserByIdRecord(payload.sub)
    if (!user) return null
    return { user, permissions: payload.permissions }
  } catch {
    return null
  }
}

export async function refreshAdminSession(cookies: AstroLikeCookies) {
  const refresh = readAdminRefreshToken(cookies)
  if (!refresh) return null

  try {
    const payload = await verifyRefreshToken(refresh)
    const stored = consumeRefreshSession(payload.sessionId)
    if (!stored || stored.userId !== payload.sub) return null

    const user = findSafeUserByIdRecord(payload.sub)
    if (!user) return null

    const permissions = await getUserPermissions(user.id)
    const nextSessionId = crypto.randomUUID()
    const nextAccess = await signAccessToken({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions,
    })
    const nextRefresh = await signRefreshToken({
      sub: user.id,
      sessionId: nextSessionId,
    })

    saveRefreshSession(nextSessionId, user.id, Date.now() + 30 * 24 * 60 * 60 * 1000)
    cookies.set(ADMIN_ACCESS_COOKIE, nextAccess, buildAdminAccessCookieOptions())
    cookies.set(ADMIN_REFRESH_COOKIE, nextRefresh, buildAdminRefreshCookieOptions())

    return { user, permissions }
  } catch {
    return null
  }
}
