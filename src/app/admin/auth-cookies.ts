import type { AstroLikeCookies } from "@zbeaver/beaver/app/http/request-context"

export const ADMIN_ACCESS_COOKIE = "admin_access_token"
export const ADMIN_REFRESH_COOKIE = "admin_refresh_token"
export const ADMIN_2FA_CHALLENGE_COOKIE = "admin_2fa_challenge"

const secure = process.env.COOKIE_SECURE === "true"
  || (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test")

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

export function buildAdminTwoFactorChallengeCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/api/admin/auth",
    maxAge: 5 * 60,
  }
}

export function readAdminAccessToken(cookies: AstroLikeCookies) {
  return cookies.get(ADMIN_ACCESS_COOKIE)?.value ?? null
}

export function readAdminRefreshToken(cookies: AstroLikeCookies) {
  return cookies.get(ADMIN_REFRESH_COOKIE)?.value ?? null
}

export function readAdminTwoFactorChallenge(cookies: AstroLikeCookies) {
  return cookies.get(ADMIN_2FA_CHALLENGE_COOKIE)?.value ?? null
}

export function clearAdminSessionCookies(cookies: AstroLikeCookies) {
  cookies.set(ADMIN_ACCESS_COOKIE, "", { ...buildAdminAccessCookieOptions(), maxAge: 0 })
  cookies.set(ADMIN_REFRESH_COOKIE, "", { ...buildAdminRefreshCookieOptions(), maxAge: 0 })
}

export function clearAdminTwoFactorChallengeCookie(cookies: AstroLikeCookies) {
  cookies.set(ADMIN_2FA_CHALLENGE_COOKIE, "", { ...buildAdminTwoFactorChallengeCookieOptions(), maxAge: 0 })
}
