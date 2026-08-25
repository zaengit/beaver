import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { adminError } from "@zbeaver/beaver/app/admin/api-response"
import {
  clearAdminTwoFactorChallengeCookie,
  clearAdminSessionCookies,
  readAdminTwoFactorChallenge,
} from "@zbeaver/beaver/app/admin/auth-cookies"
import { verifyTwoFactorChallengeToken } from "@zbeaver/beaver/app/admin/jwt"
import { establishAdminSession } from "@zbeaver/beaver/app/admin/session-auth"
import { findSafeUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"
import { verifyTwoFactorCode } from "@zbeaver/beaver/app/services/two-factor"
import { twoFactorCodeSchema } from "@zbeaver/beaver/app/validations/auth"
import { isWithinRateLimit } from "@zbeaver/beaver/app/security/rate-limit"

export const POST: AdminRoute = async ({ request, cookies }) => {
  const parsed = twoFactorCodeSchema.safeParse(await request.json())
  if (!parsed.success) return adminError("Authenticator code must be 6 digits.", 422)

  const challenge = readAdminTwoFactorChallenge(cookies)
  if (!challenge) return adminError("Two-factor login has expired. Please sign in again.", 401)

  try {
    const payload = await verifyTwoFactorChallengeToken(challenge)
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return adminError("Invalid two-factor login.", 401)
    }
    if (!isWithinRateLimit(`login:2fa:${payload.sub}`, 5, 15 * 60 * 1000)) {
      return adminError("Too many requests. Please try again later.", 429)
    }

    const user = await findSafeUserByIdRecord(payload.sub)
    if (!user || user.email !== payload.email || !(await verifyTwoFactorCode(user.id, parsed.data.code))) {
      return adminError("Invalid authenticator code.", 401)
    }

    const session = await establishAdminSession(user, cookies, { twoFactorVerified: true })
    clearAdminTwoFactorChallengeCookie(cookies)
    return Response.json({ success: true, message: "Login successful.", data: session })
  } catch {
    clearAdminSessionCookies(cookies)
    clearAdminTwoFactorChallengeCookie(cookies)
    return adminError("Two-factor login has expired. Please sign in again.", 401)
  }
}
