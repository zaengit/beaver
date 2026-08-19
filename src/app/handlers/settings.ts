import { adminError, adminSuccess } from "@zaenpm/beaver/app/admin/api-response"
import { mapServiceError } from "@zaenpm/beaver/app/handlers/error-mapper"
import { requirePermission } from "@zaenpm/beaver/app/handlers/guard"
import { parseWithSchema } from "@zaenpm/beaver/app/handlers/utils"
import type { Session } from "@zaenpm/beaver/app/handlers/types"
import { getSiteSettings, updateSiteSettings } from "@zaenpm/beaver/app/services/settings"
import { updateSettingsSchema } from "@zaenpm/beaver/app/validations/settings"

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export function handleGetSettings() {
  return adminSuccess(getSiteSettings())
}

export async function handleUpdateSettings(session: Session, body: unknown) {
  const perm = await requirePermission(session, "settings.manage")
  if (perm) return perm

  const parsed = parseWithSchema(updateSettingsSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = updateSiteSettings(parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}
