import type { AdminRoute } from "zadm/router/route"

import { handleDuplicatePost } from "zadm/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  return await handleDuplicatePost(locals.session as { user: { id: string } } | null, params.id!)
}
