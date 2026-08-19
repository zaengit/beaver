
import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"

import { adminApiGet, adminApiPost } from "@zaenpm/beaver/ui/admin/shared/api-client"
import { AdminLoadingState } from "@zaenpm/beaver/ui/admin/core/admin-loading-state"
import {
  AdminPageShell,
  AdminPageHeader
} from "@zaenpm/beaver/ui/admin/layout/admin-page-shell"
import { Badge } from "@zaenpm/beaver/ui/admin/components/ui/badge"
import { Button, buttonVariants } from "@zaenpm/beaver/ui/admin/components/ui/button"
import { Input } from "@zaenpm/beaver/ui/admin/components/ui/input"
import { Checkbox } from "@zaenpm/beaver/ui/admin/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zaenpm/beaver/ui/admin/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@zaenpm/beaver/pkg/utils/ui"
import { buildNavigationUrl } from "@zaenpm/beaver/ui/admin/navigation"
import { adminToast } from "@zaenpm/beaver/ui/admin/shared/admin-toast"

export function AdminRolesPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState(
    new URLSearchParams(location.search).get("search") ?? ""
  )
  const [sortBy, setSortBy] = useState(
    new URLSearchParams(location.search).get("sortBy") ?? ""
  )
  const [sortOrder, setSortOrder] = useState(
    new URLSearchParams(location.search).get("sortOrder") ?? ""
  )

  async function loadRoles() {
    setError(null)
    const nextData = await adminApiGet(`/api/admin/roles${location.search}`)
    setData(nextData)
    setSelectedIds([])
  }

  useEffect(() => {
    loadRoles().catch((e) => setError(e.message))
  }, [location.search])

  // ─── Filter handlers ────────────────────────────────────────────────────

  function handleFilter() {
    navigate(buildNavigationUrl("/admin/roles", { search, sortBy, sortOrder }))
  }

  function handleSort(column: string) {
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(column)
    setSortOrder(nextOrder)
    navigate(buildNavigationUrl("/admin/roles", { search, sortBy: column, sortOrder: nextOrder }))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleFilter()
    }
  }

  // ─── Live search debounce ───────────────────────────────────────────────

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      handleFilter()
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // ─── Selection handlers ──────────────────────────────────────────────────

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!data?.roles) return
    if (checked) {
      setSelectedIds(data.roles.map((r: any) => r.id))
    } else {
      setSelectedIds([])
    }
  }, [data])

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    )
  }, [])

  const isAllSelected = data?.roles?.length > 0 && selectedIds.length === data.roles.length
  const isSomeSelected = selectedIds.length > 0

  // ─── Bulk action handlers ────────────────────────────────────────────────

  async function performBulkAction(path: string, successMessage: string) {
    if (selectedIds.length === 0) return
    setIsPending(true)
    const result = await adminApiPost<any>(path, { ids: selectedIds })
    setIsPending(false)
    if (result.success) {
      adminToast.success("update", "role")
      await loadRoles()
    } else {
      adminToast.error(result.message)
    }
  }

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} role(s)? This action cannot be undone.`)) return
    await performBulkAction("/api/admin/roles/bulk/delete", "Bulk delete completed.")
  }, [selectedIds])

  const handleBulkDuplicate = useCallback(async () => {
    await performBulkAction("/api/admin/roles/bulk/duplicate", "Bulk duplicate completed.")
  }, [selectedIds])

  if (error) return <main className="p-6"><p className="text-destructive">Error: {error}</p></main>
  if (!data) return <AdminLoadingState />

  const roles = data.roles ?? []

  function buildPageUrl(page: number) {
    return buildNavigationUrl("/admin/roles", { search, sortBy, sortOrder, page })
  }

  return (
    <AdminPageShell>

      <AdminPageHeader
        title="Roles"
        search={
          <Input
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
          />
        }
        actions={
          <Link to="/admin/roles/new" className={cn(buttonVariants({ size: "lg" }))}>
            New Role
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        {/* Bulk Actions Bar */}
        {isSomeSelected && (
          <div className="flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDuplicate}
                disabled={isPending}
              >
                Duplicate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isPending}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                disabled={isPending}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <Table>
            <TableHeader>
              <TableRow className="bg-muted/35 hover:bg-muted/35">
                <TableHead className="w-10 px-4 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    aria-label="Select all roles"
                  />
                </TableHead>
                <TableHead className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Name
                    {sortBy === "name" ? (
                      sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-px px-4 py-3">Slug</TableHead>
                <TableHead className="w-px px-4 py-3">Users</TableHead>
                <TableHead className="w-px px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSort("createdAt")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Created
                    {sortBy === "createdAt" ? (
                      sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role: any) => (
                  <TableRow key={role.id} className="hover:bg-muted/25">
                    <TableCell className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(role.id)}
                        onCheckedChange={(checked) => handleSelectOne(role.id, checked === true)}
                        aria-label={`Select ${role.name}`}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">
                      <Link to={`/admin/roles/${role.id}/edit`} className="underline">
                        {role.name}
                      </Link>
                    </TableCell>
                    <TableCell className="w-px px-4 py-3 text-muted-foreground">{role.slug}</TableCell>
                    <TableCell className="w-px px-4 py-3">
                      <Badge variant="secondary">
                        {role.userCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-px px-4 py-3 text-muted-foreground">{new Date(role.createdAt * 1000).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

        {data.meta && (
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Showing {data.meta.from}–{data.meta.to} of {data.meta.total}</span>
            <div className="flex gap-2">
              {data.meta.currentPage > 1 && <Link to={buildPageUrl(data.meta.currentPage - 1)} className="hover:text-foreground hover:underline">Previous</Link>}
              {data.meta.currentPage < data.meta.lastPage && <Link to={buildPageUrl(data.meta.currentPage + 1)} className="hover:text-foreground hover:underline">Next</Link>}
            </div>
          </div>
        )}

      </div>
    </AdminPageShell>
  )
}
