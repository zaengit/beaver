import type { AdminRoute } from "zadm/router/route"

import { handleDeleteMedia, handleGetMedia, handleUpdateMedia } from "zadm/app/handlers"

export const GET: AdminRoute = async ({ params }) => {
  return handleGetMedia(params.id!)
}

export const PUT: AdminRoute = async ({ params, request, locals }) => {
  const body = await request.json()
  return handleUpdateMedia(locals.session as { user: { id: string } } | null, params.id!, body)
}

export const DELETE: AdminRoute = async ({ params, locals }) => {
  return handleDeleteMedia(locals.session as { user: { id: string } } | null, params.id!)
}
