import type { AdminRoute } from "zadm/router/route"

import { adminError } from "zadm/app/admin/api-response"
import { handleDeleteCategory, handleGetCategory, handleUpdateCategory } from "zadm/app/handlers"

export const GET: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400)
  return handleGetCategory(locals.session as { user: { id: string } } | null, params.id)
}

export const PUT: AdminRoute = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400)
  const body = await request.json()
  return handleUpdateCategory(locals.session as { user: { id: string } } | null, params.id, body)
}

export const DELETE: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400)
  return handleDeleteCategory(locals.session as { user: { id: string } } | null, params.id)
}
