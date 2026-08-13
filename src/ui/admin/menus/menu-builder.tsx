
import { forwardRef, useState, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import {
  adminApiDelete,
  adminApiPost,
  adminApiPut,
} from "zadm/ui/admin/shared/api-client"
import { SortableMenuItem } from "zadm/ui/admin/menus/sortable-menu-item"
import { Button } from "zadm/ui/admin/components/ui/button"
import { Input } from "zadm/ui/admin/components/ui/input"
import { Label } from "zadm/ui/admin/components/ui/label"
import { Badge } from "zadm/ui/admin/components/ui/badge"
import { adminToast } from "zadm/ui/admin/shared/admin-toast"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "zadm/ui/admin/layout/admin-form-layout"


// ─── Types ───────────────────────────────────────────────────────────────────

export interface MenuTree {
  id: string
  title: string
  url: string
  position: number
  cssClass: string | null
  target: string | null
  image: string | null
  status: "draft" | "published"
  parentId: string | null
  children: MenuTree[]
}

export interface FlattenedMenuItem {
  id: string
  parentId: string | null
  depth: number
  title: string
  url: string
  cssClass: string | null
  target: string | null
  image: string | null
  status: "draft" | "published"
  collapsed: boolean
  children: string[]
}

interface MenuBuilderProps {
  type: string
  initialTree: MenuTree[]
  onStatusChange?: (status: { hasChanges: boolean; saving: boolean }) => void
}
export interface MenuBuilderHandle { save: () => void }

// ─── Tree Utilities ──────────────────────────────────────────────────────────

function flattenTree(
  tree: MenuTree[],
  parentId: string | null = null,
  depth = 0,
  collapsedIds: Set<string> = new Set()
): FlattenedMenuItem[] {
  const result: FlattenedMenuItem[] = []

  for (const item of tree) {
    const childIds = item.children.map((c) => c.id)
    result.push({
      id: item.id,
      parentId: item.parentId ?? parentId,
      depth,
      title: item.title,
      url: item.url,
      cssClass: item.cssClass,
      target: item.target,
      image: item.image,
      status: item.status,
      collapsed: collapsedIds.has(item.id),
      children: childIds,
    })

    // Only include children if not collapsed
    if (!collapsedIds.has(item.id) && item.children.length > 0) {
      result.push(...flattenTree(item.children, item.id, depth + 1, collapsedIds))
    }
  }

  return result
}

function buildTreeFromFlat(
  items: FlattenedMenuItem[]
): { id: string; parentId: string | null; position: number; children: ReturnType<typeof buildTreeFromFlat> }[] {
  const itemMap = new Map<string, { id: string; parentId: string | null; position: number; children: ReturnType<typeof buildTreeFromFlat> }>()
  const roots: ReturnType<typeof buildTreeFromFlat> = []

  // Create nodes
  for (const item of items) {
    itemMap.set(item.id, {
      id: item.id,
      parentId: item.parentId,
      position: 0,
      children: [],
    })
  }

  // Build hierarchy
  for (const item of items) {
    const node = itemMap.get(item.id)!
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId)!.children.push(node)
    } else {
      node.parentId = null
      roots.push(node)
    }
  }

  // Assign positions
  function assignPositions(nodes: ReturnType<typeof buildTreeFromFlat>) {
    nodes.forEach((node, index) => {
      node.position = index
      assignPositions(node.children)
    })
  }
  assignPositions(roots)

  return roots
}

const MAX_DEPTH = 3
const INDENT_PX = 30

// ─── Component ───────────────────────────────────────────────────────────────

export const MenuBuilder = forwardRef<MenuBuilderHandle, MenuBuilderProps>(function MenuBuilder({ type, initialTree, onStatusChange }, ref) {
  
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [items, setItems] = useState<FlattenedMenuItem[]>(() =>
    flattenTree(initialTree, null, 0, new Set())
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const dragStartXRef = useRef<number>(0)
  const projectedDepthRef = useRef<number | null>(null)

  const sortedIds = useMemo(() => items.map((item) => item.id), [items])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // ─── Collapse/Expand ────────────────────────────────────────────────────────

  const toggleCollapse = useCallback(
    (id: string) => {
      setCollapsedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        // Rebuild flattened items with new collapsed state
        return next
      })

      // Rebuild items from current state with updated collapsed
      setItems((currentItems) => {
        // Rebuild the tree from current items, then re-flatten
        const allItems = getAllItemsIncludingCollapsed(currentItems, collapsedIds)
        const tree = buildMenuTreeFromFlat(allItems)
        const newCollapsed = new Set(collapsedIds)
        if (newCollapsed.has(id)) {
          newCollapsed.delete(id)
        } else {
          newCollapsed.add(id)
        }
        setCollapsedIds(newCollapsed)
        return flattenTreeFromItems(allItems, newCollapsed)
      })
    },
    [collapsedIds]
  )

  // ─── Drag Handlers ─────────────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
    // Store the initial X position for horizontal offset calculation
    const activatorEvent = event.activatorEvent as PointerEvent
    dragStartXRef.current = activatorEvent?.clientX ?? 0
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      // Calculate projected depth based on horizontal offset
      const delta = event.delta
      if (delta && activeId) {
        const horizontalOffset = delta.x
        const activeItem = items.find((i) => i.id === activeId)
        if (!activeItem) return

        let newDepth = activeItem.depth
        if (horizontalOffset > INDENT_PX) {
          newDepth = Math.min(activeItem.depth + 1, MAX_DEPTH - 1)
        } else if (horizontalOffset < -INDENT_PX) {
          newDepth = Math.max(activeItem.depth - 1, 0)
        }
        projectedDepthRef.current = newDepth
      }
    },
    [activeId, items]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event

      if (!over || active.id === over.id) {
        // Check if there was a horizontal offset for depth change
        if (delta && activeId) {
          const horizontalOffset = delta.x
          const activeIndex = items.findIndex((i) => i.id === activeId)
          if (activeIndex === -1) {
            setActiveId(null)
            projectedDepthRef.current = null
            return
          }

          const activeItem = items[activeIndex]

          if (horizontalOffset > INDENT_PX && activeIndex > 0) {
            // Indent: nest under previous sibling at same or higher level
            const prevItem = findPreviousSibling(items, activeIndex)
            if (prevItem && activeItem.depth < MAX_DEPTH - 1) {
              setItems((prev) => {
                const updated = [...prev]
                updated[activeIndex] = {
                  ...updated[activeIndex],
                  parentId: prevItem.id,
                  depth: activeItem.depth + 1,
                }
                // Also update children depths
                updateChildrenDepth(updated, activeIndex)
                return updated
              })
              setHasChanges(true)
            }
          } else if (horizontalOffset < -INDENT_PX && activeItem.depth > 0) {
            // Outdent: promote to parent's level
            setItems((prev) => {
              const updated = [...prev]
              const currentParentId = updated[activeIndex].parentId
              const parentItem = prev.find((i) => i.id === currentParentId)
              updated[activeIndex] = {
                ...updated[activeIndex],
                parentId: parentItem?.parentId ?? null,
                depth: Math.max(0, activeItem.depth - 1),
              }
              // Also update children depths
              updateChildrenDepth(updated, activeIndex)
              return updated
            })
            setHasChanges(true)
          }
        }

        setActiveId(null)
        projectedDepthRef.current = null
        return
      }

      // Vertical reorder
      const oldIndex = items.findIndex((i) => i.id === String(active.id))
      const newIndex = items.findIndex((i) => i.id === String(over.id))

      if (oldIndex !== -1 && newIndex !== -1) {
        setItems((prev) => {
          const moved = arrayMove(prev, oldIndex, newIndex)

          // Apply horizontal offset for depth change
          const horizontalOffset = delta?.x ?? 0
          const movedItem = moved[newIndex]

          if (horizontalOffset > INDENT_PX && newIndex > 0) {
            const prevItem = findPreviousSibling(moved, newIndex)
            if (prevItem && movedItem.depth < MAX_DEPTH - 1) {
              moved[newIndex] = {
                ...moved[newIndex],
                parentId: prevItem.id,
                depth: movedItem.depth + 1,
              }
              updateChildrenDepth(moved, newIndex)
            }
          } else if (horizontalOffset < -INDENT_PX && movedItem.depth > 0) {
            const parentItem = moved.find((i) => i.id === movedItem.parentId)
            moved[newIndex] = {
              ...moved[newIndex],
              parentId: parentItem?.parentId ?? null,
              depth: Math.max(0, movedItem.depth - 1),
            }
            updateChildrenDepth(moved, newIndex)
          } else {
            // Match the depth of the target position
            const overItem = prev[newIndex]
            if (overItem) {
              moved[newIndex] = {
                ...moved[newIndex],
                parentId: overItem.parentId,
                depth: overItem.depth,
              }
            }
          }

          return moved
        })
        setHasChanges(true)
      }

      setActiveId(null)
      projectedDepthRef.current = null
    },
    [activeId, items]
  )

  // ─── Item Actions ──────────────────────────────────────────────────────────

  const handleEdit = useCallback(
    async (id: string, data: { title: string; url: string; cssClass: string; target: string; image: string; status: "draft" | "published" }) => {
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, title: data.title, url: data.url, cssClass: data.cssClass || null, target: data.target || null, image: data.image || null, status: data.status }
            : item
        )
      )
      setHasChanges(true)
    },
    []
  )

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await adminApiDelete<null>(`/api/admin/menus/${id}`)
      if (result.success) {
        // Remove item and promote children
        setItems((prev) => {
          const deletedItem = prev.find((i) => i.id === id)
          if (!deletedItem) return prev

          const descendantIds = new Set<string>()
          const pendingParentIds = [id]

          while (pendingParentIds.length > 0) {
            const parentId = pendingParentIds.pop()!
            for (const item of prev) {
              if (item.parentId === parentId) {
                descendantIds.add(item.id)
                pendingParentIds.push(item.id)
              }
            }
          }

          return prev
            .filter((i) => i.id !== id)
            .map((item) =>
              descendantIds.has(item.id)
                ? {
                    ...item,
                    parentId: item.parentId === id ? deletedItem.parentId : item.parentId,
                    depth: Math.max(0, item.depth - 1),
                  }
                : item
            )
        })
        setHasChanges(true)
        adminToast.success("delete", "menu item")
      } else {
        adminToast.error(result.message)
      }
    },
    []
  )

  // ─── Add Item ──────────────────────────────────────────────────────────────

  const handleAddItem = useCallback(async () => {
    if (!newTitle.trim() || !newUrl.trim()) return

    setAddingItem(true)
    const result = await adminApiPost<{
      id: string
      title: string
      url: string
      cssClass: string | null
      target: string | null
    }>("/api/admin/menus", {
      title: newTitle.trim(),
      url: newUrl.trim(),
      type,
      position: items.filter((i) => i.parentId === null).length,
    })
    if (result.success) {
      const newItem: FlattenedMenuItem = {
        id: result.data.id,
        parentId: null,
        depth: 0,
        title: result.data.title,
        url: result.data.url,
        cssClass: result.data.cssClass ?? null,
        target: result.data.target ?? null,
        image: null,
        status: "published",
        collapsed: false,
        children: [],
      }
      setItems((prev) => [...prev, newItem])
      setNewTitle("")
      setNewUrl("")
      adminToast.success("create", "menu item")
    } else {
      adminToast.error(result.message)
    }
    setAddingItem(false)
  }, [newTitle, newUrl, type, items])

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true)

    // First, persist any inline edits via updateMenuAction
    const allItems = getAllItemsIncludingCollapsed(items, collapsedIds)

    // Build tree structure for reorder
    const tree = buildTreeFromFlat(allItems)
    const result = await adminApiPost<null>("/api/admin/menus/reorder", {
      type,
      tree,
    })

    if (result.success) {
      // Also update any edited fields
      for (const item of allItems) {
        await adminApiPut(`/api/admin/menus/${item.id}`, {
          title: item.title,
          url: item.url,
          cssClass: item.cssClass ?? "",
          target: item.target ?? "",
          image: item.image ?? "",
          status: item.status,
          parentId: item.parentId,
          type,
        })
      }
      setHasChanges(false)
      adminToast.saved("menu")
    } else {
      adminToast.error(result.message)
    }

    setSaving(false)
  }, [items, collapsedIds, type])

  // ─── Keyboard Accessibility ────────────────────────────────────────────────

  const handleKeyAction = useCallback(
    (id: string, action: "moveUp" | "moveDown" | "indent" | "outdent") => {
      const index = items.findIndex((i) => i.id === id)
      if (index === -1) return

      setItems((prev) => {
        const updated = [...prev]
        const item = updated[index]

        switch (action) {
          case "moveUp":
            if (index > 0) {
              return arrayMove(updated, index, index - 1)
            }
            break
          case "moveDown":
            if (index < updated.length - 1) {
              return arrayMove(updated, index, index + 1)
            }
            break
          case "indent": {
            const prevSibling = findPreviousSibling(updated, index)
            if (prevSibling && item.depth < MAX_DEPTH - 1) {
              updated[index] = {
                ...item,
                parentId: prevSibling.id,
                depth: item.depth + 1,
              }
              updateChildrenDepth(updated, index)
            }
            break
          }
          case "outdent": {
            if (item.depth > 0) {
              const parentItem = updated.find((i) => i.id === item.parentId)
              updated[index] = {
                ...item,
                parentId: parentItem?.parentId ?? null,
                depth: item.depth - 1,
              }
              updateChildrenDepth(updated, index)
            }
            break
          }
        }
        return updated
      })
      setHasChanges(true)
    },
    [items]
  )

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null
  useEffect(() => onStatusChange?.({ hasChanges, saving }), [hasChanges, saving, onStatusChange])
  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave])

  return (
    <div className="space-y-4">
      {/* Header with save button and unsaved indicator */}
      {hasChanges && (
      <div className="flex items-center gap-3 px-4">
          <Badge variant="secondary" className="animate-pulse">
            Unsaved changes
          </Badge>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Menu"}
          </Button>
      </div>
      )}

      <AdminFormLayout>
        <AdminFormMain>
          <AdminFormCard title="Menu items" description="Drag items to reorder. Drag right to nest, or left to outdent.">
      {/* Menu tree */}
      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No menu items yet. Add your first item from the panel.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2" role="list" aria-label="Menu items">
              {items.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  maxDepth={MAX_DEPTH}
                  onToggleCollapse={toggleCollapse}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onKeyAction={handleKeyAction}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? (
              <div className="rounded-sm border bg-background p-3 shadow-lg opacity-90">
                <span className="font-medium">{activeItem.title}</span>
                <span className="ml-2 text-xs text-muted-foreground truncate">{activeItem.url}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
          </AdminFormCard>
        </AdminFormMain>
        <AdminFormSidebar>
          <AdminFormCard title="Add menu item" description="New items are added to the top level.">
          <div className="space-y-1.5">
            <Label htmlFor="new-title">Title</Label>
            <Input
              id="new-title"
              placeholder="Menu item title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem()
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-url">URL</Label>
            <Input
              id="new-url"
              placeholder="/page-url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem()
              }}
            />
          </div>
          <Button className="w-full" onClick={handleAddItem} disabled={addingItem || !newTitle.trim() || !newUrl.trim()}>
            {addingItem ? "Adding..." : "Add"}
          </Button>
          </AdminFormCard>
        </AdminFormSidebar>
      </AdminFormLayout>
    </div>
  )
})

// ─── Helper Functions ────────────────────────────────────────────────────────

function findPreviousSibling(
  items: FlattenedMenuItem[],
  index: number
): FlattenedMenuItem | null {
  if (index <= 0) return null
  const item = items[index]
  // Look backwards for an item at the same depth or shallower
  for (let i = index - 1; i >= 0; i--) {
    if (items[i].depth <= item.depth) {
      return items[i]
    }
  }
  return null
}

function updateChildrenDepth(items: FlattenedMenuItem[], parentIndex: number) {
  const parentItem = items[parentIndex]
  const parentId = parentItem.id
  const parentDepth = parentItem.depth

  for (let i = parentIndex + 1; i < items.length; i++) {
    if (items[i].parentId === parentId) {
      items[i] = { ...items[i], depth: parentDepth + 1 }
      // Recursively update grandchildren
      updateChildrenDepth(items, i)
    } else if (items[i].depth <= parentDepth) {
      break
    }
  }
}

function getAllItemsIncludingCollapsed(
  visibleItems: FlattenedMenuItem[],
  _collapsedIds: Set<string>
): FlattenedMenuItem[] {
  // For now, since we track all items in state (collapsed items are just hidden from render),
  // we return the visible items. In a more complex implementation, we'd track hidden items separately.
  return visibleItems
}

function buildMenuTreeFromFlat(items: FlattenedMenuItem[]): MenuTree[] {
  const itemMap = new Map<string, MenuTree>()
  const roots: MenuTree[] = []

  for (const item of items) {
    itemMap.set(item.id, {
      id: item.id,
      title: item.title,
      url: item.url,
      position: 0,
      cssClass: item.cssClass,
      target: item.target,
      image: item.image,
      status: item.status,
      parentId: item.parentId,
      children: [],
    })
  }

  for (const item of items) {
    const node = itemMap.get(item.id)!
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function flattenTreeFromItems(
  allItems: FlattenedMenuItem[],
  collapsedIds: Set<string>
): FlattenedMenuItem[] {
  // Build tree from all items, then flatten respecting collapsed state
  const tree = buildMenuTreeFromFlat(allItems)
  return flattenTree(tree, null, 0, collapsedIds)
}
