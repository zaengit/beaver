import { getServerContentTypeRegistry } from "zadm/app/registry/server-content-types"

import { getPublicCustomFieldFiltersFromSearchParams, listPublishedPostsByType } from "zadm/app/public/posts"
import type { AdminRoute } from "zadm/router/route"

export const GET: AdminRoute = ({ params, request }) => {
  const registry = getServerContentTypeRegistry()
  const type = params.type
  if (!type || !registry.contentTypes.some((contentType) => contentType.slug === type)) {
    return Response.json({ message: "Content type not found." }, { status: 404 })
  }

  const url = new URL(request.url)
  const requestedPage = Number(url.searchParams.get("page") ?? 1)
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1
  const result = listPublishedPostsByType(type, page, 24, {
    search: url.searchParams.get("search") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    customFields: getPublicCustomFieldFiltersFromSearchParams(type, url.searchParams),
  })

  if (!result.success) return Response.json({ message: result.error.message }, { status: 500 })
  return Response.json(result.data)
}
