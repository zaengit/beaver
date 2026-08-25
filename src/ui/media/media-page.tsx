
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { FileIcon, Search, ImageIcon, Copy, Trash2 } from "lucide-react"

import { adminApiGet, adminApiDelete } from "@zbeaver/beaver/ui/shared/api-client"
import { MediaUploadZone } from "@zbeaver/beaver/ui/shared/media-upload-zone"
import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import { Skeleton } from "@zbeaver/beaver/ui/components/ui/skeleton"
import { Checkbox } from "@zbeaver/beaver/ui/components/ui/checkbox"
import { adminToast } from "@zbeaver/beaver/ui/shared/toast"
import {
  AdminPageShell,
  AdminPageHeader,
} from "@zbeaver/beaver/ui/layout/page-shell"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import { safeAdminImageUrl } from "@zbeaver/beaver/ui/shared/media-url"
import type { AdminPaginationMeta } from "@zbeaver/beaver/ui/shared/data"
import {
  AdminBulkActionsBar,
  AdminListPagination,
  buildAdminListSearchParams,
  useAdminBulkActions,
  useAdminListFilters,
  useAdminListSelection,
} from "@zbeaver/beaver/ui/shared"

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
  const [data, setData] = useState<{ data: MediaItem[]; meta: AdminPaginationMeta } | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const pageParam = Number(new URLSearchParams(location.search).get("page") ?? "1")
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  const { filters, setFilter, buildPageUrl } = useAdminListFilters({
    locationSearch: location.search,
    navigate,
    path: "/admin/media",
    defaults: { search: "" },
  })
  const {
    selectedIds,
    clearSelection,
    handleSelectAll,
    handleSelectOne,
    isAllSelected,
    isSomeSelected,
  } = useAdminListSelection(data?.data ?? null)

  function fetchMedia(p?: number) {
    const currentPage = p ?? page
    const params = buildAdminListSearchParams(filters, {
      page: currentPage,
      perPage: 10,
    })
    adminApiGet<{ data: MediaItem[]; meta: AdminPaginationMeta }>(`/api/admin/media?${params.toString()}`).then((nextData) => {
      setData(nextData)
      clearSelection()
    })
  }

  const { isPending, performBulkAction } = useAdminBulkActions({
    selectedIds,
    entity: "selected media",
    successAction: "delete",
    onSuccess: fetchMedia,
  })

  useEffect(() => {
    fetchMedia()
  }, [location.search, page])

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

  function handleBulkDelete() {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} item(s)? This cannot be undone.`)) return
    void performBulkAction("/api/admin/media/bulk/delete")
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
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
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
          <AdminBulkActionsBar
            selectedCount={selectedIds.length}
            isPending={isPending}
            actions={[{ label: "Delete", onClick: handleBulkDelete, variant: "destructive" }]}
            onClear={clearSelection}
          />
        )}

        {!data ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 10 }).map((_, i) => (
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
                          src={safeAdminImageUrl(item.thumbnailUrl || item.url) ?? undefined}
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

        <AdminListPagination meta={data?.meta} getPageUrl={buildPageUrl} />
      </div>
    </AdminPageShell>
  )
}
