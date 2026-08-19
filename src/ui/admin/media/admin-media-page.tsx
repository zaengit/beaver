
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { FileIcon, Search, ImageIcon, Copy, Trash2 } from "lucide-react"

import { adminApiGet, adminApiDelete, adminApiPost } from "@zaenpm/beaver/ui/admin/shared/api-client"
import { MediaUploadZone } from "@zaenpm/beaver/ui/admin/shared/media-upload-zone"
import { Button } from "@zaenpm/beaver/ui/admin/components/ui/button"
import { Input } from "@zaenpm/beaver/ui/admin/components/ui/input"
import { Skeleton } from "@zaenpm/beaver/ui/admin/components/ui/skeleton"
import { Checkbox } from "@zaenpm/beaver/ui/admin/components/ui/checkbox"
import { adminToast } from "@zaenpm/beaver/ui/admin/shared/admin-toast"
import {
  AdminPageShell,
  AdminPageHeader,
} from "@zaenpm/beaver/ui/admin/layout/admin-page-shell"
import { cn } from "@zaenpm/beaver/pkg/utils/ui"

interface MediaItem {
  id: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl: string | null
  alt: string | null
  width: number | null
  height: number | null
  folder: string | null
  createdAt: number
}

export function AdminMediaPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState<{ data: MediaItem[]; meta: { lastPage: number; currentPage: number } } | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState(
    new URLSearchParams(location.search).get("search") ?? ""
  )
  const [page, setPage] = useState(1)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function fetchMedia(p?: number) {
    const currentPage = p ?? page
    const params = new URLSearchParams(location.search)
    if (search) params.set("search", search)
    params.set("page", String(currentPage))
    params.set("perPage", "30")
    adminApiGet<{ data: MediaItem[]; meta: { lastPage: number; currentPage: number } }>(`/api/admin/media?${params.toString()}`).then(setData)
  }

  useEffect(() => {
    fetchMedia()
  }, [location.search, page])

  // ─── Live search debounce ───────────────────────────────────────────────

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search)
      if (search) {
        params.set("search", search)
      } else {
        params.delete("search")
      }
      params.delete("page")
      setPage(1)
      navigate(`/admin/media?${params.toString()}`)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    adminApiDelete(`/api/admin/media/${id}`).then((result) => {
      if (result.success) {
        adminToast.success("delete", "media")
        fetchMedia()
      } else {
        adminToast.error(result.message)
      }
    })
  }

  const isAllSelected = data != null && data.data.length > 0 && selectedIds.length === data.data.length
  const isSomeSelected = selectedIds.length > 0

  function handleSelectAll(checked: boolean) {
    if (!data?.data || data == null) return
    if (checked) {
      setSelectedIds(data.data.map((item: MediaItem) => item.id))
    } else {
      setSelectedIds([])
    }
  }

  function handleSelectOne(id: string, checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  function handleClearSelection() {
    setSelectedIds([])
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} item(s)? This cannot be undone.`)) return
    adminApiPost<{ id: string; success: boolean }[]>("/api/admin/media/bulk/delete", { ids: selectedIds }).then((result) => {
      if (result.success) {
        adminToast.success("delete", "selected media")
        setSelectedIds([])
        fetchMedia()
      } else {
        adminToast.error(result.message)
      }
    })
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => adminToast.copied("url"))
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Media"
        search={
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media…"
              className="pl-8"
            />
          </div>
        }
        actions={
          <Button type="button" size="lg" onClick={() => setShowUpload((current) => !current)}>
            {showUpload ? "Hide Upload" : "Upload"}
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {showUpload && (
          <MediaUploadZone onUploadComplete={() => { setShowUpload(false); fetchMedia() }} />
        )}

        {/* Bulk Actions */}
        {isSomeSelected && (
          <div className="flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {!data ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-sm" />
            ))}
          </div>
        ) : data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No media found.</p>
          </div>
        ) : (
          <>
            {/* Select all */}
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                aria-label="Select all media"
              />
              <span className="text-xs text-muted-foreground">
                {isAllSelected ? `${selectedIds.length} selected` : "Select all"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {data.data.map((item) => {
                const isImage = item.mimeType.startsWith("image/")
                const hasError = imageErrors.has(item.id)

                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-sm border bg-muted/30"
                  >
                    <div className="aspect-square">
                      {isImage && !hasError ? (
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.alt || item.name}
                          className="h-full w-full object-cover"
                          onError={() => setImageErrors((p) => new Set(p).add(item.id))}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-muted">
                          <FileIcon className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* Selection checkbox */}
                      <div
                        className={cn(
                          "absolute top-1.5 left-1.5 z-10",
                          !isSomeSelected && "opacity-0 group-hover:opacity-100 transition-opacity"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectOne(item.id, checked === true)}
                          aria-label={`Select ${item.name}`}
                        />
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex items-center justify-end gap-1 p-2">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleCopyUrl(item.url)}
                          className="h-8 w-8 text-white hover:bg-white/20"
                          aria-label="Copy URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="h-8 w-8 text-white hover:bg-destructive/80"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="px-2.5 py-2">
                      <p className="truncate text-xs font-medium">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.mimeType} · {formatSize(item.size)}
                        {item.width && item.height && ` · ${item.width}×${item.height}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {data && data.meta.lastPage > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.meta.currentPage} of {data.meta.lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.lastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminPageShell>
  )
}
