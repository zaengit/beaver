import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleGetSettings, handleUpdateSettings } from "@zbeaver/beaver/app/handlers"

export const GET: AdminRoute = async ({ locals }) => {
  return handleGetSettings(locals.session as { user: { id: string } } | null)
}

export const PUT: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleUpdateSettings(locals.session as { user: { id: string } } | null, body)
}
