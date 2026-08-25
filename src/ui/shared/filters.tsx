import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zbeaver/beaver/ui/components/ui/select"
import { buildNavigationUrl } from "@zbeaver/beaver/ui/navigation"
import { useDebouncedValue } from "@zbeaver/beaver/ui/shared/use-debounced-value"

export function buildAdminListSearchParams(
  filters: Record<string, string>,
  additional: Record<string, string | number | undefined> = {}
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries({ ...filters, ...additional })) {
    if (value !== undefined && value !== "" && value !== "all") {
      params.set(key, String(value))
    }
  }

  return params
}

export function getAdminListPage(locationSearch: string) {
  const requestedPage = Number(new URLSearchParams(locationSearch).get("page") ?? "1")
  return Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
}

export function useAdminListFilters({
  locationSearch,
  navigate,
  path,
  defaults,
  debounceKeys = ["search"],
}: {
  locationSearch: string
  navigate: (url: string) => void
  path: string
  defaults: Record<string, string>
  debounceKeys?: string[]
}) {
  function readFilters() {
    const params = new URLSearchParams(locationSearch)
    return Object.fromEntries(
      Object.entries(defaults).map(([key, defaultValue]) => [
        key,
        params.get(key) ?? defaultValue,
      ])
    )
  }

  const [filters, setFilters] = useState<Record<string, string>>(readFilters)
  const latestFilters = useRef(filters)
  latestFilters.current = filters

  useEffect(() => {
    setFilters(readFilters())
  }, [locationSearch])

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }))
  }, [])

  const handleFilter = useCallback(() => {
    navigate(buildNavigationUrl(path, filters))
  }, [filters, navigate, path])

  const handleSort = useCallback(
    (column: string) => {
      const nextOrder =
        filters.sortBy === column && filters.sortOrder === "asc" ? "desc" : "asc"
      const nextFilters = {
        ...filters,
        sortBy: column,
        sortOrder: nextOrder,
      }
      setFilters(nextFilters)
      navigate(buildNavigationUrl(path, nextFilters))
    },
    [filters, navigate, path]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault()
        handleFilter()
      }
    },
    [handleFilter]
  )

  const debounceSignature = debounceKeys
    .map((key) => `${key}:${filters[key] ?? ""}`)
    .join("\u0000")
  const isInitialMount = useRef(true)
  const debouncedSignature = useDebouncedValue(debounceSignature)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    navigate(buildNavigationUrl(path, latestFilters.current))
  }, [debouncedSignature, navigate, path])

  return {
    filters,
    setFilter,
    handleFilter,
    handleSort,
    handleKeyDown,
    buildPageUrl: (page: number) =>
      buildNavigationUrl(path, { ...filters, page }),
  }
}

export function AdminStatusFilter({
  value,
  onValueChange,
  showScheduled = true,
  showTrash = false,
}: {
  value: string
  onValueChange: (value: string) => void
  showScheduled?: boolean
  showTrash?: boolean
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange(nextValue)
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
        <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        <SelectItem value="draft">Draft</SelectItem>
        {showScheduled && <SelectItem value="scheduled">Scheduled</SelectItem>}
        <SelectItem value="published">Published</SelectItem>
        {showTrash && <SelectItem value="trash">Trash</SelectItem>}
      </SelectContent>
    </Select>
  )
}
