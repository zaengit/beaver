
import { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"

import { adminApiGet } from "@zbeaver/beaver/ui/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import {
  AdminPageShell,
  AdminPageHeader
} from "@zbeaver/beaver/ui/layout/page-shell"
import { Badge } from "@zbeaver/beaver/ui/components/ui/badge"
import { Button, buttonVariants } from "@zbeaver/beaver/ui/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import type { AdminCategory } from "@zbeaver/beaver/ui/shared/data"
import {
  AdminBulkActionsBar,
  AdminErrorState,
  AdminSelectableTable,
  AdminStatusFilter,
  buildAdminListSearchParams,
  useAdminBulkActions,
  useAdminListFilters,
  useAdminListSelection,
} from "@zbeaver/beaver/ui/shared"

export function AdminCategoriesPage() {
  const [data, setData] = useState<AdminCategory[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { type = "post" } = useParams()
  const listPath = `/admin/categories/${type}`
  const {
    filters,
    setFilter,
    handleFilter,
    handleSort,
    handleKeyDown,
  } = useAdminListFilters({
    locationSearch: location.search,
    navigate,
    path: listPath,
    defaults: { search: "", status: "all", sortBy: "", sortOrder: "" },
    debounceKeys: ["search", "status"],
  })
  const {
    selectedIds,
    clearSelection,
    handleSelectAll,
    handleSelectOne,
    isAllSelected,
    isSomeSelected,
  } = useAdminListSelection(data)

  const { isPending, performBulkAction } = useAdminBulkActions({
    selectedIds,
    entity: "category",
    onSuccess: loadCategories,
  })

  async function loadCategories() {
    setError(null)
    const params = buildAdminListSearchParams(filters, { type })
    const qs = params.toString() ? `?${params.toString()}` : ""
    const nextData = await adminApiGet<AdminCategory[]>(`/api/admin/categories${qs}`)
    setData(nextData)
    clearSelection()
  }

  useEffect(() => {
    loadCategories().catch((e) => setError(e.message))
  }, [location.search, type])

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} category(ies)? This action cannot be undone.`)) return
    await performBulkAction("/api/admin/categories/bulk/delete")
  }, [performBulkAction, selectedIds])

  const handleBulkDuplicate = useCallback(async () => {
    await performBulkAction("/api/admin/categories/bulk/duplicate")
  }, [performBulkAction])

  const handleBulkStatus = useCallback(async (status: "published" | "draft") => {
    await performBulkAction("/api/admin/categories/bulk/status", { status })
  }, [performBulkAction])

  if (error) return <AdminErrorState message={error} />
  if (!data) return <AdminLoadingState />

  const categories = data

  return (
    <AdminPageShell>

      <AdminPageHeader
        title="Categories"
        search={
          <Input
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
          />
        }
        actions={
          <Link to={`${listPath}/new`} className={cn(buttonVariants({ size: "lg" }))}>
            New Category
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <AdminStatusFilter
            value={filters.status}
            onValueChange={(value) => setFilter("status", value)}
            showScheduled={false}
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleFilter}>
            Filter
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {isSomeSelected && (
          <AdminBulkActionsBar
            selectedCount={selectedIds.length}
            isPending={isPending}
            actions={[
              { label: "Duplicate", onClick: handleBulkDuplicate },
              { label: "Publish", onClick: () => handleBulkStatus("published") },
              { label: "Unpublish", onClick: () => handleBulkStatus("draft") },
              { label: "Delete", onClick: handleBulkDelete, variant: "destructive" },
            ]}
            onClear={clearSelection}
          />
        )}

        <AdminSelectableTable
          items={categories}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          selectAllLabel="Select all categories"
          selectItemLabel={(category) => `Select ${category.name}`}
          emptyMessage="No categories found."
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
          columns={[
            {
              key: "name",
              label: "Name",
              sortKey: "name",
              cellClassName: "px-4 py-3 font-medium",
              render: (category) => (
                <Link to={`/admin/categories/${category.id}/edit`} className="underline">
                  {category.name}
                </Link>
              ),
            },
            {
              key: "slug",
              label: "Slug",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (category) => category.slug,
            },
            {
              key: "status",
              label: "Status",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (category) => (
                <Badge variant={category.status === "published" ? "secondary" : "outline"}>
                  {category.status === "published" ? "Published" : "Unpublished"}
                </Badge>
              ),
            },
            {
              key: "createdAt",
              label: "Created",
              sortKey: "createdAt",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (category) => new Date(category.createdAt * 1000).toLocaleDateString(),
            },
          ]}
        />

      </div>
    </AdminPageShell>
  )
}
