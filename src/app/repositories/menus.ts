import { and, eq } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { menus } from "@zbeaver/beaver/app/db/schema"
import type { MenuRecord } from "@zbeaver/beaver/app/models/menu"
import { sanitizeText } from "@zbeaver/beaver/pkg/security/sanitize"
import { affectedRows } from "@zbeaver/beaver/app/db/query"

export type MenuRow = MenuRecord
export interface MenuTree {
  id: string
  title: string
  url: string
  position: number
  cssClass: string | null
  target: string | null
  image: string | null
  parentId: string | null
  children: MenuTree[]
}

const MAX_MENU_ROWS = 5_000

export async function findMenuById(id: string) {
  const rows = await db.select().from(menus).where(eq(menus.id, id)).limit(1).execute()
  return rows[0] as MenuRow | undefined
}

export async function listMenus(type?: string, publishedOnly = false) {
  const query = db.select().from(menus)
  const condition = type ? eq(menus.type, type) : undefined
  const where = publishedOnly ? (condition ? and(condition, eq(menus.status, "published")) : eq(menus.status, "published")) : condition
  return await (where ? query.where(where) : query).limit(MAX_MENU_ROWS).execute() as MenuRow[]
}

export async function getMenuTreeRecords(items?: MenuRow[], type?: string) {
  const rows = items ?? await listMenus(type, true)
  const map = new Map<string, MenuTree>()
  const roots: MenuTree[] = []

  for (const row of rows) {
    map.set(row.id, {
      id: row.id,
      title: row.title,
      url: row.url,
      position: row.position,
      cssClass: row.cssClass,
    target: row.target,
    image: row.image,
      parentId: row.parentId,
      children: [],
    })
  }

  for (const row of rows) {
    const node = map.get(row.id)!
    if (row.parentId && map.has(row.parentId)) {
      map.get(row.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const visited = new Set<string>()
  const MAX_RENDER_DEPTH = 50
  const sortTree = (tree: MenuTree[], depth = 0): MenuTree[] => {
    const result: MenuTree[] = []
    for (const node of [...tree].sort((a, b) => a.position - b.position)) {
      if (visited.has(node.id)) continue
      visited.add(node.id)
      result.push({
        ...node,
        children: depth < MAX_RENDER_DEPTH ? sortTree(node.children, depth + 1) : [],
      })
    }
    return result
  }

  const sortedRoots = sortTree(roots)
  // Recover orphaned/cyclic rows as additional roots instead of recursing
  // forever when older or manually edited data contains an invalid hierarchy.
  for (const node of map.values()) {
    if (!visited.has(node.id)) {
      node.parentId = null
      sortedRoots.push(...sortTree([node]))
    }
  }

  return sortedRoots
}

export async function createMenuRecord(input: {
  id: string
  title: string
  url: string
  type: string
  position: number
  cssClass?: string | null
  target?: string | null
  image?: string | null
  status?: "draft" | "published"
  parentId?: string | null
  createdAt: number
  updatedAt: number
}) {
  await db.insert(menus).values({
    id: input.id,
    title: sanitizeText(input.title),
    url: input.url,
    type: input.type,
    position: input.position,
    cssClass: input.cssClass ? sanitizeText(input.cssClass) : null,
    target: input.target ?? null,
    image: input.image ?? null,
    status: input.status ?? "published",
    parentId: input.parentId ?? null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }).execute()

  return (await findMenuById(input.id))!
}

export async function updateMenuRecord(id: string, input: {
  title?: string
  url?: string
  type?: string
  position?: number
  cssClass?: string | null
  target?: string | null
  image?: string | null
  status?: "draft" | "published"
  parentId?: string | null
  updatedAt: number
}) {
  const updateData: Record<string, unknown> = { updatedAt: input.updatedAt }
  if (input.title !== undefined) updateData.title = sanitizeText(input.title)
  if (input.url !== undefined) updateData.url = input.url
  if (input.type !== undefined) updateData.type = input.type
  if (input.position !== undefined) updateData.position = input.position
  if (input.cssClass !== undefined) updateData.cssClass = input.cssClass ? sanitizeText(input.cssClass) : null
  if (input.target !== undefined) updateData.target = input.target ?? null
  if (input.image !== undefined) updateData.image = input.image ?? null
  if (input.status !== undefined) updateData.status = input.status
  if (input.parentId !== undefined) updateData.parentId = input.parentId ?? null

  await db.update(menus).set(updateData).where(eq(menus.id, id)).execute()
  return await findMenuById(id) ?? null
}

export async function deleteMenuRecord(id: string) {
  await db.update(menus).set({ parentId: null }).where(eq(menus.parentId, id)).execute()
  const result = await db.delete(menus).where(eq(menus.id, id)).execute()
  return affectedRows(result) > 0
}

export async function reorderMenuTree(items: { id: string; position: number; parentId: string | null }[]) {
  for (const item of items) {
    await db.update(menus)
      .set({ position: item.position, parentId: item.parentId, updatedAt: Date.now() })
      .where(eq(menus.id, item.id))
      .execute()
  }
}
