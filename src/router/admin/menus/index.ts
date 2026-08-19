import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleCreateMenu, handleListMenus } from "@zaenpm/beaver/app/handlers"

export const GET: AdminRoute = async () => {
  return handleListMenus()
}

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleCreateMenu(locals.session as { user: { id: string } } | null, body)
}
