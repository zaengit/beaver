import type { AdminRoute } from "zadm/router/route"

import { handleDuplicateUser } from "zadm/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "User id is required." }), { status: 400 })
  }
  return handleDuplicateUser(locals.session as { user: { id: string } } | null, params.id)
}
