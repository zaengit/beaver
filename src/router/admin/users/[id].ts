import type { AdminRoute } from "zadm/router/route"

import { adminError } from "zadm/app/admin/api-response"
import {
  handleDeleteUser,
  handleGetUser,
  handleUpdateUser,
} from "zadm/app/handlers"

export const GET: AdminRoute = async ({ params }) => {
  if (!params.id) return adminError("User id is required.", 400)
  return handleGetUser(params.id)
}

export const PUT: AdminRoute = async ({ params, request, locals }) => {
  if (!params.id) return adminError("User id is required.", 400)
  const body = await request.json()
  return handleUpdateUser(locals.session as { user: { id: string } } | null, params.id, body)
}

export const DELETE: AdminRoute = async ({ params, locals }) => {
  if (!params.id) return adminError("User id is required.", 400)
  return handleDeleteUser(locals.session as { user: { id: string } } | null, params.id)
}
