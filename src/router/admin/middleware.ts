import type { MiddlewareHandler } from "hono"

import { getAdminSession } from "@zbeaver/beaver/app/admin/api-guard"
import { can } from "@zbeaver/beaver/app/admin/permissions"
import { clientAddress, isWithinRateLimit } from "@zbeaver/beaver/router/security"

export type AdminApiEnvironment = {
  Variables: { session: { user: { id: string } } }
}

const PUBLIC_PATHS = new Set(["/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/session"])

function readCookie(request: Request, name: string) {
  const value = request.headers.get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1)
  return value ? { value } : undefined
}

function requiredPermission(pathname: string, method: string) {
  const rest = pathname.slice("/api/admin".length)
  const read = method === "GET" || method === "HEAD"
  if (rest.startsWith("/users")) {
    if (read) return "users.view"
    if (rest.includes("/bulk/delete") || method === "DELETE") return "users.delete"
    if (rest.includes("duplicate") || method === "POST") return "users.create"
    return "users.edit"
  }
  if (rest.startsWith("/roles")) {
    if (read) return "roles.view"
    if (rest.includes("/bulk/delete") || method === "DELETE") return "roles.delete"
    if (rest.includes("duplicate") || method === "POST") return "roles.create"
    return "roles.edit"
  }
  // Post and category permissions depend on their content type. Their handlers
  // resolve the type from the request or stored record before authorizing.
  if (rest.startsWith("/categories") || rest.startsWith("/posts")) return null
  if (rest.startsWith("/menus")) {
    if (read) return "menus.view"
    if (method === "DELETE") return "menus.delete"
    if (method === "POST" && rest === "/menus") return "menus.create"
    return "menus.edit"
  }
  if (rest.startsWith("/media")) return read ? "media.view" : null
  if (rest === "/settings") return "settings.manage"
  return null
}

export const adminSecurity: MiddlewareHandler<AdminApiEnvironment> = async (context, next) => {
  const request = context.req.raw
  const pathname = new URL(request.url).pathname
  const method = request.method

  if (pathname === "/api/admin/auth/login" && method === "POST") {
    const client = clientAddress(request)
    if (!isWithinRateLimit(`${pathname}:${client}`, 10, 15 * 60 * 1000)) return context.json({ success: false, message: "Too many requests. Please try again later." }, 429)
  }

  if (PUBLIC_PATHS.has(pathname)) return next()

  const session = await getAdminSession({ get: (name: string) => readCookie(request, name), set: () => undefined })
  if (!session) return context.json({ success: false, message: "Unauthorized." }, 401)

  const permission = requiredPermission(pathname, method)
  if (permission && (!session.permissions.includes(permission) || !(await can(session.user.id, permission)))) {
    return context.json({ success: false, message: "Insufficient permissions." }, 403)
  }

  context.set("session", { user: session.user })
  return next()
}
