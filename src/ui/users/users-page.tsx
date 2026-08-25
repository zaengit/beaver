
import { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"

import { adminApiGet } from "@zbeaver/beaver/ui/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import {
  AdminPageShell,
  AdminPageHeader
} from "@zbeaver/beaver/ui/layout/page-shell"
import { Badge } from "@zbeaver/beaver/ui/components/ui/badge"
import { buttonVariants } from "@zbeaver/beaver/ui/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zbeaver/beaver/ui/components/ui/select"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import { STATIC_ROLES } from "@zbeaver/beaver/pkg/types/roles"
import type { AdminUserListResponse } from "@zbeaver/beaver/ui/shared/data"
import {
  AdminBulkActionsBar,
  AdminErrorState,
  AdminListPagination,
  AdminSelectableTable,
  buildAdminListSearchParams,
  getAdminListPage,
  useAdminBulkActions,
  useAdminListFilters,
  useAdminListSelection,
} from "@zbeaver/beaver/ui/shared"

export function AdminUsersPage() {
  const [data, setData] = useState<AdminUserListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const listPath = "/admin/users"
  const {
    filters,
    setFilter,
    handleSort,
    handleKeyDown,
    buildPageUrl,
  } = useAdminListFilters({
    locationSearch: location.search,
    navigate,
    path: listPath,
    defaults: { search: "", role: "all", sortBy: "", sortOrder: "" },
    debounceKeys: ["search", "role"],
  })
  const {
    selectedIds,
    clearSelection,
    handleSelectAll,
    handleSelectOne,
    isAllSelected,
    isSomeSelected,
  } = useAdminListSelection(data?.data ?? null)

  const { isPending, performBulkAction } = useAdminBulkActions({
    selectedIds,
    entity: "user",
    onSuccess: loadUsers,
  })

  async function loadUsers() {
    setError(null)
    const query = buildAdminListSearchParams(filters, {
      page: getAdminListPage(location.search),
    }).toString()
    const nextData = await adminApiGet<AdminUserListResponse>(`/api/admin/users${query ? `?${query}` : ""}`)
    setData(nextData)
    clearSelection()
  }

  useEffect(() => {
    loadUsers().catch((e) => setError(e.message))
  }, [location.search])

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} user(s)? This action cannot be undone.`)) return
    await performBulkAction("/api/admin/users/bulk/delete")
  }, [performBulkAction, selectedIds])

  const handleBulkDuplicate = useCallback(async () => {
    await performBulkAction("/api/admin/users/bulk/duplicate")
  }, [performBulkAction])

  if (error) return <AdminErrorState message={error} />
  if (!data) return <AdminLoadingState />

  const users = data.data ?? []

  return (
    <AdminPageShell>

      <AdminPageHeader
        title="Users"
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
          <Link to="/admin/users/new" className={cn(buttonVariants({ size: "lg" }))}>
            New User
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filters.role} onValueChange={(val) => { if (val) setFilter("role", val) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {STATIC_ROLES.filter((item) => item.slug !== "super-admin").map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions Bar */}
        {isSomeSelected && (
          <AdminBulkActionsBar
            selectedCount={selectedIds.length}
            isPending={isPending}
            actions={[
              { label: "Duplicate", onClick: handleBulkDuplicate },
              { label: "Delete", onClick: handleBulkDelete, variant: "destructive" },
            ]}
            onClear={clearSelection}
          />
        )}

        <AdminSelectableTable
          items={users}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          selectAllLabel="Select all users"
          selectItemLabel={(user) => `Select ${user.name}`}
          emptyMessage="No users found."
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
          columns={[
            {
              key: "name",
              label: "Name",
              sortKey: "name",
              cellClassName: "px-4 py-3 font-medium",
              render: (user) => (
                <Link to={`/admin/users/${user.id}/edit`} className="underline">
                  {user.name}
                </Link>
              ),
            },
            {
              key: "email",
              label: "Email",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (user) => user.email,
            },
            {
              key: "role",
              label: "Role",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3",
              render: (user) => (
                <Badge variant="outline" className="capitalize">
                  {user.roleName ?? "No role"}
                </Badge>
              ),
            },
            {
              key: "updatedAt",
              label: "Updated",
              sortKey: "updatedAt",
              headerClassName: "w-px px-4 py-3",
              cellClassName: "w-px px-4 py-3 text-muted-foreground",
              render: (user) => new Date(user.updatedAt * 1000).toLocaleDateString(),
            },
          ]}
        />

        <AdminListPagination meta={data.meta} getPageUrl={buildPageUrl} />

      </div>
    </AdminPageShell>
  )
}
