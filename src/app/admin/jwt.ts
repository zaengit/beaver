import { SignJWT, jwtVerify } from "jose"
import { createHash } from "node:crypto"
import { assertSecureSecrets, isTestEnvironment } from "@zbeaver/beaver/app/config/security"
import type { StaticRole } from "@zbeaver/beaver/pkg/types/roles"

const encoder = new TextEncoder()

function getJwtSecret(name: "ADMIN_JWT_ACCESS_SECRET" | "ADMIN_JWT_REFRESH_SECRET") {
  const value = process.env[name]
  if (!isTestEnvironment()) {
    assertSecureSecrets()
    return encoder.encode(value!)
  }

  if (value && value.length >= 32) return encoder.encode(value)

  // Reuse the local session secret to keep development sessions valid across
  // dev-server restarts without introducing a predictable fallback.
  if (process.env.SESSION_SECRET) {
    return encoder.encode(
      createHash("sha256").update(`${name}:${process.env.SESSION_SECRET}`).digest("base64url"),
    )
  }

  // Test environments without a configured secret still avoid a predictable
  // fallback, at the cost of invalidating tokens when their process restarts.
  return crypto.getRandomValues(new Uint8Array(32))
}

let accessSecret: Uint8Array | undefined
let refreshSecret: Uint8Array | undefined

function getAccessSecret() {
  return accessSecret ??= getJwtSecret("ADMIN_JWT_ACCESS_SECRET")
}

function getRefreshSecret() {
  return refreshSecret ??= getJwtSecret("ADMIN_JWT_REFRESH_SECRET")
}

type AccessClaims = {
  sub: string
  sessionId: string
  email: string
  role: StaticRole | null
  permissions: string[]
  /** True only when an enabled TOTP challenge was completed for this session. */
  twoFactorVerified?: boolean
}

type RefreshClaims = {
  sub: string
  sessionId: string
  email?: string
  /** Preserved across refreshes so enabling 2FA invalidates older sessions. */
  twoFactorVerified?: boolean
}

type TwoFactorChallengeClaims = {
  sub: string
  email: string
  purpose: "admin-2fa"
}

export async function signAccessToken(claims: AccessClaims) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAccessSecret())
}

export async function signRefreshToken(claims: RefreshClaims) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getRefreshSecret())
}

export async function signTwoFactorChallengeToken(claims: Omit<TwoFactorChallengeClaims, "purpose">) {
  return new SignJWT({ ...claims, purpose: "admin-2fa" as const })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getAccessSecret())
}

export async function verifyAccessToken(token: string) {
  const result = await jwtVerify<AccessClaims>(token, getAccessSecret(), { algorithms: ["HS256"] })
  return result.payload
}

export async function verifyRefreshToken(token: string) {
  const result = await jwtVerify<RefreshClaims>(token, getRefreshSecret(), { algorithms: ["HS256"] })
  return result.payload
}

export async function verifyTwoFactorChallengeToken(token: string) {
  const result = await jwtVerify<TwoFactorChallengeClaims>(token, getAccessSecret(), { algorithms: ["HS256"] })
  if (result.payload.purpose !== "admin-2fa") throw new Error("Invalid two-factor challenge.")
  return result.payload
}
