
import { useState, useCallback } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, ChevronRight, ChevronDown, Pencil, Trash2, X, Check } from "lucide-react"
import { Button } from "zadm/ui/admin/components/ui/button"
import { Badge } from "zadm/ui/admin/components/ui/badge"
import { Input } from "zadm/ui/admin/components/ui/input"
import { Label } from "zadm/ui/admin/components/ui/label"
import { MediaPicker } from "zadm/ui/admin/shared/media-picker"
import { cn } from "zadm/pkg/utils/ui"
import { useAdminSession } from "zadm/ui/admin/auth/admin-session-provider"
import type { FlattenedMenuItem } from "zadm/ui/admin/menus/menu-builder"

interface SortableMenuItemProps {
  item: FlattenedMenuItem
  maxDepth: number
  onToggleCollapse: (id: string) => void
  onEdit: (id: string, data: { title: string; url: string; cssClass: string; target: string; image: string; status: "draft" | "published" }) => void
  onDelete: (id: string) => void
  onKeyAction: (id: string, action: "moveUp" | "moveDown" | "indent" | "outdent") => void
}

export function SortableMenuItem({
  item,
  maxDepth,
  onToggleCollapse,
  onEdit,
  onDelete,
  onKeyAction,
}: SortableMenuItemProps) {
  const { session } = useAdminSession()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editUrl, setEditUrl] = useState(item.url)
  const [editCssClass, setEditCssClass] = useState(item.cssClass ?? "")
  const [editTarget, setEditTarget] = useState(item.target ?? "")
  const [editImage, setEditImage] = useState(item.image ?? "")
  const [editStatus, setEditStatus] = useState(item.status)
  const canPublish = session?.permissions.includes("menus.publish") ?? false
  const canUnpublish = session?.permissions.includes("menus.unpublish") ?? false
  const canChangeStatus = editStatus === "published" ? canUnpublish : canPublish

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${item.depth * 30}px`,
  }

  const handleSaveEdit = useCallback(() => {
    onEdit(item.id, {
      title: editTitle,
      url: editUrl,
      cssClass: editCssClass,
      target: editTarget,
      image: editImage,
      status: editStatus,
    })
    setIsEditing(false)
  }, [item.id, editTitle, editUrl, editCssClass, editTarget, editImage, editStatus, onEdit])

  const handleCancelEdit = useCallback(() => {
    setEditTitle(item.title)
    setEditUrl(item.url)
    setEditCssClass(item.cssClass ?? "")
    setEditTarget(item.target ?? "")
    setEditImage(item.image ?? "")
    setEditStatus(item.status)
    setIsEditing(false)
  }, [item])

  const handleStartEdit = useCallback(() => {
    setEditTitle(item.title)
    setEditUrl(item.url)
    setEditCssClass(item.cssClass ?? "")
    setEditTarget(item.target ?? "")
    setEditImage(item.image ?? "")
    setEditStatus(item.status)
    setIsEditing(true)
  }, [item])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          onKeyAction(item.id, "moveUp")
          break
        case "ArrowDown":
          e.preventDefault()
          onKeyAction(item.id, "moveDown")
          break
        case "Tab":
          e.preventDefault()
          if (e.shiftKey) {
            onKeyAction(item.id, "outdent")
          } else {
            onKeyAction(item.id, "indent")
          }
          break
        case "Enter":
          e.preventDefault()
          handleStartEdit()
          break
        case "Delete":
          e.preventDefault()
          if (confirm("Delete this menu item?")) {
            onDelete(item.id)
          }
          break
      }
    },
    [isEditing, item.id, onKeyAction, handleStartEdit, onDelete]
  )

  const atMaxDepth = item.depth >= maxDepth - 1

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "rounded-sm border bg-background transition-shadow",
        isDragging && "opacity-50 shadow-lg",
        atMaxDepth && "border-amber-300/50"
      )}
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Menu item: ${item.title}`}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <button
          ref={setActivatorNodeRef}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Collapse/expand toggle */}
        {item.children.length > 0 ? (
          <button
            onClick={() => onToggleCollapse(item.id)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={item.collapsed ? "Expand children" : "Collapse children"}
          >
            {item.collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Title and URL */}
        <div className="flex-1 min-w-0">
          {item.image ? <img src={item.image} alt="" className="mr-2 inline-block size-8 rounded-sm object-cover" /> : null}
          <span className="font-medium text-sm">{item.title}</span>
          <span className="ml-2 text-xs text-muted-foreground truncate">
            {item.url.length > 40 ? item.url.slice(0, 40) + "…" : item.url}
          </span>
          <Badge variant={item.status === "published" ? "secondary" : "outline"} className="ml-2">
            {item.status === "published" ? "Published" : "Unpublished"}
          </Badge>
        </div>

        {/* Depth indicator */}
        {atMaxDepth && (
          <span className="text-xs text-amber-600" title="Maximum depth reached">
            Max depth
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleStartEdit}
            aria-label="Edit menu item"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm("Delete this menu item?")) {
                onDelete(item.id)
              }
            }}
            aria-label="Delete menu item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div className="border-t p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`edit-title-${item.id}`}>Title</Label>
              <Input
                id={`edit-title-${item.id}`}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
              />
            </div>
            <div className="space-y-1"><Label>Image</Label><MediaPicker value={editImage || null} onChange={(media) => setEditImage(media?.url ?? "")} accept="image/*" /></div>
            <div className="space-y-1">
              <Label htmlFor={`edit-url-${item.id}`}>URL</Label>
              <Input
                id={`edit-url-${item.id}`}
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="/url"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-css-${item.id}`}>CSS Class</Label>
              <Input
                id={`edit-css-${item.id}`}
                value={editCssClass}
                onChange={(e) => setEditCssClass(e.target.value)}
                placeholder="Optional CSS class"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-target-${item.id}`}>Target</Label>
              <Input
                id={`edit-target-${item.id}`}
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                placeholder="_blank, _self, etc."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-status-${item.id}`}>Status</Label>
              <select id={`edit-status-${item.id}`} value={editStatus} disabled={!canChangeStatus} onChange={(event) => setEditStatus(event.target.value as "draft" | "published")} className="h-9 w-full rounded-sm border bg-background px-3 text-sm disabled:opacity-60">
                <option value="published" disabled={!canPublish && editStatus !== "published"}>Published</option>
                <option value="draft" disabled={!canUnpublish && editStatus !== "draft"}>Unpublished</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
