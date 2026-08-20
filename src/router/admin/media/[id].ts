import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleDeleteMedia, handleGetMedia, handleUpdateMedia } from "@zbeaver/beaver/app/handlers"

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
