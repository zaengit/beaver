import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleDuplicatePost } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  return await handleDuplicatePost(locals.session as { user: { id: string } } | null, params.id!)
}
