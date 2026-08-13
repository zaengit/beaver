import { SignJWT, jwtVerify } from "jose"
import { createHash } from "node:crypto"

const encoder = new TextEncoder()

function getJwtSecret(name: "ADMIN_JWT_ACCESS_SECRET" | "ADMIN_JWT_REFRESH_SECRET") {
  const value = process.env[name]
  if (value && value.length >= 32) return encoder.encode(value)

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be set to a random value of at least 32 characters in production.`)
  }

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
  email: string
  roleId: string | null
  permissions: string[]
}

type RefreshClaims = {
  sub: string
  sessionId: string
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

export async function verifyAccessToken(token: string) {
  const result = await jwtVerify<AccessClaims>(token, getAccessSecret())
  return result.payload
}

export async function verifyRefreshToken(token: string) {
  const result = await jwtVerify<RefreshClaims>(token, getRefreshSecret())
  return result.payload
}
