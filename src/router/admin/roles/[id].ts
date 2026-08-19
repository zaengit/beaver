import type { AdminRoute } from "@zaenpm/beaver/router/route"

import { adminError } from "@zaenpm/beaver/app/admin/api-response"
import { handleDeleteRole, handleGetRole, handleUpdateRole } from "@zaenpm/beaver/app/handlers"

export const GET: AdminRoute = async ({ params }) => {
  if (!params.id) return adminError("Role id is required.", 400)
  return handleGetRole(params.id)
}

export const PUT: AdminRoute = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Role id is required.", 400)
  const body = await request.json()
  return handleUpdateRole(locals.session as { user: { id: string } } | null, params.id, body)
}

export const DELETE: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("Role id is required.", 400)
  return handleDeleteRole(locals.session as { user: { id: string } } | null, params.id)
}
