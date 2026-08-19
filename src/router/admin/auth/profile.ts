import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { adminError } from "@zaenpm/beaver/app/admin/api-response"
import { handleUpdateProfile } from "@zaenpm/beaver/app/handlers"

export const PUT: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleUpdateProfile(locals.session as { user: { id: string } } | null, body)
}
