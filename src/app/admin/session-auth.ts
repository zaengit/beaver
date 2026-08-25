import type { AstroLikeCookies } from "@zbeaver/beaver/app/http/request-context"
import type { UserSafe } from "@zbeaver/beaver/app/repositories/users"
import { getUserPermissions } from "@zbeaver/beaver/app/admin/permissions"
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  buildAdminAccessCookieOptions,
  buildAdminRefreshCookieOptions,
} from "@zbeaver/beaver/app/admin/auth-cookies"
import { signAccessToken, signRefreshToken } from "@zbeaver/beaver/app/admin/jwt"
import { getRefreshSessionExpiry, saveRefreshSession } from "@zbeaver/beaver/app/admin/session-store"
import { isSuperAdminUserId } from "@zbeaver/beaver/app/admin/super-admin"
import { isTwoFactorEnabled } from "@zbeaver/beaver/app/services/two-factor"
import { generateId } from "@zbeaver/beaver/pkg/utils/id"

export async function establishAdminSession(
  user: UserSafe,
  cookies: AstroLikeCookies,
  options: { twoFactorVerified?: boolean } = {},
) {
  const permissions = await getUserPermissions(user.id)
  const sessionId = generateId()
  const twoFactorVerified = options.twoFactorVerified === true
  const accessToken = await signAccessToken({
    sub: user.id,
    sessionId,
    email: user.email,
    role: user.role,
    permissions,
    twoFactorVerified,
  })
  const refreshToken = await signRefreshToken({
    sub: user.id,
    sessionId,
    email: user.email,
    twoFactorVerified,
  })

  if (!isSuperAdminUserId(user.id)) {
    await saveRefreshSession(sessionId, user.id, getRefreshSessionExpiry())
  }
  cookies.set(ADMIN_ACCESS_COOKIE, accessToken, buildAdminAccessCookieOptions())
  cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, buildAdminRefreshCookieOptions())

  return { user, permissions, twoFactorEnabled: await isTwoFactorEnabled(user.id) }
}
