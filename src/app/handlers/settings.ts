import { adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { requirePermission } from "@zbeaver/beaver/app/handlers/guard"
import { parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { getSiteSettings, updateSiteSettings } from "@zbeaver/beaver/app/services/settings"
import { updateSettingsSchema } from "@zbeaver/beaver/app/validations/settings"

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleGetSettings(session: Session) {
  const perm = await requirePermission(session, "settings.manage")
  if (perm) return perm

  return adminSuccess(await getSiteSettings())
}

export async function handleUpdateSettings(session: Session, body: unknown) {
  const perm = await requirePermission(session, "settings.manage")
  if (perm) return perm

  const parsed = parseWithSchema(updateSettingsSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await updateSiteSettings(parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}
