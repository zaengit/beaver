import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handlePermanentlyDeletePost } from "@zbeaver/beaver/app/handlers"

export const DELETE: AdminRoute = async ({ params, locals }) => {
  return handlePermanentlyDeletePost(locals.session as { user: { id: string } } | null, params.id!)
}
