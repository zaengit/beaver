
import { useCallback, useEffect, useRef, useState } from "react"

import { adminApiGet } from "@zbeaver/beaver/ui/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import {
  AdminPageShell,
  AdminPageHeader
} from "@zbeaver/beaver/ui/layout/page-shell"
import { MenuBuilder, type MenuTree } from "@zbeaver/beaver/ui/menus/menu-builder"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@zbeaver/beaver/ui/components/ui/select"
import { getMenuGroupRegistry } from "@zbeaver/beaver/app/registry/menu-groups"
import { Button } from "@zbeaver/beaver/ui/components/ui/button"

interface MenuItem {
  id: string
  title: string
  url: string
  type: string
  position: number
  parentId: string | null
  cssClass: string | null
  target: string | null
  image: string | null
  status: "draft" | "published"
}

function buildMenuTree(items: MenuItem[]): MenuTree[] {
  const map = new Map<string, MenuTree>()
  const roots: MenuTree[] = []

  for (const item of items) {
    map.set(item.id, {
      id: item.id,
      title: item.title,
      url: item.url,
      position: item.position,
      cssClass: item.cssClass,
      target: item.target,
      image: item.image,
      status: item.status,
      parentId: item.parentId,
      children: [],
    })
  }

  for (const item of items) {
    const node = map.get(item.id)
    if (!node) continue

    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortTree = (nodes: MenuTree[]): MenuTree[] =>
    nodes
      .sort((left, right) => left.position - right.position)
      .map((node) => ({
        ...node,
        children: sortTree(node.children),
      }))

  return sortTree(roots)
}

export function AdminMenusPage() {
  const groups = getMenuGroupRegistry()
  const [data, setData] = useState<MenuItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [groupSlug, setGroupSlug] = useState("navbar")
  const builderRef = useRef<import("@zbeaver/beaver/ui/menus/menu-builder").MenuBuilderHandle>(null)
  const [builderStatus, setBuilderStatus] = useState({ hasChanges: false, saving: false })

  const loadMenus = useCallback(async () => {
    setError(null)
    try {
      const items = await adminApiGet<MenuItem[]>("/api/admin/menus")
      setData(items)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    loadMenus()
  }, [loadMenus])

  if (error) return <main className="p-6"><p className="text-destructive">Error: {error}</p></main>

  const groupTree = data ? buildMenuTree(data.filter((item) => item.type === groupSlug)) : null

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Menus"
        actions={<div className="flex items-center gap-2"><Select value={groupSlug} onValueChange={(value) => value && setGroupSlug(value)}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{groups.map((group) => <SelectItem key={group.type} value={group.type}>{group.label}</SelectItem>)}</SelectContent></Select><Button onClick={() => builderRef.current?.save()} disabled={!builderStatus.hasChanges || builderStatus.saving}>{builderStatus.saving ? "Saving..." : "Save Menu"}</Button></div>}
      />
      {groupTree ? <MenuBuilder key={groupSlug} ref={builderRef} type={groupSlug} initialTree={groupTree} onStatusChange={setBuilderStatus} /> : <AdminLoadingState />}
    </AdminPageShell>
  )
}
