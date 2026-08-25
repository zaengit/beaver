import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleRestorePost } from "@zbeaver/beaver/app/handlers"

export const POST: AdminRoute = async ({ params, locals }) => {
  return handleRestorePost(locals.session as { user: { id: string } } | null, params.id!)
}
