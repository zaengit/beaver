import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleSyncPermissions } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ locals }) => {
  return handleSyncPermissions(locals.session as { user: { id: string } } | null)
}
