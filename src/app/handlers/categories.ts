import { adminCreated, adminError, adminSuccess } from "@zbeaver/beaver/app/admin/api-response"
import { requireAuth } from "@zbeaver/beaver/app/handlers/guard"
import { mapServiceError } from "@zbeaver/beaver/app/handlers/error-mapper"
import { parseBulkIds, parseWithSchema } from "@zbeaver/beaver/app/handlers/utils"
import type { Session } from "@zbeaver/beaver/app/handlers/types"
import { can } from "@zbeaver/beaver/app/admin/permissions"
import {
  bulkDeleteCategories,
  bulkDuplicateCategories,
  bulkUpdateCategoryStatus,
  createCategoryAsync,
  deleteCategory,
  duplicateCategory,
  listCategories,
  updateCategory,
} from "@zbeaver/beaver/app/services/categories"
import { findCategoryByIdRecord } from "@zbeaver/beaver/app/repositories/categories"
import { createCategorySchema, updateCategorySchema } from "@zbeaver/beaver/app/validations/categories"
import {
  categoryPermission,
  isKnownContentType,
  type CategoryAction,
} from "@zbeaver/beaver/app/admin/content-permissions"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INSUFFICIENT = "Insufficient permissions."
const CATEGORY_NOT_FOUND = "Category not found."

async function canCategory(userId: string, type: string, action: CategoryAction) {
  return isKnownContentType(type) && can(userId, categoryPermission(type, action))
}

/** Bulk permission check for categories. */
async function guardBulkCategory(session: Session, ids: string[], action: CategoryAction) {
  const unauth = requireAuth(session)
  if (unauth) return { perm: unauth, ids }
  const parsedIds = parseBulkIds(ids)
  if (!parsedIds.success) return { perm: adminError(parsedIds.message, 400), ids }
  const allowed = await Promise.all(
    parsedIds.ids.map(async (id) => {
      const category = await findCategoryByIdRecord(id)
      return category && await canCategory(session!.user.id, category.type, action)
    }),
  )
  return allowed.every(Boolean) ? { ids } : { perm: adminError(INSUFFICIENT, 403), ids }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export async function handleListCategories(
  session: Session,
  filters?: { type?: string; search?: string; status?: "draft" | "published"; sortBy?: string; sortOrder?: string },
) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const type = filters?.type ?? "post"
  if (!(await canCategory(session!.user.id, type, "view"))) return adminError(INSUFFICIENT, 403)

  const result = await listCategories({ ...filters, type })
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleCreateCategory(session: Session, body: unknown) {
  const parsed = parseWithSchema(createCategorySchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const unauth = requireAuth(session)
  if (unauth) return unauth
  if (!(await canCategory(session!.user.id, parsed.data.type, "manage"))) return adminError(INSUFFICIENT, 403)
  if (parsed.data.status === "published" && !(await canCategory(session!.user.id, parsed.data.type, "publish")))
    return adminError(INSUFFICIENT, 403)

  const result = await createCategoryAsync(parsed.data)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleGetCategory(session: Session, id: string) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const category = await findCategoryByIdRecord(id)
  if (!category) return adminError(CATEGORY_NOT_FOUND, 404)
  if (!(await canCategory(session!.user.id, category.type, "view"))) return adminError(INSUFFICIENT, 403)

  return adminSuccess(category)
}

export async function handleUpdateCategory(session: Session, id: string, body: unknown) {
  const parsed = parseWithSchema(updateCategorySchema, body)
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors)

  const existing = await findCategoryByIdRecord(id)
  if (!existing) return adminError(CATEGORY_NOT_FOUND, 404)
  if (parsed.data.type !== undefined && parsed.data.type !== existing.type)
    return adminError("Category type cannot be changed.", 422)

  const unauth = requireAuth(session)
  if (unauth) return unauth
  if (!(await canCategory(session!.user.id, existing.type, "manage"))) return adminError(INSUFFICIENT, 403)
  if (
    parsed.data.status === "published" &&
    existing.status !== "published" &&
    !(await canCategory(session!.user.id, existing.type, "publish"))
  )
    return adminError(INSUFFICIENT, 403)
  if (
    parsed.data.status === "draft" &&
    existing.status === "published" &&
    !(await canCategory(session!.user.id, existing.type, "unpublish"))
  )
    return adminError(INSUFFICIENT, 403)

  const result = await updateCategory(id, parsed.data)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

export async function handleDuplicateCategory(session: Session, id: string) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const existing = await findCategoryByIdRecord(id)
  if (!existing || !(await canCategory(session!.user.id, existing.type, "manage")))
    return adminError(INSUFFICIENT, 403)

  const result = await duplicateCategory(id)
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result)
}

export async function handleDeleteCategory(session: Session, id: string) {
  const unauth = requireAuth(session)
  if (unauth) return unauth

  const existing = await findCategoryByIdRecord(id)
  if (!existing || !(await canCategory(session!.user.id, existing.type, "manage")))
    return adminError(INSUFFICIENT, 403)

  const result = await deleteCategory(id)
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result)
}

// ---------------------------------------------------------------------------
// Bulk handlers
// ---------------------------------------------------------------------------

export async function handleBulkDeleteCategories(session: Session, ids: string[]) {
  const { perm } = await guardBulkCategory(session, ids, "manage")
  if (perm) return perm
  const result = await bulkDeleteCategories(ids)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkDuplicateCategories(session: Session, ids: string[]) {
  const { perm } = await guardBulkCategory(session, ids, "manage")
  if (perm) return perm
  const result = await bulkDuplicateCategories(ids)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}

export async function handleBulkUpdateCategoryStatus(
  session: Session,
  ids: string[],
  status: "draft" | "published",
) {
  const action = status === "published" ? "publish" : "unpublish" as CategoryAction
  const { perm } = await guardBulkCategory(session, ids, action)
  if (perm) return perm
  const result = await bulkUpdateCategoryStatus(ids, status)
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500)
}
