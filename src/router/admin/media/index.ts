import type { AdminRoute } from "zadm/router/route"
import type { MediaFilters } from "zadm/pkg/types/media"

import { handleListMedia, handleUploadMedia } from "zadm/app/handlers"

const VALID_SORT_BY = new Set(["name", "createdAt", "size"])
const VALID_SORT_ORDER = new Set(["asc", "desc"])

export const GET: AdminRoute = async ({ request }) => {
  const url = new URL(request.url)

  const filters: MediaFilters = {}
  const page = url.searchParams.get("page")
  const perPage = url.searchParams.get("perPage")
  const search = url.searchParams.get("search")
  const folder = url.searchParams.get("folder")
  const mimeType = url.searchParams.get("mimeType")
  const sortBy = url.searchParams.get("sortBy")
  const sortOrder = url.searchParams.get("sortOrder")

  if (page) filters.page = Number(page)
  if (perPage) filters.perPage = Number(perPage)
  if (search) filters.search = search
  if (folder === "") filters.folder = null
  else if (folder) filters.folder = folder
  if (mimeType) filters.mimeType = mimeType
  if (sortBy && VALID_SORT_BY.has(sortBy)) filters.sortBy = sortBy
  if (sortOrder && VALID_SORT_ORDER.has(sortOrder as "asc" | "desc")) filters.sortOrder = sortOrder as "asc" | "desc"

  return handleListMedia(filters)
}

export const POST: AdminRoute = async ({ request, locals }) => {
  const formData = await request.formData()
  return handleUploadMedia(locals.session as { user: { id: string } } | null, formData)
}
