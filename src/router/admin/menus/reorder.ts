import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleReorderMenus } from "@zaenpm/beaver/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleReorderMenus(locals.session as { user: { id: string } } | null, body)
}
