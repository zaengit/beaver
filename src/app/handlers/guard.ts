/**
 * Auth & permission guard helpers for handler functions.
 *
 * Every handler used to repeat:
 *   if (!session?.user) return adminUnauthorized()
 *   if (!(await can(...))) return adminError("Insufficient permissions.", 403)
 *
 * These helpers remove that boilerplate.
 */

import { adminError, adminUnauthorized } from "zadm/app/admin/api-response"
import { can, canAny } from "zadm/app/admin/permissions"
import type { Session } from "zadm/app/handlers/types"

// ---------------------------------------------------------------------------
// Auth guards
// ---------------------------------------------------------------------------

/**
 * Returns an error response if there is no authenticated session, otherwise
 * returns `null` — the caller can `return` the response directly.
 *
 * @example
 *   const auth = requireAuth(session)
 *   if (auth) return auth  // → adminUnauthorized()
 */
export function requireAuth(session: Session) {
  return session?.user ? null : adminUnauthorized()
}

// ---------------------------------------------------------------------------
// Permission guards
// ---------------------------------------------------------------------------

/**
 * Returns an error response if the user lacks **all** of the given permissions.
 * Returns `null` when authorised.
 *
 * @example
 *   const perm = await requirePermission(session, "users.manage")
 *   if (perm) return perm  // → adminError("Insufficient permissions.", 403)
 */
export async function requirePermission(session: Session, permission: string) {
  if (!session?.user) return adminUnauthorized()
  const authorised = await can(session.user.id, permission)
  return authorised ? null : adminError("Insufficient permissions.", 403)
}

/**
 * Like `requirePermission` but the user only needs **one** of the listed
 * permissions.
 *
 * @example
 *   const perm = await requireAnyPermission(session, ["users.create", "users.manage"])
 *   if (perm) return perm
 */
export async function requireAnyPermission(session: Session, permissions: string[]) {
  if (!session?.user) return adminUnauthorized()
  const authorised = await canAny(session.user.id, permissions)
  return authorised ? null : adminError("Insufficient permissions.", 403)
}
