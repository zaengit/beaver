import { generateSecret, generateURI } from "otplib"

import {
  getAdminCredentials,
  getSuperAdminTwoFactorConfig,
} from "@zbeaver/beaver/app/config/security"

const TWO_FACTOR_ISSUER = "Beaver"

export function getSuperAdminTwoFactorUri(secret: string) {
  const credentials = getAdminCredentials()
  return generateURI({
    issuer: TWO_FACTOR_ISSUER,
    label: credentials.email,
    secret,
  })
}

/**
 * Generates a setup payload for the operator to copy into .env.
 * It intentionally does not write files or persist the secret in the
 * database. The caller must set the values and restart the application.
 */
export function generateSuperAdminTwoFactorSetup(force = false) {
  const current = getSuperAdminTwoFactorConfig()
  if (current.enabled && !force) {
    throw new Error("Super Admin 2FA is already enabled. Use --force to rotate the secret.")
  }

  const secret = generateSecret()
  return {
    enabled: true,
    secret,
    otpauthUrl: getSuperAdminTwoFactorUri(secret),
  }
}
