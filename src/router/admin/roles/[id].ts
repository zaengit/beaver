import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { adminError } from "@zbeaver/beaver/app/admin/api-response"
import { handleDeleteRole, handleGetRole, handleUpdateRole } from "@zbeaver/beaver/app/handlers"

export const GET: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("Role id is required.", 400)
  return handleGetRole(locals.session as { user: { id: string } } | null, params.id)
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
