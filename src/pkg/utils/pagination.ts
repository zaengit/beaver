// Keep OFFSET bounded so attacker-controlled page parameters cannot force the
// database to scan hundreds of millions of rows.
export const MAX_PAGE = 10_000
export const DEFAULT_PER_PAGE = 10
export const MAX_PER_PAGE = 10

export function clampPage(value: number | undefined, fallback = 1) {
  return typeof value === "number" && Number.isSafeInteger(value) ? Math.min(MAX_PAGE, Math.max(1, value)) : fallback
}

export function clampPerPage(value: number | undefined, fallback = DEFAULT_PER_PAGE) {
  const safeFallback = Math.min(MAX_PER_PAGE, Math.max(1, fallback))
  return typeof value === "number" && Number.isSafeInteger(value) ? Math.min(MAX_PER_PAGE, Math.max(1, value)) : safeFallback
}

export function clampPagination(filters: { page?: number; perPage?: number }) {
  const page = clampPage(filters.page)
  const perPage = clampPerPage(filters.perPage)
  return { page, perPage, offset: (page - 1) * perPage }
}
