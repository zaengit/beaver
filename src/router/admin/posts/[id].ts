import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { handleDeletePost, handleGetPost, handleUpdatePost } from "@zaenpm/beaver/app/handlers"

export const GET: AdminRoute = async ({ params, locals }) => {
  return handleGetPost(locals.session as { user: { id: string } } | null, params.id!)
}

export const PUT: AdminRoute = async ({ params, request, locals }) => {
  const body = await request.json()
  return await handleUpdatePost(locals.session as { user: { id: string } } | null, params.id!, body)
}

export const DELETE: AdminRoute = async ({ params, locals }) => {
  return await handleDeletePost(locals.session as { user: { id: string } } | null, params.id!)
}
