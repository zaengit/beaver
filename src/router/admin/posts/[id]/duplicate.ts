import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleDuplicatePost } from "@zaenpm/beaver/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  return await handleDuplicatePost(locals.session as { user: { id: string } } | null, params.id!)
}
