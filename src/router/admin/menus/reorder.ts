import type { AdminRoute } from "zadm/router/route"

import { handleReorderMenus } from "zadm/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleReorderMenus(locals.session as { user: { id: string } } | null, body)
}
