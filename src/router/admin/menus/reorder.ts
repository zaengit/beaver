import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleReorderMenus } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleReorderMenus(locals.session as { user: { id: string } } | null, body)
}
