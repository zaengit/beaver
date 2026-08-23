import { adminCreated, adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { requirePermission, requireAnyPermission } from "@zbeaver/beaver/app/handlers/guard"
import { parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { can } from "@zbeaver/beaver/app/admin/permissions"
import { createMenu, deleteMenu, getMenu, listMenus, updateMenu, reorderMenus } from "@zbeaver/beaver/app/services/menus"
import { createMenuSchema, reorderMenusSchema, updateMenuSchema } from "@zbeaver/beaver/app/validations/menus"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MENU_EDIT_PERMS = ["menus.edit", "menus.manage"]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleListMenus(session: Session) {
  const perm = await requirePermission(session, "menus.view")
  if (perm) return perm

  const result = await listMenus()
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleCreateMenu(session: Session, body: unknown) {
  const perm = await requirePermission(session, "menus.create")
  if (perm) return perm

  const parsed = parseWithSchema(createMenuSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)
  if (parsed.data.status === "published" && !(await can(session!.user.id, "menus.publish"))) return adminError("Insufficient permissions.", 403)

  const result = await createMenu(parsed.data)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleGetMenu(session: Session, id: string) {
  const perm = await requirePermission(session, "menus.view")
  if (perm) return perm

  const result = await getMenu(id)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404)
}

export async function handleUpdateMenu(session: Session, id: string, body: unknown) {
  const perm = await requireAnyPermission(session, MENU_EDIT_PERMS)
  if (perm) return perm

  const parsed = parseWithSchema(updateMenuSchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const existing = await getMenu(id)
  if (!existing.success) return adminError(existing.error.message, 404)
  if (parsed.data.status === "published" && existing.data.status !== "published" && !(await can(session!.user.id, "menus.publish"))) return adminError("Insufficient permissions.", 403)
  if (parsed.data.status === "draft" && existing.data.status === "published" && !(await can(session!.user.id, "menus.unpublish"))) return adminError("Insufficient permissions.", 403)

  const result = await updateMenu(id, parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDeleteMenu(session: Session, id: string) {
  const perm = await requirePermission(session, "menus.delete")
  if (perm) return perm

  const result = await deleteMenu(id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleReorderMenus(session: Session, body: unknown) {
  const perm = await requireAnyPermission(session, MENU_EDIT_PERMS)
  if (perm) return perm

  const parsed = parseWithSchema(reorderMenusSchema, body, "Invalid reorder data.")
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const result = await reorderMenus(parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}
