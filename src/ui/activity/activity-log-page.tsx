import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Eye } from "lucide-react"

import { adminApiGet } from "@zbeaver/beaver/ui/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import { AdminErrorState, AdminListPagination, buildAdminListSearchParams, getAdminListPage, useAdminListFilters } from "@zbeaver/beaver/ui/shared"
import { AdminPageHeader, AdminPageShell } from "@zbeaver/beaver/ui/layout/page-shell"
import { Badge } from "@zbeaver/beaver/ui/components/ui/badge"
import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@zbeaver/beaver/ui/components/ui/dialog"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zbeaver/beaver/ui/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zbeaver/beaver/ui/components/ui/table"
import type { AdminActivityLog, AdminActivityLogListResponse } from "@zbeaver/beaver/ui/shared/data"
import type { ActivityLogValue } from "@zbeaver/beaver/app/models/activity-log"

const RESOURCE_OPTIONS = [
  ["all", "All resources"],
  ["auth", "Authentication"],
  ["profile", "Profile"],
  ["post", "Posts"],
  ["category", "Categories"],
  ["user", "Users"],
  ["media", "Media"],
  ["menu", "Menus"],
  ["settings", "Settings"],
] as const

const ACTION_OPTIONS = [
  ["all", "All actions"],
  ["login", "Login"],
  ["login_2fa", "2FA login"],
  ["logout", "Logout"],
  ["create", "Create"],
  ["update", "Update"],
  ["delete", "Delete"],
  ["duplicate", "Duplicate"],
  ["publish", "Publish"],
  ["unpublish", "Unpublish"],
  ["upload", "Upload"],
  ["reorder", "Reorder"],
  ["setup_2fa", "Setup 2FA"],
  ["enable_2fa", "Enable 2FA"],
  ["disable_2fa", "Disable 2FA"],
  ["bulk_create", "Bulk create"],
  ["bulk_update", "Bulk update"],
  ["bulk_delete", "Bulk delete"],
  ["bulk_duplicate", "Bulk duplicate"],
  ["bulk_publish", "Bulk publish"],
  ["bulk_unpublish", "Bulk unpublish"],
  ["bulk_status", "Bulk status"],
  ["publish_scheduled", "Scheduled publish"],
] as const

function formatAction(action: string) {
  return action
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatResource(resource: string) {
  return resource.charAt(0).toUpperCase() + resource.slice(1)
}

function actorLabel(item: AdminActivityLog) {
  return item.actorName || item.actorEmail || "Unknown actor"
}

type ActivityChange = { before: ActivityLogValue; after: ActivityLogValue }

function isActivityChange(value: unknown): value is ActivityChange {
  return Boolean(
    value
    && typeof value === "object"
    && !Array.isArray(value)
    && "before" in value
    && "after" in value,
  )
}

function activityChanges(item: AdminActivityLog) {
  const value = item.metadata?.changes
  if (!value || typeof value !== "object" || Array.isArray(value)) return []
  return Object.entries(value).filter(([, change]) => isActivityChange(change)) as Array<[string, ActivityChange]>
}

function formatActivityValue(value: ActivityLogValue) {
  if (value === null) return "—"
  if (typeof value === "string") return value || "(empty)"
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}

function metadataEntries(item: AdminActivityLog) {
  return Object.entries(item.metadata ?? {}).filter(([key]) => key !== "changes" && key !== "path")
}

export function AdminActivityLogPage() {
  const [data, setData] = useState<AdminActivityLogListResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<AdminActivityLog | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const {
    filters,
    setFilter,
    handleKeyDown,
    buildPageUrl,
  } = useAdminListFilters({
    locationSearch: location.search,
    navigate,
    path: "/admin/activity-log",
    defaults: {
      search: "",
      action: "all",
      resource: "all",
      success: "all",
      from: "",
      to: "",
    },
    debounceKeys: ["search", "action", "resource", "success", "from", "to"],
  })

  async function loadActivityLogs() {
    setError(null)
    const query = buildAdminListSearchParams(filters, {
      page: getAdminListPage(location.search),
      perPage: 10,
    }).toString()
    const nextData = await adminApiGet<AdminActivityLogListResponse>(
      `/api/admin/activity-logs${query ? `?${query}` : ""}`,
    )
    setData(nextData)
  }

  useEffect(() => {
    loadActivityLogs().catch((reason) => {
      setError(reason instanceof Error ? reason.message : "Failed to load activity log")
    })
  }, [location.search])

  if (error) return <AdminErrorState message={error} />
  if (!data) return <AdminLoadingState />

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Activity Log"
        search={
          <Input
            placeholder="Search activity..."
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
          />
        }
      />

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="activity-resource-filter" className="text-xs text-muted-foreground">Resource</Label>
            <Select value={filters.resource} onValueChange={(value) => { if (value) setFilter("resource", value) }}>
              <SelectTrigger id="activity-resource-filter" className="w-[160px]"><SelectValue placeholder="Resource" /></SelectTrigger>
              <SelectContent>
                {RESOURCE_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity-action-filter" className="text-xs text-muted-foreground">Action</Label>
            <Select value={filters.action} onValueChange={(value) => { if (value) setFilter("action", value) }}>
              <SelectTrigger id="activity-action-filter" className="w-[160px]"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity-result-filter" className="text-xs text-muted-foreground">Result</Label>
            <Select value={filters.success} onValueChange={(value) => { if (value) setFilter("success", value) }}>
              <SelectTrigger id="activity-result-filter" className="w-[140px]"><SelectValue placeholder="Result" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All results</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity-from-filter" className="text-xs text-muted-foreground">From</Label>
            <Input id="activity-from-filter" type="date" value={filters.from} onChange={(event) => setFilter("from", event.target.value)} className="w-[150px]" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity-to-filter" className="text-xs text-muted-foreground">To</Label>
            <Input id="activity-to-filter" type="date" value={filters.to} onChange={(event) => setFilter("to", event.target.value)} className="w-[150px]" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/35 hover:bg-muted/35">
              <TableHead className="px-4 py-3">Time</TableHead>
              <TableHead className="px-4 py-3">Actor</TableHead>
              <TableHead className="px-4 py-3">Action</TableHead>
              <TableHead className="px-4 py-3">Resource</TableHead>
              <TableHead className="px-4 py-3">Result</TableHead>
              <TableHead className="px-4 py-3">IP address</TableHead>
              <TableHead className="px-4 py-3 text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No activity found.</TableCell>
              </TableRow>
            ) : data.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-4 py-3 text-muted-foreground">{new Date(item.createdAt * 1000).toLocaleString()}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="font-medium">{actorLabel(item)}</div>
                  {item.actorName && item.actorEmail ? <div className="text-xs text-muted-foreground">{item.actorEmail}</div> : null}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium">{formatAction(item.action)}</TableCell>
                <TableCell className="px-4 py-3">
                  <span>{formatResource(item.resource)}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant={item.success ? "outline" : "destructive"}>{item.success ? "Success" : `Failed (${item.statusCode})`}</Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{item.ipAddress || "Unknown"}</TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View details for ${formatAction(item.action)}`}
                    title="View changes"
                    onClick={() => setSelectedLog(item)}
                  >
                    <Eye />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AdminListPagination meta={data.meta} getPageUrl={buildPageUrl} />
      </div>

      <Dialog open={Boolean(selectedLog)} onOpenChange={(open) => { if (!open) setSelectedLog(null) }}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-6xl sm:max-w-6xl">
          {selectedLog ? (
            <>
              <DialogHeader>
                <DialogTitle>Activity details</DialogTitle>
                <DialogDescription>
                  {formatAction(selectedLog.action)} · {formatResource(selectedLog.resource)} · {new Date(selectedLog.createdAt * 1000).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
                <div className="grid gap-3 rounded-sm border bg-muted/20 p-3 text-sm sm:grid-cols-3">
                  <div><div className="text-xs text-muted-foreground">Actor</div><div className="font-medium">{actorLabel(selectedLog)}</div></div>
                  <div><div className="text-xs text-muted-foreground">Resource ID</div><div className="break-all font-medium">{selectedLog.resourceId || "—"}</div></div>
                  <div><div className="text-xs text-muted-foreground">Result</div><Badge variant={selectedLog.success ? "outline" : "destructive"}>{selectedLog.success ? "Success" : `Failed (${selectedLog.statusCode})`}</Badge></div>
                </div>

                <section className="space-y-2">
                  <h3 className="text-sm font-medium">Changes</h3>
                  {activityChanges(selectedLog).length > 0 ? (
                    <div className="overflow-hidden rounded-sm border">
                      <div className="grid grid-cols-[minmax(120px,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                        <span>Field</span><span>Before</span><span>After</span>
                      </div>
                      {activityChanges(selectedLog).map(([field, change]) => (
                        <div key={field} className="grid grid-cols-[minmax(120px,0.7fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b px-3 py-3 last:border-b-0">
                          <span className="break-words text-sm font-medium">{field}</span>
                          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-red-50 p-2 text-xs text-red-900 dark:bg-red-500/10 dark:text-red-200">{formatActivityValue(change.before)}</pre>
                          <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-emerald-50 p-2 text-xs text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">{formatActivityValue(change.after)}</pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-sm border border-dashed p-4 text-sm text-muted-foreground">No change details were recorded for this entry.</p>
                  )}
                </section>

                {metadataEntries(selectedLog).length > 0 ? (
                  <section className="space-y-2">
                    <h3 className="text-sm font-medium">Metadata</h3>
                    <div className="grid gap-2 rounded-sm border p-3 text-sm sm:grid-cols-2">
                      {metadataEntries(selectedLog).map(([key, value]) => (
                        <div key={key} className="min-w-0">
                          <div className="text-xs text-muted-foreground">{key}</div>
                          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-words text-xs">{formatActivityValue(value)}</pre>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
