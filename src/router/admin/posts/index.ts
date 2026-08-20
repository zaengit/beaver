import type { AdminRoute } from "@zbeaver/beaver/router/route"
import type { PostFilters } from "@zbeaver/beaver/pkg/types/posts"

import { handleCreatePost, handleListPosts } from "@zbeaver/beaver/app/handlers"

const VALID_SORT_BY = new Set(["title", "updatedAt"])
const VALID_SORT_ORDER = new Set(["asc", "desc"])

export const GET: AdminRoute = async ({ request, locals }) => {
  const url = new URL(request.url)

  const filters: PostFilters = {}
  const search = url.searchParams.get("search")
  const status = url.searchParams.get("status")
  const type = url.searchParams.get("type")
  const sortBy = url.searchParams.get("sortBy")
  const sortOrder = url.searchParams.get("sortOrder")

  if (search) filters.search = search
  if (status) filters.status = status
  if (type) filters.type = type
  if (sortBy && VALID_SORT_BY.has(sortBy)) filters.sortBy = sortBy
  if (sortOrder && VALID_SORT_ORDER.has(sortOrder as "asc" | "desc")) filters.sortOrder = sortOrder as "asc" | "desc"

  return handleListPosts(locals.session as { user: { id: string } } | null, filters)
}

export const POST: AdminRoute = async ({ request, locals }) => {
  const body = await request.json()
  return await handleCreatePost(locals.session as { user: { id: string } } | null, body)
}
