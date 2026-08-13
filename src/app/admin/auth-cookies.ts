import type { AstroLikeCookies } from "zadm/app/http/request-context"

export const ADMIN_ACCESS_COOKIE = "admin_access_token"
export const ADMIN_REFRESH_COOKIE = "admin_refresh_token"

const secure = process.env.NODE_ENV === "production"

export function buildAdminAccessCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 15,
  }
}

export function buildAdminRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  }
}

export function readAdminAccessToken(cookies: AstroLikeCookies) {
  return cookies.get(ADMIN_ACCESS_COOKIE)?.value ?? null
}

export function readAdminRefreshToken(cookies: AstroLikeCookies) {
  return cookies.get(ADMIN_REFRESH_COOKIE)?.value ?? null
}
