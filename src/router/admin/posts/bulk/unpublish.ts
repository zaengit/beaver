import type { AdminRoute } from "zadm/router/route"

import { handleBulkUnpublishPosts } from "zadm/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : []
  return await handleBulkUnpublishPosts(locals.session as { user: { id: string } } | null, ids)
}
