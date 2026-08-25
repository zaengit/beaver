import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import { Checkbox } from "@zbeaver/beaver/ui/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@zbeaver/beaver/ui/components/ui/table"

export interface AdminTableColumn<Item> {
  key: string
  label: ReactNode
  sortKey?: string
  headerClassName?: string
  cellClassName?: string
  render: (item: Item) => ReactNode
}

export function AdminSortableTableHead({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: ReactNode
  column: string
  sortBy: string
  sortOrder: string
  onSort: (column: string) => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => onSort(column)}
      className="h-auto gap-1 p-0 font-normal hover:bg-transparent"
    >
      {label}
      {sortBy === column ? (
        sortOrder === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
      )}
    </Button>
  )
}

export function AdminSelectableTable<Item extends { id: string }>({
  items,
  columns,
  selectedIds,
  isAllSelected,
  onSelectAll,
  onSelectOne,
  selectAllLabel,
  selectItemLabel,
  emptyMessage,
  sortBy,
  sortOrder,
  onSort,
}: {
  items: Item[]
  columns: AdminTableColumn<Item>[]
  selectedIds: string[]
  isAllSelected: boolean
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
  selectAllLabel: string
  selectItemLabel: (item: Item) => string
  emptyMessage: string
  sortBy: string
  sortOrder: string
  onSort: (column: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/35 hover:bg-muted/35">
          <TableHead className="w-10 px-4 py-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(checked) => onSelectAll(checked === true)}
              aria-label={selectAllLabel}
            />
          </TableHead>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={column.headerClassName ?? "px-4 py-3"}
            >
              {column.sortKey ? (
                <AdminSortableTableHead
                  label={column.label}
                  column={column.sortKey}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              ) : (
                column.label
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + 1}
              className="px-4 py-8 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/25">
              <TableCell className="px-4 py-3">
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(checked) => onSelectOne(item.id, checked === true)}
                  aria-label={selectItemLabel(item)}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={column.cellClassName ?? "px-4 py-3"}
                >
                  {column.render(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
