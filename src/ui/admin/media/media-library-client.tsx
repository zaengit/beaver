
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useNavigate } from "react-router"

import { Search, Trash2, X, FileIcon } from "lucide-react"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zbeaver/beaver/ui/admin/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zbeaver/beaver/ui/admin/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@zbeaver/beaver/ui/admin/components/ui/dialog"
import { MediaGrid, type MediaItem } from "@zbeaver/beaver/ui/admin/media/media-grid"
import { MediaUploadZone } from "@zbeaver/beaver/ui/admin/shared/media-upload-zone"
import {
  adminApiPost,
  adminApiPut,
} from "@zbeaver/beaver/ui/admin/shared/api-client"
import {
  getCurrentSearchParams,
} from "@zbeaver/beaver/ui/admin/navigation"
import { adminToast } from "@zbeaver/beaver/ui/admin/shared/admin-toast"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  path: string
  per_page: number
  to: number
  total: number
}

interface MediaLibraryClientProps {
  initialItems: MediaItem[]
  meta: PaginationMeta | null
  currentSearch?: string
  currentMimeType?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MediaLibraryClient({
  initialItems,
  meta,
  currentSearch,
  currentMimeType,
}: MediaLibraryClientProps) {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState(initialItems)
  const [paginationMeta, setPaginationMeta] = useState(meta)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)

  // Detail dialog state
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editAlt, setEditAlt] = useState("")
  const [editCaption, setEditCaption] = useState("")
  const [editFolder, setEditFolder] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Search state
  const [searchValue, setSearchValue] = useState(currentSearch ?? "")

  // ─── Live search debounce ───────────────────────────────────────────────

  const isInitialMount = useRef(true)

  useEffect(() => {
    // Skip the initial mount to avoid double navigation
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      const params = getCurrentSearchParams()
      if (searchValue) {
        params.set("search", searchValue)
      } else {
        params.delete("search")
      }
      params.delete("page")
      navigate(`/admin/media?${params.toString()}`)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Drag-over state for page-level drop
  const [isPageDragOver, setIsPageDragOver] = useState(false)

  const refreshMedia = useCallback(async () => {
    const params = getCurrentSearchParams()
    const query = params.toString()
    const response = await fetch(query ? `/api/admin/media?${query}` : "/api/admin/media", {
      credentials: "include",
    })

    if (!response.ok) {
      return
    }

    const body = await response.json()
    setItems(body.data ?? [])
    setPaginationMeta(body.meta ?? null)
    setSelectedIds([])
    setSelectionMode(false)
  }, [])

  // ─── Selection Handlers ──────────────────────────────────────────────────

  const handleSelect = useCallback((id: string) => {
    setSelectionMode(true)
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedIds([])
    setSelectionMode(false)
  }, [])

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} item(s)? This cannot be undone.`)) return

    startTransition(async () => {
      const result = await adminApiPost<{ id: string; success: boolean }[]>(
        "/api/admin/media/bulk/delete",
        { ids: selectedIds }
      )
      if (result.success) {
        adminToast.success("delete", "selected media")
        await refreshMedia()
      } else {
        adminToast.error(result.message)
      }
    })
  }, [refreshMedia, selectedIds, startTransition])

  // ─── Detail Dialog Handlers ──────────────────────────────────────────────

  const handleItemClick = useCallback((item: MediaItem) => {
    setDetailItem(item)
    setEditName(item.name)
    setEditAlt(item.alt ?? "")
    setEditCaption(item.caption ?? "")
    setEditFolder(item.folder ?? "")
  }, [])

  const handleDetailClose = useCallback(() => {
    setDetailItem(null)
  }, [])

  const handleDetailSave = useCallback(async () => {
    if (!detailItem) return
    setIsSaving(true)

    const result = await adminApiPut<MediaItem>(`/api/admin/media/${detailItem.id}`, {
      name: editName,
      alt: editAlt,
      caption: editCaption,
      folder: editFolder,
    })
    setIsSaving(false)

    if (result.success) {
      setDetailItem(null)
      adminToast.success("update", "media")
      await refreshMedia()
    } else {
      adminToast.error(result.message)
    }
  }, [detailItem, editName, editAlt, editCaption, editFolder, refreshMedia])

  // ─── Filter Handlers ─────────────────────────────────────────────────────

  const handleMimeTypeChange = useCallback(
    (value: string | null) => {
      const params = getCurrentSearchParams()
      if (value && value !== "all") {
        params.set("mimeType", value)
      } else {
        params.delete("mimeType")
      }
      params.delete("page")
      navigate(`/admin/media?${params.toString()}`)
    },
    []
  )

  // ─── Upload Handler ──────────────────────────────────────────────────────

  const handleUploadComplete = useCallback(() => {
    void refreshMedia()
  }, [refreshMedia])

  // ─── Page-level Drag & Drop ──────────────────────────────────────────────

  const handlePageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsPageDragOver(true)
  }, [])

  const handlePageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    // Only set false if leaving the container
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const { clientX, clientY } = e
    if (
      clientX <= rect.left ||
      clientX >= rect.right ||
      clientY <= rect.top ||
      clientY >= rect.bottom
    ) {
      setIsPageDragOver(false)
    }
  }, [])

  const handlePageDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsPageDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length === 0) return

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })
        const result = await response.json().catch(() => null)
        if (!response.ok || !result?.success) {
          adminToast.error(result?.message ?? `Upload failed for ${file.name}.`)
          return
        }
      }

      adminToast.uploadedMany(files.length)
      await refreshMedia()
    },
    [refreshMedia]
  )

  // ─── Pagination ──────────────────────────────────────────────────────────

  function buildPageUrl(page: number) {
    const params = getCurrentSearchParams()
    if (page > 1) {
      params.set("page", String(page))
    } else {
      params.delete("page")
    }
    return `/admin/media?${params.toString()}`
  }

  return (
    <div
      className="space-y-4"
      onDragOver={handlePageDragOver}
      onDragLeave={handlePageDragLeave}
      onDrop={handlePageDrop}
    >
      {/* Page-level drag overlay */}
      {isPageDragOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-primary/5 border-4 border-dashed border-primary/30 pointer-events-none rounded-sm">
          <div className="rounded-sm bg-background p-6 shadow-lg text-center">
            <p className="text-lg font-medium">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <MediaUploadZone
        onUploadComplete={handleUploadComplete}
        compact
      />

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by name…"
              className="pl-8"
            />
          </div>

          {/* Mime Type Filter */}
          <Select
            value={currentMimeType ?? "all"}
            onValueChange={handleMimeTypeChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="image/*">Images</SelectItem>
              <SelectItem value="video/mp4">Video</SelectItem>
              <SelectItem value="audio/mpeg">Audio</SelectItem>
              <SelectItem value="application/pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Media Grid */}
      <MediaGrid
        items={items}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onItemClick={handleItemClick}
        selectionMode={selectionMode}
      />

      {/* Pagination */}
      {paginationMeta && paginationMeta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginationMeta.from} to {paginationMeta.to} of {paginationMeta.total} items
          </p>
          <div className="flex items-center gap-2">
            {paginationMeta.current_page > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(buildPageUrl(paginationMeta.current_page - 1))}
              >
                Previous
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Page {paginationMeta.current_page} of {paginationMeta.last_page}
            </span>
            {paginationMeta.current_page < paginationMeta.last_page && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(buildPageUrl(paginationMeta.current_page + 1))}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(open) => !open && handleDetailClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>

          {detailItem && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-muted">
                {detailItem.mimeType.startsWith("image/") ? (
                  <img
                    src={detailItem.url}
                    alt={detailItem.alt || detailItem.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileIcon className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>File: {detailItem.fileName}</p>
                <p>Type: {detailItem.mimeType}</p>
                <p>Size: {formatFileSize(detailItem.size)}</p>
                {detailItem.width && detailItem.height && (
                  <p>Dimensions: {detailItem.width} × {detailItem.height}</p>
                )}
              </div>

              {/* Editable fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="detail-name">Name</Label>
                  <Input
                    id="detail-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-alt">Alt Text</Label>
                  <Input
                    id="detail-alt"
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-caption">Caption</Label>
                  <Textarea
                    id="detail-caption"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Optional caption"
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="detail-folder">Folder</Label>
                  <Input
                    id="detail-folder"
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    placeholder="Optional folder name"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleDetailSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
