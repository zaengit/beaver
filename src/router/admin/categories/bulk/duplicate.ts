import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleBulkDuplicateCategories } from "@zaenpm/beaver/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : []
  return await handleBulkDuplicateCategories(locals.session as { user: { id: string } } | null, ids)
}
