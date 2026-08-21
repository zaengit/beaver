import type { MiddlewareHandler } from "hono"

import { getAdminSession } from "@zbeaver/beaver/app/admin/api-guard"
import { can } from "@zbeaver/beaver/app/admin/permissions"
import { clientAddress, isWithinRateLimit } from "@zbeaver/beaver/router/security"

export type AdminApiEnvironment = {
  Variables: { session: { user: { id: string } } }
}

const PUBLIC_PATHS = new Set(["/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/session", "/api/admin/auth/logout"])

function readCookie(request: Request, name: string) {
  const value = request.headers.get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1)
  return value ? { value } : undefined
}

function requiredPermissions(pathname: string, method: string) {
  const rest = pathname.slice("/api/admin".length)
  const read = method === "GET" || method === "HEAD"
  if (rest.startsWith("/users")) {
    if (read) return ["users.view"]
    if (rest.includes("/bulk/delete") || method === "DELETE") return ["users.delete", "users.manage"]
    if (rest.includes("duplicate") || method === "POST") return ["users.create", "users.manage"]
    return ["users.edit", "users.manage"]
  }
  if (rest.startsWith("/roles")) {
    if (rest === "/roles/sync-permissions" && method === "POST") return ["roles.manage"]
    if (read) return ["roles.view"]
    if (rest.includes("/bulk/delete") || method === "DELETE") return ["roles.delete", "roles.manage"]
    if (rest.includes("duplicate") || method === "POST") return ["roles.create", "roles.manage"]
    return ["roles.edit", "roles.manage"]
  }
  if (rest === "/dashboard") return ["dashboard.view"]
  // Post and category permissions depend on their content type. Their handlers
  // resolve the type from the request or stored record before authorizing.
  if (rest.startsWith("/categories") || rest.startsWith("/posts")) return null
  if (rest.startsWith("/menus")) {
    if (read) return ["menus.view"]
    if (method === "DELETE") return ["menus.delete"]
    if (method === "POST" && rest === "/menus") return ["menus.create"]
    return ["menus.edit", "menus.manage"]
  }
  if (rest.startsWith("/media")) return read ? ["media.view"] : null
  if (rest === "/settings") return ["settings.manage"]
  return null
}

export const adminSecurity: MiddlewareHandler<AdminApiEnvironment> = async (context, next) => {
  const request = context.req.raw
  // Hono exposes the canonical, decoded route path here. Using the raw URL
  // pathname would let `/admin/%75sers` match the users route while skipping
  // the `/users` permission branch below.
  const pathname = context.req.path
  const method = request.method

  if (pathname === "/api/admin/auth/login" && method === "POST") {
    const client = clientAddress(request)
    const key = client === "unknown" ? `${pathname}:global` : `${pathname}:${client}`
    const limit = client === "unknown" ? 60 : 10
    if (!isWithinRateLimit(key, limit, 15 * 60 * 1000)) return context.json({ success: false, message: "Too many requests. Please try again later." }, 429)
  }

  if (PUBLIC_PATHS.has(pathname)) return next()

  const session = await getAdminSession({ get: (name: string) => readCookie(request, name), set: () => undefined })
  if (!session) return context.json({ success: false, message: "Unauthorized." }, 401)

  const permissions = requiredPermissions(pathname, method)
  const allowed = permissions
    ? (await Promise.all(permissions.map((permission) => can(session.user.id, permission)))).some(Boolean)
    : true
  if (!allowed) {
    return context.json({ success: false, message: "Insufficient permissions." }, 403)
  }

  context.set("session", { user: session.user })
  return next()
}
