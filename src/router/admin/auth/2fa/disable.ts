import type { AdminRoute } from "@zbeaver/beaver/router/route"

import {
  clearAdminTwoFactorChallengeCookie,
  clearAdminSessionCookies,
} from "@zbeaver/beaver/app/admin/auth-cookies"
import { handleTwoFactorDisable } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ request, cookies, locals }) => {
  const response = await handleTwoFactorDisable(
    locals.session as { user: { id: string } } | null,
    await request.json(),
  )

  if (response.ok) {
    clearAdminSessionCookies(cookies)
    clearAdminTwoFactorChallengeCookie(cookies)
  }

  return response
}
