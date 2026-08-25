import { Hono } from "hono"
import { captureActivitySnapshot, recordActivityRequest } from "@zbeaver/beaver/app/services/activity-logs"
import { adminSecurity, type AdminApiEnvironment } from "@zbeaver/beaver/router/admin/middleware"
import { createAdminRouteContext, type AdminRoute } from "@zbeaver/beaver/router/route"
import { applySecurityHeaders, clientAddress, enforceRequestBodyLimit, hasValidSameOrigin, isReadRequest } from "@zbeaver/beaver/router/security"

type RouteModule = Partial<Record<"DELETE" | "GET" | "PATCH" | "POST" | "PUT", AdminRoute>>
type ApiEnvironment = AdminApiEnvironment

const routeModules = {
  ...import.meta.glob(["./admin/**/*.ts", "!./admin/**/*.test.ts", "!./admin/**/*.spec.ts"]),
  ...import.meta.glob(["./public/**/*.ts", "!./public/**/*.test.ts", "!./public/**/*.spec.ts"]),
}

function toHonoPath(modulePath: string) {
  const routeSegments = modulePath
    .replace(/^\.\//, "")
    .replace(/^public\//, "")
    .replace(/\.ts$/, "")
    .split("/")
    .filter((segment) => segment !== "index")
    .map((segment) => segment.replace(/^\[([^\.][^\]]*)\]$/, ":$1"))

  return `/${routeSegments.join("/")}`
}

const routes = Object.entries(routeModules)
  .filter(([modulePath]) => !modulePath.endsWith(".test.ts") && !modulePath.endsWith(".spec.ts") && !modulePath.endsWith("/middleware.ts"))
  .map(([modulePath, load]) => ({
    path: toHonoPath(modulePath),
    load: load as () => Promise<RouteModule>,
  }))
  .sort((left, right) => right.path.length - left.path.length)

export const apiApp = new Hono<ApiEnvironment>().basePath("/api")

apiApp.onError((error, context) => {
  const invalidBody = error instanceof SyntaxError
  if (!invalidBody) console.error("API request failed", error)
  return context.json(
    { success: false, message: invalidBody ? "Invalid request body." : "Request could not be processed." },
    invalidBody ? 400 : 500,
  )
})

apiApp.use("*", async (context, next) => {
  applySecurityHeaders(context)

  const request = context.req.raw
  if (request.url.length > 8_192) {
    return context.json({ success: false, message: "Request URL is too long." }, 414)
  }
  // Use Hono's canonical path so encoded route segments receive the same
  // security headers and body limits as their decoded equivalents.
  const pathname = context.req.path
  if (pathname.startsWith("/api/admin/")) context.header("Cache-Control", "no-store, private")
  if (!isReadRequest(request.method)) {
    const maximum = pathname === "/api/admin/media/upload"
      ? 11 * 1024 * 1024
      : 1024 * 1024
    const bodyError = await enforceRequestBodyLimit(context, maximum)
    if (bodyError) return context.json({ success: false, message: bodyError }, 413)
    if (!hasValidSameOrigin(request)) return context.json({ success: false, message: "Invalid request origin." }, 403)
  }

  return next()
})

apiApp.use("/admin/*", adminSecurity)

function withHonoHeaders(response: Response, context: typeof apiApp extends Hono<infer Environment> ? import("hono").Context<Environment> : never) {
  const headers = new Headers(response.headers)
  for (const [name, value] of context.res.headers) {
    if (name.toLowerCase() === "set-cookie") headers.append(name, value)
    else if (!headers.has(name)) headers.set(name, value)
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

async function readActivityRequestBody(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return undefined
  try {
    return await request.clone().json() as unknown
  } catch {
    return undefined
  }
}

for (const route of routes) {
  apiApp.all(route.path, async (context) => {
    const handler = (await route.load())[context.req.method as keyof RouteModule]
    if (!handler) {
      return Response.json({ success: false, message: "Method not allowed." }, { status: 405 })
    }

    const pathname = context.req.path
    const method = context.req.method
    const shouldCaptureActivity = pathname.startsWith("/api/admin/") && !isReadRequest(method)
    const session = context.get("session")
    const requestBody = shouldCaptureActivity ? await readActivityRequestBody(context.req.raw) : undefined
    const before = shouldCaptureActivity
      ? await captureActivitySnapshot({ pathname, method, actorId: session?.user.id ?? null, requestBody })
      : null
    const response = await handler(createAdminRouteContext(context))
    await recordActivityRequest({
      request: context.req.raw,
      pathname,
      method,
      response,
      actorId: session?.user.id ?? null,
      ipAddress: clientAddress(context.req.raw),
      before,
      requestBody,
    })
    return withHonoHeaders(response, context)
  })
}
