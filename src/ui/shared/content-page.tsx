import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router"

import { useAdminSession } from "@zbeaver/beaver/ui/auth/session-provider"
import { adminApiDelete, adminApiGet, adminApiPost } from "@zbeaver/beaver/ui/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import {
  AdminPageHeader,
  AdminPageShell,
} from "@zbeaver/beaver/ui/layout/page-shell"
import { Badge } from "@zbeaver/beaver/ui/components/ui/badge"
import { Button, buttonVariants } from "@zbeaver/beaver/ui/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@zbeaver/beaver/ui/components/ui/dialog"
import { adminToast } from "@zbeaver/beaver/ui/shared/toast"
import type { AdminPostListResponse } from "@zbeaver/beaver/ui/shared/data"
import { safeAdminImageUrl } from "@zbeaver/beaver/ui/shared/media-url"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import { toDateMilliseconds } from "@zbeaver/beaver/pkg/utils/time"
import {
  AdminBulkActionsBar,
  AdminErrorState,
  AdminListPagination,
  AdminSelectableTable,
  AdminStatusFilter,
  buildAdminListSearchParams,
  getAdminListPage,
  useAdminBulkActions,
  useAdminListFilters,
  useAdminListSelection,
} from "@zbeaver/beaver/ui/shared"

export interface AdminContentListPageProps {
  contentType?: string
  pageTitle?: string
  createMode?: "link" | "dialog"
}

export function AdminContentListPage({
  contentType,
  pageTitle,
  createMode = "link",
}: AdminContentListPageProps) {
  const [data, setData] = useState<AdminPostListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState("")
  const [createTitleError, setCreateTitleError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingItemAction, setPendingItemAction] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { type: routeType } = useParams()
  const { session } = useAdminSession()
  const queryTrash = new URLSearchParams(location.search).get("trash")
  const isTrashView = queryTrash === "1" || queryTrash === "true"
  const canAccessTrash = session?.permissions.some((permission) => (
    permission.startsWith("content.")
    && (permission.endsWith(".delete") || permission.endsWith(".delete-own"))
  )) ?? false
  const type = contentType ?? routeType ?? (isTrashView ? undefined : "post")
  const isPageList = type === "page"
  const contentPath = contentType || routeType ? `/admin/posts/${type}` : "/admin/posts"
  const resourceName = isPageList ? "page" : type ?? "content"
  const toastEntity = isPageList ? "page" : "post"
  const {
    filters,
    setFilter,
    handleSort,
    handleKeyDown,
    buildPageUrl,
  } = useAdminListFilters({
    locationSearch: location.search,
    navigate,
    path: contentPath,
    defaults: { search: "", status: "all", trash: "", sortBy: "", sortOrder: "" },
    debounceKeys: ["search", "status", "trash"],
  })
  const {
    selectedIds,
    clearSelection,
    handleSelectAll,
    handleSelectOne,
    isAllSelected,
    isSomeSelected,
  } = useAdminListSelection(data?.data ?? null)

  async function loadContent() {
    setError(null)
    const params = buildAdminListSearchParams(filters, {
      page: getAdminListPage(location.search),
      ...(type ? { type } : {}),
    })
    const query = params.toString()
    const nextData = await adminApiGet<AdminPostListResponse>(
      `/api/admin/posts${query ? `?${query}` : ""}`
    )
    setData(nextData)
    clearSelection()
  }

  const { isPending, performBulkAction } = useAdminBulkActions({
    selectedIds,
    entity: toastEntity,
    onSuccess: loadContent,
  })

  useEffect(() => {
    if (isTrashView && !canAccessTrash) return
    loadContent().catch((requestError) => setError(requestError.message))
  }, [location.search, isTrashView, canAccessTrash, type])

  function handleCreateDialogChange(open: boolean) {
    setIsCreateDialogOpen(open)
    if (!open) {
      setCreateTitle("")
      setCreateTitleError(null)
    }
  }

  async function handleCreatePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = createTitle.trim()

    if (!title) {
      setCreateTitleError("Title is required.")
      return
    }

    setCreateTitleError(null)
    setIsCreating(true)
    const result = await adminApiPost<{ id: string }>("/api/admin/posts", {
      title,
      type,
      status: "draft",
    })
    setIsCreating(false)

    if (result.success) {
      adminToast.success("create", toastEntity)
      navigate(`${contentPath}/${result.data.id}/edit`)
      return
    }

    setCreateTitleError(result.errors?.title?.[0] ?? result.message)
    adminToast.error(result.message)
  }

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Move ${selectedIds.length} ${resourceName}(s) to trash?`)) return
    await performBulkAction("/api/admin/posts/bulk/delete")
  }, [performBulkAction, resourceName, selectedIds])

  const handleBulkRestore = useCallback(async () => {
    if (selectedIds.length === 0) return
    await performBulkAction("/api/admin/posts/bulk/restore")
  }, [performBulkAction, selectedIds.length])

  const handleBulkPermanentDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Permanently delete ${selectedIds.length} ${resourceName}(s)? This action cannot be undone.`)) return
    await performBulkAction("/api/admin/posts/bulk/permanent-delete")
  }, [performBulkAction, resourceName, selectedIds.length])

  async function handleRestore(id: string) {
    if (pendingItemAction) return
    setPendingItemAction(`restore:${id}`)
    const result = await adminApiPost<unknown>(`/api/admin/posts/${id}/restore`)
    setPendingItemAction(null)
    if (!result.success) {
      adminToast.error(result.message)
      return
    }
    adminToast.message("Content restored.")
    await loadContent()
  }

  async function handlePermanentDelete(id: string, title: string) {
    if (pendingItemAction) return
    if (!confirm(`Permanently delete “${title}”? This action cannot be undone.`)) return
    setPendingItemAction(`delete:${id}`)
    const result = await adminApiDelete<unknown>(`/api/admin/posts/${id}/permanent-delete`)
    setPendingItemAction(null)
    if (!result.success) {
      adminToast.error(result.message)
      return
    }
    adminToast.message("Content permanently deleted.")
    await loadContent()
  }

  const handleBulkPublish = useCallback(async () => {
    await performBulkAction("/api/admin/posts/bulk/publish")
  }, [performBulkAction])

  const handleBulkUnpublish = useCallback(async () => {
    await performBulkAction("/api/admin/posts/bulk/unpublish")
  }, [performBulkAction])

  const handleBulkDuplicate = useCallback(async () => {
    await performBulkAction("/api/admin/posts/bulk/duplicate")
  }, [performBulkAction])

  if (error) return <AdminErrorState message={error} />
  if (isTrashView && !canAccessTrash) return <Navigate to="/admin/403" replace />
  if (!data) return <AdminLoadingState />

  const contentItems = data.data ?? []
  const title = isTrashView ? "Trash" : pageTitle ?? (isPageList ? "Pages" : "Posts")
  const emptyMessage = isTrashView ? "Trash is empty." : isPageList ? "No pages found." : "No content found."

  function handleStatusFilterChange(value: string) {
    if (value === "trash") {
      setFilter("status", "all")
      setFilter("trash", "true")
      return
    }

    setFilter("status", value)
    setFilter("trash", "")
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={title}
        search={
          <Input
            placeholder="Search by title..."
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
          />
        }
          actions={!isTrashView ? (
            createMode === "dialog" ? (
            <Button type="button" size="lg" onClick={() => setIsCreateDialogOpen(true)}>
              New {resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}
            </Button>
          ) : (
            <Link to={`${contentPath}/new`} className={cn(buttonVariants({ size: "lg" }))}>
              New {resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}
            </Link>
          )
          ) : undefined}
      />

      {!isTrashView && createMode === "dialog" && (
        <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-page-title">Title</Label>
                <Input
                  id="new-page-title"
                  value={createTitle}
                  onChange={(event) => {
                    setCreateTitle(event.target.value)
                    if (createTitleError) setCreateTitleError(null)
                  }}
                  placeholder="Page title"
                  autoFocus
                  aria-invalid={!!createTitleError}
                  aria-describedby={createTitleError ? "new-page-title-error" : undefined}
                />
                {createTitleError && (
                  <p id="new-page-title-error" className="text-xs text-destructive">
                    {createTitleError}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateDialogChange(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating…" : "Create Page"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <AdminStatusFilter
            value={filters.trash === "1" || filters.trash === "true" ? "trash" : filters.status}
            onValueChange={handleStatusFilterChange}
            showTrash={canAccessTrash}
          />
        </div>

        {isSomeSelected && (
          <AdminBulkActionsBar
            selectedCount={selectedIds.length}
            isPending={isPending}
            actions={isTrashView ? [
              { label: "Restore", onClick: handleBulkRestore },
              { label: "Delete permanently", onClick: handleBulkPermanentDelete, variant: "destructive" as const },
            ] : [
              { label: "Publish", onClick: handleBulkPublish },
              { label: "Unpublish", onClick: handleBulkUnpublish },
              { label: "Duplicate", onClick: handleBulkDuplicate },
              { label: "Move to trash", onClick: handleBulkDelete, variant: "destructive" as const },
            ]}
            onClear={clearSelection}
          />
        )}

        <AdminSelectableTable
          items={contentItems}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          selectAllLabel={`Select all ${isTrashView ? "trashed content" : isPageList ? "pages" : "content"}`}
          selectItemLabel={(item) => `Select ${item.title}`}
          emptyMessage={emptyMessage}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
          columns={[
            {
              key: "title",
              label: "Title",
              sortKey: "title",
              cellClassName: "px-4 py-3 font-medium",
              render: (item) => (
                <div className="flex items-center gap-3">
                  {!isPageList && (
                    safeAdminImageUrl(item.featuredImage) ? (
                      <img
                        src={safeAdminImageUrl(item.featuredImage) ?? undefined}
                        alt=""
                        className="size-10 rounded-sm border object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-sm border bg-muted" />
                    )
                  )}
                  {isTrashView ? (
                    <span>{item.title}</span>
                  ) : (
                    <Link to={`${contentPath}/${item.id}/edit`} className="underline">
                      {item.title}
                    </Link>
                  )}
                </div>
              ),
            },
            ...(isTrashView ? [{
              key: "type",
              label: "Type",
              cellClassName: "w-px px-4 py-3 capitalize",
              render: (item: (typeof contentItems)[number]) => item.type,
            }] : []),
            {
              key: "status",
              label: isTrashView || isPageList ? "Status" : "Visibility",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (item) => (
                <Badge
                  variant={item.status === "published" ? "default" : "secondary"}
                  className={item.status === "published"
                    ? "border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : item.status === "scheduled"
                      ? "border-0 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300"
                      : "capitalize"}
                >
                  {item.status === "scheduled" ? "Scheduled" : item.status}
                </Badge>
              ),
            },
            {
              key: "updatedAt",
              label: "Updated",
              sortKey: "updatedAt",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (item) => {
                const timestamp = toDateMilliseconds(item.updatedAt)
                return timestamp === null ? "—" : new Date(timestamp).toLocaleDateString()
              },
            },
            ...(!isPageList
              ? [{
                  key: "publishedAt",
                  label: "Published",
                  headerClassName: "w-px px-4 py-3",
                  cellClassName: "w-px px-4 py-3 text-muted-foreground",
                  render: (item: (typeof contentItems)[number]) => {
                    const timestamp = toDateMilliseconds(item.publishedAt)
                    return timestamp === null ? "—" : new Date(timestamp).toLocaleDateString()
                  },
                }]
              : []),
            ...(isTrashView ? [{
              key: "deletedAt",
              label: "Deleted",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (item: (typeof contentItems)[number]) => {
                const timestamp = toDateMilliseconds(item.deletedAt)
                return timestamp === null ? "—" : new Date(timestamp).toLocaleDateString()
              },
            }, {
              key: "actions",
              label: "",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (item: (typeof contentItems)[number]) => (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pendingItemAction !== null}
                    onClick={() => void handleRestore(item.id)}
                  >
                    Restore
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pendingItemAction !== null}
                    onClick={() => void handlePermanentDelete(item.id, item.title)}
                  >
                    Delete permanently
                  </Button>
                </div>
              ),
            }] : []),
          ]}
        />

        <AdminListPagination meta={data.meta} getPageUrl={buildPageUrl} />
      </div>
    </AdminPageShell>
  )
}
