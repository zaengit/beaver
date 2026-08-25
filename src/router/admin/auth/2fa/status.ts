import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleTwoFactorStatus } from "@zbeaver/beaver/app/handlers"

export const GET: AdminRoute = async ({ locals }) => {
  return handleTwoFactorStatus(locals.session as { user: { id: string } } | null)
}
