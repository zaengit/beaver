import { Link } from "react-router"

import type { AdminPaginationMeta } from "@zbeaver/beaver/ui/shared/data"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@zbeaver/beaver/ui/components/ui/pagination"

function pageItems(currentPage: number, lastPage: number): Array<number | "ellipsis"> {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, index) => index + 1)
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", lastPage]
  if (currentPage >= lastPage - 3) return [1, "ellipsis", lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage]
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", lastPage]
}

export function AdminListPagination({
  meta,
  getPageUrl,
}: {
  meta: AdminPaginationMeta | null | undefined
  getPageUrl: (page: number) => string
}) {
  if (!meta) return null

  const pages = pageItems(meta.currentPage, meta.lastPage)

  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {meta.from}–{meta.to} of {meta.total}
      </span>
      {meta.lastPage > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            {meta.currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious render={<Link to={getPageUrl(meta.currentPage - 1)} />} />
              </PaginationItem>
            )}
            {pages.map((page, index) => (
              <PaginationItem key={page === "ellipsis" ? `ellipsis-${index}` : page}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    render={<Link to={getPageUrl(page)} />}
                    isActive={page === meta.currentPage}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            {meta.currentPage < meta.lastPage && (
              <PaginationItem>
                <PaginationNext render={<Link to={getPageUrl(meta.currentPage + 1)} />} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
