import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleBulkDeleteCategories } from "@zaenpm/beaver/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : []
  return await handleBulkDeleteCategories(locals.session as { user: { id: string } } | null, ids)
}
