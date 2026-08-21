import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleUpdateProfile } from "@zbeaver/beaver/app/handlers"

export const PUT: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleUpdateProfile(locals.session as { user: { id: string } } | null, body)
}
