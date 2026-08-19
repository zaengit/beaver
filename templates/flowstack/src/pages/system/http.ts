import type { APIRoute } from "astro"

import { apiApp } from "@zaen3/beaver/server"

export const prerender = false

export const ALL: APIRoute = (context) => {
  const requestTarget = context.url.searchParams.get("request")
  if (!requestTarget?.startsWith("/api")) return new Response("Not Found", { status: 404 })

  const requestUrl = new URL(context.request.url)
  requestUrl.pathname = requestTarget.split("?")[0]
  requestUrl.search = requestTarget.includes("?") ? requestTarget.slice(requestTarget.indexOf("?")) : ""
  return apiApp.fetch(new Request(requestUrl, context.request))
}
