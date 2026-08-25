import { verifyPassword } from "@zbeaver/beaver/app/auth"
import { getUserByEmail } from "@zbeaver/beaver/app/services/users"
import { loginSchema } from "@zbeaver/beaver/app/validations/auth"
import {
  isRateLimitAvailable,
  isWithinRateLimit,
  resetRateLimit,
} from "@zbeaver/beaver/app/security/rate-limit"
import {
  authenticateSuperAdmin,
  isConfiguredSuperAdminEmail,
} from "@zbeaver/beaver/app/admin/super-admin"
import { isTwoFactorEnabled } from "@zbeaver/beaver/app/services/two-factor"

const DUMMY_PASSWORD_HASH = "$2b$12$o0uJ9XsFOcfthEY.ALXOH.hYe9WJIhl6AFPTnQ5gOOJ5OMaarBZN2"
const LOGIN_GLOBAL_LIMIT = 100
const LOGIN_EMAIL_LIMIT = 5
const LOGIN_IP_LIMIT = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000

type LoginRateLimit = { key: string; limit: number }

function loginRateLimits(email: string, clientKey: string): LoginRateLimit[] {
  return [
    { key: "login:failed:global", limit: LOGIN_GLOBAL_LIMIT },
    { key: `login:failed:email:${email}`, limit: LOGIN_EMAIL_LIMIT },
    { key: `login:failed:ip:${clientKey}`, limit: LOGIN_IP_LIMIT },
  ]
}

function failedLogin(rateLimits: LoginRateLimit[]) {
  if (rateLimits.some(({ key, limit }) => !isRateLimitAvailable(key, limit))) {
    return {
      success: false as const,
      status: 429,
      message: "Too many requests. Please try again later.",
    }
  }

  for (const { key, limit } of rateLimits) {
    isWithinRateLimit(key, limit, LOGIN_WINDOW_MS)
  }

  return {
    success: false as const,
    status: 401,
    message: "Invalid credentials.",
  }
}

function clearLoginFailures(rateLimits: LoginRateLimit[]) {
  for (const { key } of rateLimits) resetRateLimit(key)
}

export async function handlePasswordLogin(body: unknown, clientKey = "unknown") {
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return {
      success: false as const,
      status: 422,
      message: "Validation error.",
    }
  }

  const { email, password } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()
  const rateLimits = loginRateLimits(normalizedEmail, clientKey)

  if (isConfiguredSuperAdminEmail(normalizedEmail)) {
    const superAdmin = await authenticateSuperAdmin(normalizedEmail, password)
    if (!superAdmin) {
      return failedLogin(rateLimits)
    }

    clearLoginFailures(rateLimits)
    return {
      success: true as const,
      status: 200,
      message: "Login successful.",
      user: superAdmin,
      requiresTwoFactor: await isTwoFactorEnabled(superAdmin.id),
    }
  }

  const userResult = await getUserByEmail(email)
  const isValid = await verifyPassword(password, userResult.success ? userResult.data.password : DUMMY_PASSWORD_HASH)
  if (!userResult.success || !isValid) {
    return failedLogin(rateLimits)
  }

  const safeUser = { ...userResult.data }
  Reflect.deleteProperty(safeUser, "password")
  clearLoginFailures(rateLimits)
  return {
    success: true as const,
    status: 200,
    message: "Login successful.",
    user: safeUser,
    requiresTwoFactor: await isTwoFactorEnabled(safeUser.id),
  }
}
