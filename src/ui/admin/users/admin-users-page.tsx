
import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"

import { adminApiGet, adminApiPost } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import {
  AdminPageShell,
  AdminPageHeader
} from "@zbeaver/beaver/ui/admin/layout/admin-page-shell"
import { Badge } from "@zbeaver/beaver/ui/admin/components/ui/badge"
import { Button, buttonVariants } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input"
import { Checkbox } from "@zbeaver/beaver/ui/admin/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zbeaver/beaver/ui/admin/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zbeaver/beaver/ui/admin/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import { buildNavigationUrl } from "@zbeaver/beaver/ui/admin/navigation"
import { adminToast } from "@zbeaver/beaver/ui/admin/shared/admin-toast"

export function AdminUsersPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState(
    new URLSearchParams(location.search).get("search") ?? ""
  )
  const [roleId, setRoleId] = useState(
    new URLSearchParams(location.search).get("roleId") ?? "all"
  )
  const [sortBy, setSortBy] = useState(
    new URLSearchParams(location.search).get("sortBy") ?? ""
  )
  const [sortOrder, setSortOrder] = useState(
    new URLSearchParams(location.search).get("sortOrder") ?? ""
  )

  async function loadUsers() {
    setError(null)
    const nextData = await adminApiGet(`/api/admin/users${location.search}`)
    setData(nextData)
    setSelectedIds([])
  }

  useEffect(() => {
    loadUsers().catch((e) => setError(e.message))
  }, [location.search])

  // ─── Filter handlers ────────────────────────────────────────────────────

  function handleFilter() {
    navigate(buildNavigationUrl("/admin/users", { search, roleId, sortBy, sortOrder }))
  }

  function handleSort(column: string) {
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(column)
    setSortOrder(nextOrder)
    navigate(buildNavigationUrl("/admin/users", { search, roleId, sortBy: column, sortOrder: nextOrder }))
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
    // Skip the initial mount to avoid double navigation
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      handleFilter()
    }, 400)
    return () => clearTimeout(timer)
  }, [search, roleId])

  // ─── Selection handlers ──────────────────────────────────────────────────

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!data?.data) return
    if (checked) {
      setSelectedIds(data.data.map((u: any) => u.id))
    } else {
      setSelectedIds([])
    }
  }, [data])

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    )
  }, [])

  const isAllSelected = data?.data?.length > 0 && selectedIds.length === data.data.length
  const isSomeSelected = selectedIds.length > 0

  // ─── Bulk action handlers ────────────────────────────────────────────────

  async function performBulkAction(path: string) {
    if (selectedIds.length === 0) return
    setIsPending(true)
    const result = await adminApiPost<any>(path, { ids: selectedIds })
    setIsPending(false)
    if (result.success) {
      adminToast.success("update", "user")
      await loadUsers()
    } else {
      adminToast.error(result.message)
    }
  }

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} user(s)? This action cannot be undone.`)) return
    await performBulkAction("/api/admin/users/bulk/delete")
  }, [selectedIds])

  const handleBulkDuplicate = useCallback(async () => {
    await performBulkAction("/api/admin/users/bulk/duplicate")
  }, [selectedIds])

  if (error) return <main className="p-6"><p className="text-destructive">Error: {error}</p></main>
  if (!data) return <AdminLoadingState />

  const users = data.data ?? []

  function buildPageUrl(page: number) {
    return buildNavigationUrl("/admin/users", { search, roleId, sortBy, sortOrder, page })
  }

  return (
    <AdminPageShell>

      <AdminPageHeader
        title="Users"
        search={
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <Select value={roleId} onValueChange={(val) => { if (val) setRoleId(val) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {data.roles?.map((role: any) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="secondary" size="sm" onClick={handleFilter}>
            Filter
          </Button>
        </div>

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
                  aria-label="Select all users"
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
              <TableHead className="w-px px-4 py-3">Email</TableHead>
              <TableHead className="w-px px-4 py-3">Role</TableHead>
              <TableHead className="w-px px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleSort("updatedAt")}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Updated
                  {sortBy === "updatedAt" ? (
                    sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                  )}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-muted/25">
                  <TableCell className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectOne(user.id, checked === true)}
                      aria-label={`Select ${user.name}`}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">
                    <Link to={`/admin/users/${user.id}/edit`} className="underline">
                      {user.name}
                    </Link>
                  </TableCell>
                  <TableCell className="w-px px-4 py-3 text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="w-px px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {user.roleName ?? "No role"}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-px px-4 py-3 text-muted-foreground">{new Date(user.updatedAt * 1000).toLocaleDateString()}</TableCell>
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
