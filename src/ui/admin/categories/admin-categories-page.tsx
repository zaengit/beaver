
import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"

import { adminApiGet, adminApiPost } from "zadm/ui/admin/shared/api-client"
import { AdminLoadingState } from "zadm/ui/admin/core/admin-loading-state"
import {
  AdminPageShell,
  AdminPageHeader
} from "zadm/ui/admin/layout/admin-page-shell"
import { Badge } from "zadm/ui/admin/components/ui/badge"
import { Button, buttonVariants } from "zadm/ui/admin/components/ui/button"
import { Input } from "zadm/ui/admin/components/ui/input"
import { Checkbox } from "zadm/ui/admin/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "zadm/ui/admin/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "zadm/ui/admin/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "zadm/pkg/utils/ui"
import { buildNavigationUrl } from "zadm/ui/admin/navigation"
import { adminToast } from "zadm/ui/admin/shared/admin-toast"

export function AdminCategoriesPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { type = "post" } = useParams()
  const [search, setSearch] = useState(
    new URLSearchParams(location.search).get("search") ?? ""
  )
  const [sortBy, setSortBy] = useState(
    new URLSearchParams(location.search).get("sortBy") ?? ""
  )
  const [sortOrder, setSortOrder] = useState(
    new URLSearchParams(location.search).get("sortOrder") ?? ""
  )

  async function loadCategories() {
    setError(null)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (sortBy) params.set("sortBy", sortBy)
    if (sortOrder) params.set("sortOrder", sortOrder)
    params.set("type", type)
    const qs = params.toString() ? `?${params.toString()}` : ""
    const nextData = await adminApiGet(`/api/admin/categories${qs}`)
    setData(nextData)
    setSelectedIds([])
  }

  useEffect(() => {
    loadCategories().catch((e) => setError(e.message))
  }, [location.search, type])

  // ─── Filter handlers ────────────────────────────────────────────────────

  function handleFilter() {
    navigate(buildNavigationUrl(`/admin/categories/${type}`, { search, sortBy, sortOrder }))
  }

  function handleSort(column: string) {
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(column)
    setSortOrder(nextOrder)
    navigate(buildNavigationUrl(`/admin/categories/${type}`, { search, sortBy: column, sortOrder: nextOrder }))
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
    if (!data) return
    if (checked) {
      setSelectedIds(data.map((c: any) => c.id))
    } else {
      setSelectedIds([])
    }
  }, [data])

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    )
  }, [])

  const isAllSelected = data?.length > 0 && selectedIds.length === data.length
  const isSomeSelected = selectedIds.length > 0

  // ─── Bulk action handlers ────────────────────────────────────────────────

  async function performBulkAction(path: string, extra: Record<string, unknown> = {}) {
    if (selectedIds.length === 0) return
    setIsPending(true)
    const result = await adminApiPost<any>(path, { ids: selectedIds, ...extra })
    setIsPending(false)
    if (result.success) {
      adminToast.success("update", "category")
      await loadCategories()
    } else {
      adminToast.error(result.message)
    }
  }

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} category(ies)? This action cannot be undone.`)) return
    await performBulkAction("/api/admin/categories/bulk/delete")
  }, [selectedIds])

  const handleBulkDuplicate = useCallback(async () => {
    await performBulkAction("/api/admin/categories/bulk/duplicate")
  }, [selectedIds])

  const handleBulkStatus = useCallback(async (status: "published" | "draft") => {
    await performBulkAction("/api/admin/categories/bulk/status", { status })
  }, [selectedIds])

  if (error) return <main className="p-6"><p className="text-destructive">Error: {error}</p></main>
  if (!data) return <AdminLoadingState />

  const categories = data ?? []

  return (
    <AdminPageShell>

      <AdminPageHeader
        title="Categories"
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
          <Link to={`/admin/categories/${type}/new`} className={cn(buttonVariants({ size: "lg" }))}>
            New Category
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
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
              <Button variant="outline" size="sm" onClick={() => handleBulkStatus("published")} disabled={isPending}>Publish</Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkStatus("draft")} disabled={isPending}>Unpublish</Button>
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
                    aria-label="Select all categories"
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
                <TableHead className="w-px px-4 py-3">Status</TableHead>
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
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat: any) => (
                  <TableRow key={cat.id} className="hover:bg-muted/25">
                    <TableCell className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(cat.id)}
                        onCheckedChange={(checked) => handleSelectOne(cat.id, checked === true)}
                        aria-label={`Select ${cat.name}`}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">
                      <Link to={`/admin/categories/${cat.id}/edit`} className="underline">
                        {cat.name}
                      </Link>
                    </TableCell>
                    <TableCell className="w-px px-4 py-3 text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="w-px px-4 py-3">
                      <Badge variant={cat.status === "published" ? "secondary" : "outline"}>
                        {cat.status === "published" ? "Published" : "Unpublished"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-px px-4 py-3 text-muted-foreground">{new Date(cat.createdAt * 1000).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

      </div>
    </AdminPageShell>
  )
}
