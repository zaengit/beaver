import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handlePasswordLogin } from "@zbeaver/beaver/app/handlers"
import {
  ADMIN_2FA_CHALLENGE_COOKIE,
  buildAdminTwoFactorChallengeCookieOptions,
  clearAdminTwoFactorChallengeCookie,
  clearAdminSessionCookies,
} from "@zbeaver/beaver/app/admin/auth-cookies"
import { signTwoFactorChallengeToken } from "@zbeaver/beaver/app/admin/jwt"
import { establishAdminSession } from "@zbeaver/beaver/app/admin/session-auth"
import { clientAddress } from "@zbeaver/beaver/router/security"

export const POST: AdminRoute = async ({ request, cookies }) => {
  const body = await request.json()
  const result = await handlePasswordLogin(body, clientAddress(request))
  if (!result.success || !result.user) {
    return Response.json({ success: false, message: result.message }, { status: result.status })
  }

  if (result.requiresTwoFactor) {
    const challenge = await signTwoFactorChallengeToken({
      sub: result.user.id,
      email: result.user.email,
    })
    clearAdminSessionCookies(cookies)
    cookies.set(ADMIN_2FA_CHALLENGE_COOKIE, challenge, buildAdminTwoFactorChallengeCookieOptions())

    return Response.json({
      success: true,
      message: "Authenticator code required.",
      data: { requiresTwoFactor: true },
    }, { status: 202 })
  }

  clearAdminTwoFactorChallengeCookie(cookies)
  const session = await establishAdminSession(result.user, cookies)

  return Response.json({
    success: true,
    message: "Login successful.",
    data: session,
  })
}
