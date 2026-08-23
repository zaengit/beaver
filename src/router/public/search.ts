import type { AdminRoute } from "@zbeaver/beaver/router/route"
import { searchPublishedPosts } from "@zbeaver/beaver/app/public/posts"

export const GET: AdminRoute = async ({ request }) => {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? ""
  if (query.length < 2) return Response.json({ data: [] })

  const result = await searchPublishedPosts(query, 1, 6)
  return Response.json({ data: result.success ? result.data.data : [] })
}
