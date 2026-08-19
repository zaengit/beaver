import { z } from "zod"
import { adminError, adminSuccess } from "@zaenpm/beaver/app/admin/api-response"
import { mapServiceError } from "@zaenpm/beaver/app/handlers/error-mapper"
import { requireAuth } from "@zaenpm/beaver/app/handlers/guard"
import { parseWithSchema } from "@zaenpm/beaver/app/handlers/utils"
import type { Session } from "@zaenpm/beaver/app/handlers/types"
import { updateProfile } from "@zaenpm/beaver/app/services/profile"

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name must be between 1 and 100 characters.").max(100).optional(),
    email: z.string().email("Invalid email address.").optional(),
    password: z.string().min(8, "Password must be between 8 and 128 characters.").max(128).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (name, email, or password) must be provided to update.",
    path: ["_form"],
  })

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function handleUpdateProfile(session: Session, body: unknown) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const parsed = parseWithSchema(updateProfileSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await updateProfile(session!.user.id, parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}
