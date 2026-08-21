import { z } from "zod"
import { adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { requireAuth } from "@zbeaver/beaver/app/handlers/guard"
import { parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { updateProfile } from "@zbeaver/beaver/app/services/profile"

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name must be between 1 and 100 characters.").max(100).optional(),
    email: z.string().max(254, "Email is too long.").email("Invalid email address.").optional(),
    password: z.string().min(12, "Password must be between 12 and 128 characters.").max(128).optional(),
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
