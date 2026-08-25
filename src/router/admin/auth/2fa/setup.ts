import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleTwoFactorSetup } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ locals }) => {
  return handleTwoFactorSetup(locals.session as { user: { id: string } } | null)
}
