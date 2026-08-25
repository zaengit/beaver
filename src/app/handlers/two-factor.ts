import { adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { requireAuth } from "@zbeaver/beaver/app/handlers/guard"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import { disableTwoFactorSchema, twoFactorCodeSchema } from "@zbeaver/beaver/app/validations/auth"
import {
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  getTwoFactorStatus,
} from "@zbeaver/beaver/app/services/two-factor"

export async function handleTwoFactorStatus(session: Session) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  return adminSuccess(await getTwoFactorStatus(session!.user.id), "OK")
}

export async function handleTwoFactorSetup(session: Session) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const result = await beginTwoFactorSetup(session!.user.id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleTwoFactorEnable(session: Session, body: unknown) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const parsed = parseWithSchema(twoFactorCodeSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await confirmTwoFactorSetup(session!.user.id, parsed.data.code)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleTwoFactorDisable(session: Session, body: unknown) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const parsed = parseWithSchema(disableTwoFactorSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await disableTwoFactor(session!.user.id, parsed.data.password, parsed.data.code)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}
