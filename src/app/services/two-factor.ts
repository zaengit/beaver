import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import { generateSecret, generateURI, verify } from "otplib"

import {
  assertSecureSecrets,
  getAdminCredentials,
  getSuperAdminTwoFactorConfig,
  isTestEnvironment,
} from "@zbeaver/beaver/app/config/security"
import { verifyPassword } from "@zbeaver/beaver/app/auth"
import { authenticateSuperAdmin, isSuperAdminUserId } from "@zbeaver/beaver/app/admin/super-admin"
import { deleteRefreshSessionsForUser } from "@zbeaver/beaver/app/admin/session-store"
import { findUserByIdRecord, findSafeUserByIdRecord } from "@zbeaver/beaver/app/repositories/users"
import {
  deleteTwoFactorRecord,
  enableTwoFactor,
  findTwoFactorRecord,
  saveTwoFactorSetup,
} from "@zbeaver/beaver/app/repositories/two-factor"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { serviceConflict, serviceNotFound, serviceSuccess, serviceValidation } from "@zbeaver/beaver/app/services/utils"
import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"

const TWO_FACTOR_ISSUER = "Beaver"
const ENCRYPTION_PREFIX = "v1"
const TOTP_EPOCH_TOLERANCE_SECONDS = 30

function encryptionKey() {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret) {
    if (isTestEnvironment()) {
      return createHash("sha256").update("beaver-test-two-factor").digest()
    }
    throw new Error("SESSION_SECRET must be configured before using two-factor authentication.")
  }

  if (!isTestEnvironment()) assertSecureSecrets()
  return createHash("sha256").update(`beaver-two-factor:${sessionSecret}`).digest()
}

function encryptSecret(secret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [ENCRYPTION_PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".")
}

function decryptSecret(value: string) {
  const [prefix, ivValue, tagValue, encryptedValue] = value.split(".")
  if (prefix !== ENCRYPTION_PREFIX || !ivValue || !tagValue || !encryptedValue) {
    throw new Error("Invalid two-factor secret format.")
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64url"),
  )
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}

function normalizeCode(code: string) {
  return code.trim()
}

async function verifyStoredCode(userId: string, code: string, requireEnabled = true) {
  const record = await findTwoFactorRecord(userId)
  if (!record || (requireEnabled && record.enabled !== 1)) return false

  try {
    const result = await verify({
      secret: decryptSecret(record.secret),
      token: normalizeCode(code),
      epochTolerance: TOTP_EPOCH_TOLERANCE_SECONDS,
    })
    return result.valid
  } catch {
    // A corrupted or undecryptable secret must fail closed.
    return false
  }
}

async function verifySuperAdminCode(code: string) {
  const config = getSuperAdminTwoFactorConfig()
  if (!config.enabled || !config.secret) return false

  try {
    const result = await verify({
      secret: config.secret,
      token: normalizeCode(code),
      epochTolerance: TOTP_EPOCH_TOLERANCE_SECONDS,
    })
    return result.valid
  } catch {
    // Invalid environment configuration or a malformed token must fail closed.
    return false
  }
}

export async function isTwoFactorEnabled(userId: string) {
  if (isSuperAdminUserId(userId)) {
    return getSuperAdminTwoFactorConfig().enabled
  }

  const record = await findTwoFactorRecord(userId)
  return record?.enabled === 1
}

export async function getTwoFactorStatus(userId: string) {
  return { enabled: await isTwoFactorEnabled(userId) }
}

export async function beginTwoFactorSetup(userId: string): Promise<ServiceResult<{ secret: string; otpauthUrl: string }>> {
  if (isSuperAdminUserId(userId)) {
    const config = getSuperAdminTwoFactorConfig()
    if (config.enabled) {
      return serviceConflict("twoFactor", "Super Admin two-factor authentication is already enabled.")
    }
    return serviceValidation("Configure ADMIN_2FA_ENABLED=true and ADMIN_2FA_SECRET, then restart the application.")
  }

  const user = await findSafeUserByIdRecord(userId)
  if (!user) return serviceNotFound("User")

  const existing = await findTwoFactorRecord(userId)
  if (existing?.enabled === 1) {
    return serviceConflict("twoFactor", "Two-factor authentication is already enabled.")
  }

  const secret = generateSecret()
  await saveTwoFactorSetup(userId, encryptSecret(secret), getCurrentTimestamp())

  return serviceSuccess({
    secret,
    otpauthUrl: generateURI({
      issuer: TWO_FACTOR_ISSUER,
      label: user.email,
      secret,
    }),
  }, "Two-factor setup started.")
}

export async function confirmTwoFactorSetup(
  userId: string,
  code: string,
): Promise<ServiceResult<{ enabled: true }>> {
  if (isSuperAdminUserId(userId)) {
    return serviceValidation("Super Admin two-factor authentication is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET.")
  }

  const record = await findTwoFactorRecord(userId)
  if (!record) return serviceValidation("Start two-factor setup before enabling it.")
  if (record.enabled === 1) return serviceConflict("twoFactor", "Two-factor authentication is already enabled.")

  if (!(await verifyStoredCode(userId, code, false))) {
    return serviceValidation("Invalid authenticator code.")
  }

  await enableTwoFactor(userId, getCurrentTimestamp())
  await deleteRefreshSessionsForUser(userId)
  return serviceSuccess({ enabled: true }, "Two-factor authentication enabled.")
}

async function verifyCurrentPassword(userId: string, password: string) {
  if (isSuperAdminUserId(userId)) {
    const credentials = getAdminCredentials()
    return Boolean(await authenticateSuperAdmin(credentials.email, password))
  }

  const user = await findUserByIdRecord(userId)
  return user ? verifyPassword(password, user.password) : false
}

export async function disableTwoFactor(
  userId: string,
  password: string,
  code: string,
): Promise<ServiceResult<{ enabled: false }>> {
  if (isSuperAdminUserId(userId)) {
    return serviceValidation("Super Admin two-factor authentication is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET.")
  }

  const record = await findTwoFactorRecord(userId)
  if (!record || record.enabled !== 1) {
    return serviceValidation("Two-factor authentication is not enabled.")
  }

  if (!(await verifyCurrentPassword(userId, password))) {
    return serviceValidation("Current password is invalid.")
  }
  if (!(await verifyStoredCode(userId, code))) {
    return serviceValidation("Invalid authenticator code.")
  }

  await deleteTwoFactorRecord(userId)
  await deleteRefreshSessionsForUser(userId)
  return serviceSuccess({ enabled: false }, "Two-factor authentication disabled.")
}

export async function verifyTwoFactorCode(userId: string, code: string) {
  if (isSuperAdminUserId(userId)) return verifySuperAdminCode(code)

  return verifyStoredCode(userId, code)
}
