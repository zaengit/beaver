import { Hono } from "hono"
import { adminSecurity, type AdminApiEnvironment } from "@zaenpm/beaver/router/admin/middleware"
import { createAdminRouteContext, type AdminRoute } from "@zaenpm/beaver/router/route"
import { applySecurityHeaders, enforceRequestBodyLimit, hasValidSameOrigin, isReadRequest } from "@zaenpm/beaver/router/security"

type RouteModule = Partial<Record<"DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT", AdminRoute>>
type ApiEnvironment = AdminApiEnvironment

const routeModules = {
  ...import.meta.glob(["./admin/**/*.ts", "!./admin/**/*.test.ts"]),
  ...import.meta.glob(["./public/**/*.ts", "!./public/**/*.test.ts"]),
  ...import.meta.glob(["./media/**/*.ts", "!./media/**/*.test.ts"]),
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
  .filter(([modulePath]) => !modulePath.endsWith(".test.ts") && !modulePath.endsWith("/middleware.ts"))
  .map(([modulePath, load]) => ({
    path: toHonoPath(modulePath),
    load: load as () => Promise<RouteModule>,
  }))
  .sort((left, right) => right.path.length - left.path.length)

export const apiApp = new Hono<ApiEnvironment>().basePath("/api")

apiApp.use("*", async (context, next) => {
  applySecurityHeaders(context)

  const request = context.req.raw
  if (!isReadRequest(request.method)) {
    const pathname = new URL(request.url).pathname
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

for (const route of routes) {
  apiApp.all(route.path, async (context) => {
    const handler = (await route.load())[context.req.method as keyof RouteModule]
    if (!handler) {
      return Response.json({ success: false, message: "Method not allowed." }, { status: 405 })
    }

    return withHonoHeaders(await handler(createAdminRouteContext(context)), context)
  })
}
