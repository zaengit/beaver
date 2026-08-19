import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleGetSettings, handleUpdateSettings } from "@zaenpm/beaver/app/handlers"

export const GET: AdminRoute = async () => {
  return handleGetSettings()
}

export const PUT: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleUpdateSettings(locals.session as { user: { id: string } } | null, body)
}
