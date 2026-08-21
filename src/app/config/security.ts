const SECRET_NAMES = ["SESSION_SECRET", "ADMIN_JWT_ACCESS_SECRET", "ADMIN_JWT_REFRESH_SECRET"] as const
const PLACEHOLDER_VALUES = new Set([
  "change-me",
  "change-this-password",
  "admin@example.com",
  "password123",
])

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

export function assertSecureSeedEnvironment() {
  if (isTestEnvironment()) return

  assertSecureSecrets()

  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim()
  if (!email || email.length > 254 || !/^.+@.+\..+$/.test(email) || !password || password.length < 12 || password.length > 128 || !name || name.length > 100) {
    throw new Error("Seeding requires ADMIN_EMAIL, ADMIN_NAME, and an ADMIN_PASSWORD of at least 12 characters.")
  }
  if (PLACEHOLDER_VALUES.has(email) || PLACEHOLDER_VALUES.has(password)) {
    throw new Error("Seeding does not allow placeholder administrator credentials.")
  }
}

export function getSeedAdminCredentials() {
  if (isTestEnvironment()) {
    return {
      email: process.env.ADMIN_EMAIL?.trim() || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "password123",
      name: process.env.ADMIN_NAME?.trim() || "Super Admin",
    }
  }

  assertSecureSeedEnvironment()
  return {
    email: process.env.ADMIN_EMAIL!.trim(),
    password: process.env.ADMIN_PASSWORD!,
    name: process.env.ADMIN_NAME!.trim(),
  }
}
