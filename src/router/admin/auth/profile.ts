import type { AdminRoute } from "zadm/router/route"

import { adminError } from "zadm/app/admin/api-response"
import { handleUpdateProfile } from "zadm/app/handlers"

export const PUT: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleUpdateProfile(locals.session as { user: { id: string } } | null, body)
}
