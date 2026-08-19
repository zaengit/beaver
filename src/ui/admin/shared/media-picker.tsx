
import { useState, useEffect, useRef } from "react"
import { ImageIcon, Search, Check, X, FileIcon } from "lucide-react"
import { Button } from "@zaenpm/beaver/ui/admin/components/ui/button"
import { Input } from "@zaenpm/beaver/ui/admin/components/ui/input"
import { Label } from "@zaenpm/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zaenpm/beaver/ui/admin/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zaenpm/beaver/ui/admin/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@zaenpm/beaver/ui/admin/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@zaenpm/beaver/ui/admin/components/ui/tabs"
import { adminApiGet } from "@zaenpm/beaver/ui/admin/shared/api-client"
import { MediaUploadZone } from "@zaenpm/beaver/ui/admin/shared/media-upload-zone"
import { Skeleton } from "@zaenpm/beaver/ui/admin/components/ui/skeleton"
import { cn } from "@zaenpm/beaver/pkg/utils/ui"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediaPickerMedia {
  id: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl: string | null
  alt: string | null
  caption: string | null
  width: number | null
  height: number | null
  folder: string | null
  createdAt: number
  updatedAt: number
}

export interface MediaPickerProps {
  value?: string | null
  onChange: (media: MediaPickerMedia | null) => void
  onSelect?: (media: MediaPickerMedia[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  trigger?: React.ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MediaPicker({
  value,
  onChange,
  onSelect,
  accept,
  multiple = false,
  maxFiles = 10,
  trigger,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            trigger as React.ReactElement
          ) : (
            <Button type="button" variant="outline" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              {value ? "Change Media" : "Select Media"}
            </Button>
          )
        }
      />
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(media) => {
          if (multiple) {
            onSelect?.(media)
            if (media.length > 0) onChange(media[0])
          } else if (media.length > 0) {
            onChange(media[0])
          }
          setOpen(false)
        }}
        accept={accept}
        multiple={multiple}
        maxFiles={maxFiles}
      />
    </Dialog>
  )
}

// ─── Dialog Content ──────────────────────────────────────────────────────────

interface MediaPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: MediaPickerMedia[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
}

function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  accept,
  multiple = false,
  maxFiles = 10,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaPickerMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [mimeFilter, setMimeFilter] = useState(accept ?? "all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItems, setSelectedItems] = useState<MediaPickerMedia[]>([])
  const [activeTab, setActiveTab] = useState("library")

  // Fetch media when dialog opens or filters change
  useEffect(() => {
    if (!open) return
    fetchMedia()
  }, [open, debouncedSearch, mimeFilter, page])

  // ─── Live search debounce ───────────────────────────────────────────────

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedItems([])
      setActiveTab("library")
      setPage(1)
    }
  }, [open])

async function fetchMedia() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set("search", debouncedSearch)
      params.set("page", String(page))
      params.set("perPage", "24")
      if (mimeFilter && mimeFilter !== "all") {
        params.set("mimeType", mimeFilter)
      }

      const result = await adminApiGet<{
        data: MediaPickerMedia[]
        meta: { lastPage: number }
      }>(`/api/admin/media?${params.toString()}`)

      setItems(result.data)
      setTotalPages(result.meta.lastPage ?? 1)
    } catch {
      setItems([])
      setTotalPages(1)
    }
    setLoading(false)
  }

  function handleItemSelect(item: MediaPickerMedia) {
    if (multiple) {
      setSelectedItems((prev) => {
        const exists = prev.find((i) => i.id === item.id)
        if (exists) {
          return prev.filter((i) => i.id !== item.id)
        }
        if (prev.length >= maxFiles) return prev
        return [...prev, item]
      })
    } else {
      setSelectedItems([item])
    }
  }

  function handleInsert() {
    onSelect(selectedItems)
  }

  function handleUploadComplete(media: MediaPickerMedia) {
    // Auto-select the uploaded file
    if (multiple) {
      setSelectedItems((prev) => {
        if (prev.length >= maxFiles) return prev
        return [...prev, media]
      })
    } else {
      setSelectedItems([media])
    }
    // Switch to library tab and refresh
    setActiveTab("library")
    fetchMedia()
  }

  return (
    <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>
          {multiple ? "Select Media" : "Select Media"}
        </DialogTitle>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
        <TabsList>
          <TabsTrigger value="library">Media Library</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        {/* Library Tab */}
        <TabsContent value="library" className="flex-1 overflow-hidden flex flex-col mt-3">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-8 h-8"
              />
            </div>
            {!accept && (
              <Select value={mimeFilter} onValueChange={(val) => { if (val) { setMimeFilter(val); setPage(1); } }}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="image/*">Images</SelectItem>
                  <SelectItem value="video/mp4">Video</SelectItem>
                  <SelectItem value="application/pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="aspect-square w-full rounded-sm" />
                  ))}
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileIcon className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No media found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {items.map((item) => {
                  const isSelected = selectedItems.some((s) => s.id === item.id)
                  return (
                    <PickerGridItem
                      key={item.id}
                      item={item}
                      isSelected={isSelected}
                      onClick={() => handleItemSelect(item)}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 border-t mt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-3">
          <MediaUploadZone
            onUploadComplete={handleUploadComplete}
            accept={accept}
          />
        </TabsContent>
      </Tabs>

      {/* Selected Preview & Insert */}
      {selectedItems.length > 0 && (
        <div className="border-t pt-3 mt-2">
          {!multiple && selectedItems.length === 1 && (
            <SelectedPreview item={selectedItems[0]} />
          )}
          {multiple && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="relative h-10 w-10 rounded-sm border overflow-hidden"
                >
                  {item.mimeType.startsWith("image/") ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.alt || item.name}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedItems((prev) =>
                        prev.filter((i) => i.id !== item.id)
                      )
                    }
                    className="absolute -top-1 -right-1 rounded-sm bg-destructive p-0.5 text-destructive-foreground"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
              <span className="text-xs text-muted-foreground">
                {selectedItems.length} selected
                {maxFiles && ` (max ${maxFiles})`}
              </span>
            </div>
          )}
        </div>
      )}

      <DialogFooter>
        <Button
          onClick={handleInsert}
          disabled={selectedItems.length === 0}
        >
          {multiple
            ? `Insert Selected (${selectedItems.length})`
            : "Insert"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// ─── Picker Grid Item ────────────────────────────────────────────────────────

function PickerGridItem({
  item,
  isSelected,
  onClick,
}: {
  item: MediaPickerMedia
  isSelected: boolean
  onClick: () => void
}) {
  const [imageError, setImageError] = useState(false)
  const isImage = item.mimeType.startsWith("image/")

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative aspect-square overflow-hidden rounded-sm border transition-all",
        "hover:ring-2 hover:ring-primary/50",
        isSelected && "ring-2 ring-primary"
      )}
      aria-label={item.name}
      aria-selected={isSelected}
    >
      {isImage && !imageError ? (
        <img
          src={item.thumbnailUrl || item.url}
          alt={item.alt || item.name}
          className="object-cover h-full w-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted">
          <FileIcon className="h-6 w-6 text-muted-foreground/60" />
        </div>
      )}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
          <div className="rounded-sm bg-primary p-1">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
        <p className="truncate text-[9px] text-white">{item.name}</p>
      </div>
    </button>
  )
}

// ─── Selected Preview ────────────────────────────────────────────────────────

function SelectedPreview({ item }: { item: MediaPickerMedia }) {
  return (
    <div className="flex gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border bg-muted">
        {item.mimeType.startsWith("image/") ? (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.alt || item.name}
            className="object-cover h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileIcon className="h-6 w-6 text-muted-foreground/60" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.mimeType} · {formatFileSize(item.size)}
          {item.width && item.height && ` · ${item.width}×${item.height}`}
        </p>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
