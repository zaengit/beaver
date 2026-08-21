
import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"

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
import type { AdminPostListResponse } from "@zbeaver/beaver/ui/admin/shared/admin-data"
import { safeAdminImageUrl } from "@zbeaver/beaver/ui/admin/shared/media-url"

interface AdminContentListPageProps {
  contentType?: string
  pageTitle?: string
}

export function AdminContentListPage({ contentType, pageTitle }: AdminContentListPageProps) {
  const [data, setData] = useState<AdminPostListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { type: routeType } = useParams()
  const type = contentType ?? routeType ?? "post"
  const contentPath = contentType || routeType ? `/admin/posts/${type}` : "/admin/posts"
  const [search, setSearch] = useState(
    new URLSearchParams(location.search).get("search") ?? ""
  )
  const [status, setStatus] = useState(
    new URLSearchParams(location.search).get("status") ?? "all"
  )
  const [sortBy, setSortBy] = useState(
    new URLSearchParams(location.search).get("sortBy") ?? ""
  )
  const [sortOrder, setSortOrder] = useState(
    new URLSearchParams(location.search).get("sortOrder") ?? ""
  )

  async function loadContent() {
    setError(null)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (status && status !== "all") params.set("status", status)
    if (sortBy) params.set("sortBy", sortBy)
    if (sortOrder) params.set("sortOrder", sortOrder)
    params.set("type", type)
    const qs = params.toString() ? `?${params.toString()}` : ""
    const nextData = await adminApiGet<AdminPostListResponse>(`/api/admin/posts${qs}`)
    setData(nextData)
    setSelectedIds([])
  }

  
  useEffect(() => {
    loadContent().catch((e) => setError(e.message))
  }, [location.search, type])

  // ─── Filter handlers ────────────────────────────────────────────────────

  function handleFilter() {
    navigate(buildNavigationUrl(contentPath, { search, status, sortBy, sortOrder }))
  }

  function handleSort(column: string) {
    const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(column)
    setSortOrder(nextOrder)
    navigate(buildNavigationUrl(contentPath, { search, status, sortBy: column, sortOrder: nextOrder }))
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
  }, [search, status, type])

  // ─── Selection handlers ──────────────────────────────────────────────────

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!data?.data) return
    if (checked) {
      setSelectedIds(data.data.map((post) => post.id))
    } else {
      setSelectedIds([])
    }
  }, [data])

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    )
  }, [])

  const isAllSelected = data !== null && data.data.length > 0 && selectedIds.length === data.data.length
  const isSomeSelected = selectedIds.length > 0

  // ─── Bulk action handlers ────────────────────────────────────────────────

  async function performBulkAction(path: string) {
    if (selectedIds.length === 0) return
    setIsPending(true)
    const result = await adminApiPost<unknown>(path, { ids: selectedIds })
    setIsPending(false)
    if (result.success) {
      adminToast.success("update", "post")
      await loadContent()
    } else {
      adminToast.error(result.message)
    }
  }

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} post(s)? This action cannot be undone.`)) return
    await performBulkAction("/api/admin/posts/bulk/delete")
  }, [selectedIds])

  const handleBulkPublish = useCallback(async () => {
    await performBulkAction("/api/admin/posts/bulk/publish")
  }, [selectedIds])

  const handleBulkUnpublish = useCallback(async () => {
    await performBulkAction("/api/admin/posts/bulk/unpublish")
  }, [selectedIds])

  const handleBulkDuplicate = useCallback(async () => {
    await performBulkAction("/api/admin/posts/bulk/duplicate")
  }, [selectedIds])

  if (error) return <main className="p-6"><p className="text-destructive">Error: {error}</p></main>
  if (!data) return <AdminLoadingState />

  const contentItems = data.data ?? []

  function buildPageUrl(page: number) {
    return buildNavigationUrl(contentPath, { search, status, sortBy, sortOrder, page })
  }

  return (
    <AdminPageShell>

      <AdminPageHeader
        title={pageTitle ?? "Posts"}
        search={
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
          />
        }
        actions={
          <Link to={`${contentPath}/new`} className={cn(buttonVariants({ size: "lg" }))}>
            New {type.charAt(0).toUpperCase() + type.slice(1)}
          </Link>
        }
      />

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={status} onValueChange={(val) => { if (val) setStatus(val) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
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
                onClick={handleBulkPublish}
                disabled={isPending}
              >
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkUnpublish}
                disabled={isPending}
              >
                Unpublish
              </Button>
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
                    aria-label="Select all content"
                  />
                </TableHead>
                <TableHead className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSort("title")}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Title
                    {sortBy === "title" ? (
                      sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="w-px px-4 py-3">Visibility</TableHead>
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
                <TableHead className="w-px px-4 py-3">Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No content found.
                  </TableCell>
                </TableRow>
              ) : (
                contentItems.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/25">
                    <TableCell className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.includes(post.id)}
                        onCheckedChange={(checked) => handleSelectOne(post.id, checked === true)}
                        aria-label={`Select ${post.title}`}
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium"><div className="flex items-center gap-3">{safeAdminImageUrl(post.featuredImage) ? <img src={safeAdminImageUrl(post.featuredImage) ?? undefined} alt="" className="size-10 rounded-sm border object-cover" /> : <div className="size-10 rounded-sm border bg-muted" />}<Link to={`${contentPath}/${post.id}/edit`} className="underline">
                        {post.title}
                      </Link></div>
                    </TableCell>
                    <TableCell className="w-px px-4 py-3">
                      <Badge
                        variant={post.status === "published" ? "default" : "secondary"}
                        className={post.status === "published" ? "border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300" : "capitalize"}
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-px px-4 py-3 text-muted-foreground">{new Date(post.updatedAt * 1000).toLocaleDateString()}</TableCell>
                    <TableCell className="w-px px-4 py-3 text-muted-foreground">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}</TableCell>
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
