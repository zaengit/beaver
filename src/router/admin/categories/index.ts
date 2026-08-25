import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleCreateCategory, handleListCategories } from "@zbeaver/beaver/app/handlers"

const VALID_SORT_BY = new Set(["name", "createdAt"])
const VALID_SORT_ORDER = new Set(["asc", "desc"])

export const GET: AdminRoute = async ({ request, locals }) => {
  const url = new URL(request.url)
  const type = url.searchParams.get("type") || undefined
  const search = url.searchParams.get("search") || undefined
  const statusParam = url.searchParams.get("status")
  const sortBy = url.searchParams.get("sortBy")
  const sortOrder = url.searchParams.get("sortOrder")

  const sortByValid = sortBy && VALID_SORT_BY.has(sortBy) ? sortBy : undefined
  const sortOrderValid = sortOrder && VALID_SORT_ORDER.has(sortOrder as "asc" | "desc") ? sortOrder : undefined
  const status = statusParam === "draft" || statusParam === "published" ? statusParam : undefined

  return handleListCategories(locals.session as { user: { id: string } } | null, { type, search, status, sortBy: sortByValid, sortOrder: sortOrderValid })
}

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return handleCreateCategory(locals.session as { user: { id: string } } | null, body)
}
