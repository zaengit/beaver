import { generateId, getCurrentTimestamp, slugify } from "@zaenpm/beaver/pkg/utils/index"
import type { CreateCategoryInput, UpdateCategoryInput } from "@zaenpm/beaver/app/validations/categories"
import {
  findCategoryByIdRecord,
  listCategoryRecords,
  categorySlugExistsRecord,
  createCategoryRecord,
  updateCategoryRecord,
  deleteCategoryRecord,
  type CategoryRow,
} from "@zaenpm/beaver/app/repositories/categories"
import type { ServiceResult } from "@zaenpm/beaver/pkg/types"
import { serviceSuccess, serviceNotFound } from "@zaenpm/beaver/app/services/utils"

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  let slug = slugify(name)
  if (!slug) slug = "category"

  if (categorySlugExistsRecord(slug, excludeId)) {
    let counter = 1
    while (categorySlugExistsRecord(`${slug}-${counter}`, excludeId)) {
      counter++
    }
    slug = `${slug}-${counter}`
  }

  return slug
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCategoryAsync(
  data: CreateCategoryInput,
): Promise<ServiceResult<CategoryRow>> {
  const id = generateId()
  const now = getCurrentTimestamp()
  const slug = await generateUniqueSlug(data.name)

  const created = createCategoryRecord({
    id,
    name: data.name,
    slug,
    type: data.type ?? "category",
    description: data.description ?? null,
    image: data.image ?? null,
    status: data.status ?? "published",
    createdAt: now,
    updatedAt: now,
  })

  return serviceSuccess(created, "Category created.")
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
): Promise<ServiceResult<CategoryRow>> {
  const existing = findCategoryByIdRecord(id)
  if (!existing) return serviceNotFound("Category")
  const now = getCurrentTimestamp()
  const updateData: {
    name?: string
    slug?: string
    type?: string
    description?: string | null
    image?: string | null
    status?: "draft" | "published"
    updatedAt: number
  } = { updatedAt: now }

  if (data.name !== undefined) updateData.name = data.name
  if (data.type !== undefined) updateData.type = data.type
  if (data.description !== undefined) updateData.description = data.description
  if (data.image !== undefined) updateData.image = data.image
  if (data.status !== undefined) updateData.status = data.status

  if (data.name !== undefined && data.name !== existing.name) {
    updateData.slug = await generateUniqueSlug(data.name, id)
  }

  const updated = updateCategoryRecord(id, updateData)
  if (!updated) return serviceNotFound("Category")

  return serviceSuccess(updated, "Category updated.")
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function deleteCategory(id: string): ServiceResult<null> {
  const existing = findCategoryByIdRecord(id)
  if (!existing) return serviceNotFound("Category")

  deleteCategoryRecord(id)
  return serviceSuccess(null, "Category deleted.")
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export function duplicateCategory(id: string): ServiceResult<CategoryRow> {
  const existing = findCategoryByIdRecord(id)
  if (!existing) return serviceNotFound("Category")

  const newId = generateId()
  const now = getCurrentTimestamp()
  const newSlug = `${existing.slug}-copy`

  // Ensure slug uniqueness
  let finalSlug = newSlug
  if (categorySlugExistsRecord(finalSlug)) {
    const ts = now.toString(36).slice(-4)
    finalSlug = `${newSlug}-${ts}`
  }

  try {
    const created = createCategoryRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      slug: finalSlug,
      type: existing.type,
      description: existing.description,
      image: existing.image,
      status: existing.status as "draft" | "published",
      createdAt: now,
      updatedAt: now,
    })
    return serviceSuccess(created, "Category duplicated.")
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate category." } }
  }
}

// ─── Bulk Operations ──────────────────────────────────────────────────────────

export function bulkDeleteCategories(ids: string[]): ServiceResult<{ id: string; success: boolean }[]> {
  const results: { id: string; success: boolean }[] = []
  for (const id of ids) {
    const existing = findCategoryByIdRecord(id)
    if (!existing) {
      results.push({ id, success: false })
      continue
    }
    try {
      deleteCategoryRecord(id)
      results.push({ id, success: true })
    } catch {
      results.push({ id, success: false })
    }
  }
  return serviceSuccess(results, "Bulk delete completed.")
}

export function bulkDuplicateCategories(ids: string[]): ServiceResult<{ id: string; success: boolean; newId?: string }[]> {
  const results: { id: string; success: boolean; newId?: string }[] = []
  for (const id of ids) {
    const result = duplicateCategory(id)
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id })
    } else {
      results.push({ id, success: false })
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.")
}

export function bulkUpdateCategoryStatus(ids: string[], status: "draft" | "published"): ServiceResult<{ id: string; success: boolean }[]> {
  const now = getCurrentTimestamp()
  const results = ids.map((id) => {
    const updated = updateCategoryRecord(id, { status, updatedAt: now })
    return { id, success: updated !== null }
  })
  return serviceSuccess(results, `Categories ${status === "published" ? "published" : "unpublished"}.`)
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function listCategories(filters?: { type?: string; search?: string; sortBy?: string; sortOrder?: string }): ServiceResult<CategoryRow[]> {
  const items = listCategoryRecords(filters)
  return serviceSuccess(items, "Categories retrieved.")
}
