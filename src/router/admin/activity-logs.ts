import type { AdminRoute } from "@zbeaver/beaver/router/route"

import { handleListActivityLogs } from "@zbeaver/beaver/app/handlers"
import type { ActivityLogFilters } from "@zbeaver/beaver/app/models/activity-log"

function positiveInteger(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return undefined
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined
}

function dateBoundary(value: string | null, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}.000Z`)
  const timestamp = Math.floor(date.getTime() / 1000)
  return Number.isFinite(timestamp) ? timestamp : undefined
}

export const GET: AdminRoute = async ({ request, locals }) => {
  const url = new URL(request.url)
  const filters: ActivityLogFilters = {
    page: positiveInteger(url.searchParams.get("page")),
    perPage: positiveInteger(url.searchParams.get("perPage")),
    search: url.searchParams.get("search")?.slice(0, 100) || undefined,
    action: url.searchParams.get("action")?.slice(0, 64) || undefined,
    resource: url.searchParams.get("resource")?.slice(0, 64) || undefined,
    from: dateBoundary(url.searchParams.get("from")),
    to: dateBoundary(url.searchParams.get("to"), true),
  }

  const success = url.searchParams.get("success")
  if (success === "true" || success === "false") filters.success = success === "true"

  return handleListActivityLogs(locals.session as { user: { id: string } } | null, filters)
}
