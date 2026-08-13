import type { AdminRoute } from "zadm/router/route"

import { handleGetSettings, handleUpdateSettings } from "zadm/app/handlers"

export const GET: AdminRoute = async () => {
  return handleGetSettings()
}

export const PUT: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleUpdateSettings(locals.session as { user: { id: string } } | null, body)
}
