import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { adminError } from "@zaenpm/beaver/app/admin/api-response"
import { handleDeleteMenu, handleGetMenu, handleUpdateMenu } from "@zaenpm/beaver/app/handlers"

export const GET: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400)
  return handleGetMenu(locals.session as { user: { id: string } } | null, params.id)
}

export const PUT: AdminRoute = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400)
  const body = await request.json()
  return handleUpdateMenu(locals.session as { user: { id: string } } | null, params.id, body)
}

export const DELETE: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400)
  return handleDeleteMenu(locals.session as { user: { id: string } } | null, params.id)
}
