import { generateId, getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"
import type { CreateMenuInput, UpdateMenuInput, ReorderMenusInput } from "@zbeaver/beaver/app/validations/menus"
import {
  createMenuRecord,
  deleteMenuRecord,
  findMenuById,
  getMenuTreeRecords,
  listMenus as listMenuRecords,
  reorderMenuTree,
  updateMenuRecord,
  type MenuRow,
} from "@zbeaver/beaver/app/repositories/menus"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { getCachedPublicData, invalidatePublicDataCache } from "@zbeaver/beaver/app/cache/public-data-cache"
import { serviceSuccess, serviceNotFound } from "@zbeaver/beaver/app/services/utils"

// ─── Get Menu Tree ─────────────────────────────────────────────────────────

export function getMenuTree(type?: string): ServiceResult<unknown> {
  const tree = getCachedPublicData(`menu-tree:${type ?? "all"}`, () => getMenuTreeRecords(undefined, type))
  return serviceSuccess(tree, "OK")
}

// ─── List All Menus ────────────────────────────────────────────────────────

export function listMenus(): ServiceResult<MenuRow[]> {
  const items = listMenuRecords()
  return serviceSuccess(items, "OK")
}

// ─── Get Single Menu ───────────────────────────────────────────────────────

export function getMenu(id: string): ServiceResult<MenuRow> {
  const item = findMenuById(id)
  if (!item) return serviceNotFound("Menu")
  return serviceSuccess(item, "OK")
}

// ─── Create Menu ───────────────────────────────────────────────────────────

export function createMenu(data: CreateMenuInput): ServiceResult<MenuRow> {
  const id = generateId()
  const now = getCurrentTimestamp()

  const record = createMenuRecord({
    id,
    title: data.title,
    url: data.url,
    type: data.type,
    position: data.position ?? 0,
    cssClass: data.cssClass,
    target: data.target,
    image: data.image,
    parentId: data.parentId,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  })

  invalidatePublicDataCache()
  return serviceSuccess(record, "Menu created.")
}

// ─── Update Menu ───────────────────────────────────────────────────────────

export function updateMenu(id: string, data: UpdateMenuInput): ServiceResult<MenuRow> {
  const existing = findMenuById(id)
  if (!existing) return serviceNotFound("Menu")
  const now = getCurrentTimestamp()

  const updateData: {
    title?: string
    url?: string
    type?: string
    position?: number
    cssClass?: string | null
    target?: string | null
    image?: string | null
    parentId?: string | null
    status?: "draft" | "published"
    updatedAt: number
  } = { updatedAt: now }

  if (data.title !== undefined) updateData.title = data.title
  if (data.url !== undefined) updateData.url = data.url
  if (data.type !== undefined) updateData.type = data.type
  if (data.position !== undefined) updateData.position = data.position
  if (data.cssClass !== undefined) updateData.cssClass = data.cssClass
  if (data.target !== undefined) updateData.target = data.target
  if (data.image !== undefined) updateData.image = data.image
  if (data.parentId !== undefined) updateData.parentId = data.parentId
  if (data.status !== undefined) updateData.status = data.status

  const updated = updateMenuRecord(id, updateData)
  if (!updated) return serviceNotFound("Menu")

  invalidatePublicDataCache()
  return serviceSuccess(updated, "Menu updated.")
}

// ─── Reorder Menus ─────────────────────────────────────────────────────────

function flattenTree(
  tree: { id: string; position: number; parentId: string | null; children: { id: string; position: number; parentId: string | null; children: unknown[] }[] }[]
): { id: string; position: number; parentId: string | null }[] {
  const result: { id: string; position: number; parentId: string | null }[] = []
  for (const node of tree) {
    result.push({ id: node.id, position: node.position, parentId: node.parentId })
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children as typeof tree))
    }
  }
  return result
}

export function reorderMenus(data: ReorderMenusInput): ServiceResult<null> {
  reorderMenuTree(flattenTree(data.tree))
  invalidatePublicDataCache()
  return serviceSuccess(null, "Menus reordered.")
}

// ─── Delete Menu ───────────────────────────────────────────────────────────

export function deleteMenu(id: string): ServiceResult<null> {
  const existing = findMenuById(id)
  if (!existing) return serviceNotFound("Menu")

  deleteMenuRecord(id)
  invalidatePublicDataCache()
  return serviceSuccess(null, "Menu deleted.")
}
