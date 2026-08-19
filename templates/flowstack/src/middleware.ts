import { defineMiddleware } from "astro:middleware"
import { ADMIN_PATH } from "@zaen3/beaver/server"

const INTERNAL_REWRITE = "__serverInternalRewrite"

function secureResponse(response: Response) {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com; script-src 'self' 'unsafe-inline' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'")
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }
  return response
}

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname
  const locals = context.locals as Record<string, unknown>
  const isInternalRewrite = locals[INTERNAL_REWRITE] === true

  if (!isInternalRewrite && pathname.startsWith("/system/")) {
    return secureResponse(new Response("Not Found", { status: 404 }))
  }

  if (ADMIN_PATH !== "/admin" && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return secureResponse(new Response("Not Found", { status: 404 }))
  }

  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
    const rewrittenUrl = new URL(context.request.url)
    rewrittenUrl.pathname = "/system/control-panel"
    rewrittenUrl.search = new URLSearchParams({ pathname }).toString()
    locals[INTERNAL_REWRITE] = true
    return context.rewrite(rewrittenUrl)
  }

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const rewrittenUrl = new URL(context.request.url)
    rewrittenUrl.pathname = "/system/http"
    rewrittenUrl.search = new URLSearchParams({ request: `${pathname}${rewrittenUrl.search}` }).toString()
    locals[INTERNAL_REWRITE] = true
    return context.rewrite(rewrittenUrl)
  }

  return secureResponse(await next())
})
