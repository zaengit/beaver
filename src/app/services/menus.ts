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
  type MenuTree,
} from "@zbeaver/beaver/app/repositories/menus"
import type { ServiceResult } from "@zbeaver/beaver/pkg/types"
import { getCachedPublicData, invalidatePublicDataCache } from "@zbeaver/beaver/app/cache/public-data-cache"
import { serviceSuccess, serviceNotFound, serviceValidation } from "@zbeaver/beaver/app/services/utils"

const MAX_MENU_PARENT_DEPTH = 20

async function validateParentId(parentId: string | null | undefined, type: string, currentId?: string) {
  if (!parentId) return null
  if (parentId === currentId) return "A menu item cannot be its own parent."

  const parent = await findMenuById(parentId)
  if (!parent || parent.type !== type) return "Parent menu item was not found in this menu."

  const visited = new Set<string>(currentId ? [currentId] : [])
  let cursor: MenuRow | undefined = parent
  for (let depth = 0; cursor && depth < MAX_MENU_PARENT_DEPTH; depth += 1) {
    if (visited.has(cursor.id)) return "Menu hierarchy cannot contain a cycle."
    visited.add(cursor.id)
    if (!cursor.parentId) return null
    cursor = await findMenuById(cursor.parentId)
    if (cursor && cursor.type !== type) return "Parent menu item was not found in this menu."
  }

  return cursor ? "Menu hierarchy is too deep or contains a cycle." : null
}

// ─── Get Menu Tree ─────────────────────────────────────────────────────────

export async function getMenuTree(type?: string): Promise<ServiceResult<MenuTree[]>> {
  const tree = await getCachedPublicData(`menu-tree:${type ?? "all"}`, () => getMenuTreeRecords(undefined, type))
  return serviceSuccess(tree, "OK")
}

// ─── List All Menus ────────────────────────────────────────────────────────

export async function listMenus(): Promise<ServiceResult<MenuRow[]>> {
  const items = await listMenuRecords()
  return serviceSuccess(items, "OK")
}

// ─── Get Single Menu ───────────────────────────────────────────────────────

export async function getMenu(id: string): Promise<ServiceResult<MenuRow>> {
  const item = await findMenuById(id)
  if (!item) return serviceNotFound("Menu")
  return serviceSuccess(item, "OK")
}

// ─── Create Menu ───────────────────────────────────────────────────────────

export async function createMenu(data: CreateMenuInput): Promise<ServiceResult<MenuRow>> {
  const parentError = await validateParentId(data.parentId, data.type)
  if (parentError) return serviceValidation(parentError)

  const id = generateId()
  const now = getCurrentTimestamp()

  const record = await createMenuRecord({
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

export async function updateMenu(id: string, data: UpdateMenuInput): Promise<ServiceResult<MenuRow>> {
  const existing = await findMenuById(id)
  if (!existing) return serviceNotFound("Menu")

  const nextType = data.type ?? existing.type
  const nextParentId = data.parentId !== undefined ? data.parentId : existing.parentId
  const parentError = await validateParentId(nextParentId, nextType, id)
  if (parentError) return serviceValidation(parentError)

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

  const updated = await updateMenuRecord(id, updateData)
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

export async function reorderMenus(data: ReorderMenusInput): Promise<ServiceResult<null>> {
  const items = flattenTree(data.tree)
  const existing = await listMenuRecords(data.type)
  const existingById = new Map(existing.map((item) => [item.id, item]))
  const proposedParents = new Map(existing.map((item) => [item.id, item.parentId]))
  const seen = new Set<string>()

  for (const item of items) {
    if (seen.has(item.id)) return serviceValidation("Menu tree contains duplicate items.")
    const current = existingById.get(item.id)
    if (!current) return serviceValidation("Menu tree contains an unknown item.")
    if (item.parentId === item.id) return serviceValidation("A menu item cannot be its own parent.")
    if (item.parentId && !existingById.has(item.parentId)) return serviceValidation("Menu tree contains an unknown parent.")
    seen.add(item.id)
    proposedParents.set(item.id, item.parentId)
  }

  for (const item of existing) {
    const visited = new Set<string>()
    let cursor: string | null = item.id
    for (let depth = 0; cursor && depth < MAX_MENU_PARENT_DEPTH; depth += 1) {
      if (visited.has(cursor)) return serviceValidation("Menu hierarchy cannot contain a cycle.")
      visited.add(cursor)
      cursor = proposedParents.get(cursor) ?? null
    }
    if (cursor) return serviceValidation("Menu hierarchy is too deep or contains a cycle.")
  }

  await reorderMenuTree(items)
  invalidatePublicDataCache()
  return serviceSuccess(null, "Menus reordered.")
}

// ─── Delete Menu ───────────────────────────────────────────────────────────

export async function deleteMenu(id: string): Promise<ServiceResult<null>> {
  const existing = await findMenuById(id)
  if (!existing) return serviceNotFound("Menu")

  await deleteMenuRecord(id)
  invalidatePublicDataCache()
  return serviceSuccess(null, "Menu deleted.")
}
