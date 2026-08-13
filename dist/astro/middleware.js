import { defineMiddleware } from "astro:middleware"
import { ADMIN_PATH } from "zadm/server"

const INTERNAL_REWRITE = "__zadmInternalRewrite"

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname
  const locals = context.locals
  if (locals[INTERNAL_REWRITE] !== true && pathname.startsWith("/__cms/")) return new Response("Not Found", { status: 404 })
  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
    locals[INTERNAL_REWRITE] = true
    return context.rewrite(new URL(`/__cms/control-panel?pathname=${encodeURIComponent(pathname)}`, context.request.url))
  }
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    locals[INTERNAL_REWRITE] = true
    return context.rewrite(new URL(`/__cms/http?request=${encodeURIComponent(`${pathname}${context.url.search}`)}`, context.request.url))
  }
  return next()
})
