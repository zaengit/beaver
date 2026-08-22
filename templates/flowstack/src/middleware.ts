import { defineMiddleware } from "astro:middleware"

function secureResponse(response: Response, pathname: string) {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob: https:; media-src 'self' https:; connect-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://challenges.cloudflare.com https://translate.google.com; script-src 'self' 'unsafe-inline' blob: https://challenges.cloudflare.com https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://www.gstatic.com")
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }
  if (/^\/storage\/[A-Za-z0-9_-]+\.pdf$/i.test(pathname)) {
    response.headers.set("Content-Disposition", "attachment")
    response.headers.set("Content-Security-Policy", "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; sandbox")
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")) {
    response.headers.set("Cache-Control", "no-store, private")
  }
  return response
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.url.length > 8192) {
    return secureResponse(new Response("Request URL is too long.", { status: 414 }), context.url.pathname)
  }
  return secureResponse(await next(), context.url.pathname)
})
