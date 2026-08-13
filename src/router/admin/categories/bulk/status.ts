import type { AdminRoute } from "zadm/router/route"
import { handleBulkUpdateCategoryStatus } from "zadm/app/handlers"

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : []
  const status = body?.status === "published" || body?.status === "draft" ? body.status : null
  if (!status) return Response.json({ success: false, message: "Invalid category status." }, { status: 422 })
  return handleBulkUpdateCategoryStatus(locals.session as { user: { id: string } } | null, ids, status)
}
