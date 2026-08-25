import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { adminError } from "@zbeaver/beaver/app/admin/api-response"
import { handleDisableUserTwoFactor } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("User id is required.", 400)
  return handleDisableUserTwoFactor(locals.session as { user: { id: string } } | null, params.id)
}
