import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleCreateUser, handleListUsers } from "@zbeaver/beaver/app/handlers"

const VALID_SORT_BY = new Set(["name", "email", "createdAt", "updatedAt"])
const VALID_SORT_ORDER = new Set(["asc", "desc"])

export const GET: AdminRoute = async ({ request }) => {
  const url = new URL(request.url)
  const search = url.searchParams.get("search") || undefined
  const roleId = url.searchParams.get("roleId") || undefined
  const sortBy = url.searchParams.get("sortBy")
  const sortOrder = url.searchParams.get("sortOrder")

  const sortByValid = sortBy && VALID_SORT_BY.has(sortBy) ? sortBy : undefined
  const sortOrderValid = sortOrder && VALID_SORT_ORDER.has(sortOrder as "asc" | "desc") ? sortOrder : undefined

  return handleListUsers({ search, roleId, sortBy: sortByValid, sortOrder: sortOrderValid })
}

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleCreateUser(locals.session as { user: { id: string } } | null, body)
}
