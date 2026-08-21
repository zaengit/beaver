import type { Context } from "hono"
import { isIP } from "node:net"
import { isWithinRateLimit } from "@zbeaver/beaver/app/security/rate-limit"

export { isWithinRateLimit }

export function applySecurityHeaders(context: Pick<Context, "header">) {
  context.header("X-Content-Type-Options", "nosniff")
  context.header("X-Frame-Options", "SAMEORIGIN")
  context.header("Referrer-Policy", "strict-origin-when-cross-origin")
  context.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  context.header("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com; script-src 'self' 'unsafe-inline' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'")
  if (process.env.NODE_ENV === "production") context.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
}

export function isReadRequest(method: string) {
  return method === "GET" || method === "HEAD" || method === "OPTIONS"
}

/**
 * Enforces a limit even for chunked requests without Content-Length. The body
 * is rebuilt after inspection so downstream handlers can still consume it.
 */
export async function enforceRequestBodyLimit(context: Context, maximum: number) {
  const request = context.req.raw
  if (!request.body) return null

  const contentLength = request.headers.get("content-length")
  if (contentLength && !request.headers.has("transfer-encoding")) {
    const length = Number(contentLength)
    return !Number.isSafeInteger(length) || length < 0 || length > maximum
      ? "Request body is too large."
      : null
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maximum) {
      await reader.cancel()
      return "Request body is too large."
    }
    chunks.push(value)
  }

  context.req.raw = new Request(request, {
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    }),
    duplex: "half",
  } as RequestInit)
  return null
}

export function hasValidSameOrigin(request: Request) {
  const origin = request.headers.get("origin")
  return Boolean(origin && origin === new URL(request.url).origin)
}

export function clientAddress(request: Request) {
  if (process.env.TRUST_PROXY === "true") {
    const forwarded = [
      request.headers.get("cf-connecting-ip"),
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      request.headers.get("x-real-ip"),
    ]
    for (const candidate of forwarded) {
      if (candidate && isIP(candidate) !== 0) return candidate
    }
  }
  return "unknown"
}
