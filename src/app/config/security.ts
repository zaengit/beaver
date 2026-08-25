const SECRET_NAMES = ["SESSION_SECRET", "ADMIN_JWT_ACCESS_SECRET", "ADMIN_JWT_REFRESH_SECRET"] as const
const PLACEHOLDER_VALUES = new Set([
  "change-me",
  "change-this-password",
  "admin@example.com",
  "password123",
])
const BASE32_TOTP_SECRET_PATTERN = /^[A-Z2-7]+=*$/
const MIN_TOTP_SECRET_LENGTH = 26

export type SuperAdminTwoFactorConfig = {
  enabled: boolean
  secret: string | null
}

export function isTestEnvironment() {
  return process.env.NODE_ENV === "test"
    || (process.env.NODE_ENV !== "production" && process.env.BEAVER_TEST_MODE === "true")
}

export function assertSecureSecrets() {
  if (isTestEnvironment()) return

  for (const name of SECRET_NAMES) {
    const value = process.env[name]
    if (!value || value.length < 32 || value.length > 4096 || PLACEHOLDER_VALUES.has(value)) {
      throw new Error(`${name} must be set to a random value of at least 32 characters.`)
    }
  }
}

export function assertSecureAdminEnvironment() {
  if (isTestEnvironment()) return

  assertSecureSecrets()

  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim()
  if (!email || email.length > 254 || !/^.+@.+\..+$/.test(email) || !password || password.length < 12 || password.length > 128 || !name || name.length > 100) {
    throw new Error("Super Admin requires ADMIN_EMAIL, ADMIN_NAME, and an ADMIN_PASSWORD of at least 12 characters.")
  }
  if (PLACEHOLDER_VALUES.has(email) || PLACEHOLDER_VALUES.has(password)) {
    throw new Error("Super Admin does not allow placeholder administrator credentials.")
  }

  getSuperAdminTwoFactorConfig()
}

export function assertSecureSeedEnvironment() {
  assertSecureAdminEnvironment()
}

export function getAdminCredentials() {
  if (isTestEnvironment()) {
    return {
      email: process.env.ADMIN_EMAIL?.trim() || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "password123",
      name: process.env.ADMIN_NAME?.trim() || "Super Admin",
    }
  }

  assertSecureAdminEnvironment()
  return {
    email: process.env.ADMIN_EMAIL!.trim(),
    password: process.env.ADMIN_PASSWORD!,
    name: process.env.ADMIN_NAME!.trim(),
  }
}

/**
 * Super Admin TOTP is environment-managed for the same reason as the
 * identity: it must not create or depend on a database user record.
 *
 * Presence alone does not enable 2FA. This makes an accidental secret value
 * harmless until the operator explicitly sets ADMIN_2FA_ENABLED=true.
 */
export function getSuperAdminTwoFactorConfig(): SuperAdminTwoFactorConfig {
  const rawEnabled = process.env.ADMIN_2FA_ENABLED?.trim().toLowerCase()
  if (rawEnabled && rawEnabled !== "true" && rawEnabled !== "false") {
    throw new Error("ADMIN_2FA_ENABLED must be either true or false.")
  }

  const enabled = rawEnabled === "true"
  if (!enabled) return { enabled: false, secret: null }

  const secret = process.env.ADMIN_2FA_SECRET
    ?.replace(/\s+/g, "")
    .toUpperCase()

  if (!secret || secret.length < MIN_TOTP_SECRET_LENGTH || !BASE32_TOTP_SECRET_PATTERN.test(secret)) {
    throw new Error("ADMIN_2FA_SECRET must be a valid Base32 TOTP secret of at least 26 characters when ADMIN_2FA_ENABLED=true.")
  }

  return { enabled: true, secret }
}

/** @deprecated Use getAdminCredentials; retained for CLI/source compatibility. */
export function getSeedAdminCredentials() {
  return getAdminCredentials()
}
