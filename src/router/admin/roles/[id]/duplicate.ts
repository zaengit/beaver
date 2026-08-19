import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleDuplicateRole } from "@zaenpm/beaver/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "Role id is required." }), { status: 400 })
  }
  return handleDuplicateRole(locals.session as { user: { id: string } } | null, params.id)
}
