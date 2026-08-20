import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { adminError } from "@zbeaver/beaver/app/admin/api-response"
import { handleUpdateProfile } from "@zbeaver/beaver/app/handlers"

export const PUT: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleUpdateProfile(locals.session as { user: { id: string } } | null, body)
}
