import { adminError, adminSuccess } from "zadm/app/admin/api-response"
import { mapServiceError } from "zadm/app/handlers/error-mapper"
import { requirePermission } from "zadm/app/handlers/guard"
import { parseWithSchema } from "zadm/app/handlers/utils"
import type { Session } from "zadm/app/handlers/types"
import { getSiteSettings, updateSiteSettings } from "zadm/app/services/settings"
import { updateSettingsSchema } from "zadm/app/validations/settings"

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
