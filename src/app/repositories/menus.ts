import { and, eq } from "drizzle-orm"

import { db } from "@zaenpm/beaver/app/db"
import { menus } from "@zaenpm/beaver/app/db/schema"
import type { MenuRecord } from "@zaenpm/beaver/app/models/menu"
import { sanitizeText } from "@zaenpm/beaver/pkg/security/sanitize"

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

export function findMenuById(id: string) {
  return db.select().from(menus).where(eq(menus.id, id)).get() as MenuRow | undefined
}

export function listMenus(type?: string, publishedOnly = false) {
  const query = db.select().from(menus)
  const condition = type ? eq(menus.type, type) : undefined
  const where = publishedOnly ? (condition ? and(condition, eq(menus.status, "published")) : eq(menus.status, "published")) : condition
  return (where ? query.where(where) : query).all() as MenuRow[]
}

export function getMenuTreeRecords(items?: MenuRow[], type?: string) {
  const rows = items ?? listMenus(type, true)
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

  const sortTree = (tree: MenuTree[]): MenuTree[] =>
    tree.sort((a, b) => a.position - b.position).map((node) => ({
      ...node,
      children: sortTree(node.children),
    }))

  return sortTree(roots)
}

export function createMenuRecord(input: {
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
  db.insert(menus).values({
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
  }).run()

  return findMenuById(input.id)!
}

export function updateMenuRecord(id: string, input: {
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

  db.update(menus).set(updateData).where(eq(menus.id, id)).run()
  return findMenuById(id) ?? null
}

export function deleteMenuRecord(id: string) {
  db.update(menus).set({ parentId: null }).where(eq(menus.parentId, id)).run()
  return db.delete(menus).where(eq(menus.id, id)).run().changes > 0
}

export function reorderMenuTree(items: { id: string; position: number; parentId: string | null }[]) {
  for (const item of items) {
    db.update(menus)
      .set({ position: item.position, parentId: item.parentId, updatedAt: Date.now() })
      .where(eq(menus.id, item.id))
      .run()
  }
}
