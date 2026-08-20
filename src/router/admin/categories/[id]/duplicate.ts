import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleDuplicateCategory } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "Category id is required." }), { status: 400 })
  }
  return handleDuplicateCategory(locals.session as { user: { id: string } } | null, params.id)
}
