import { useCallback, useState } from "react"

import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import { adminApiPost } from "@zbeaver/beaver/ui/shared/api-client"
import { adminToast, type AdminToastEntity } from "@zbeaver/beaver/ui/shared/toast"

export interface AdminBulkAction {
  label: string
  onClick: () => void
  variant?: "outline" | "destructive" | "ghost"
}

export function useAdminBulkActions({
  selectedIds,
  entity,
  onSuccess,
  successAction = "update",
}: {
  selectedIds: string[]
  entity: AdminToastEntity
  onSuccess: () => Promise<void> | void
  successAction?: "create" | "update" | "delete"
}) {
  const [isPending, setIsPending] = useState(false)

  const performBulkAction = useCallback(
    async (path: string, extra: Record<string, unknown> = {}) => {
      if (selectedIds.length === 0 || isPending) return

      setIsPending(true)
      try {
        const result = await adminApiPost<unknown>(path, { ids: selectedIds, ...extra })
        if (result.success) {
          adminToast.success(successAction, entity)
          await onSuccess()
        } else {
          adminToast.error(result.message)
        }
      } finally {
        setIsPending(false)
      }
    },
    [entity, isPending, onSuccess, selectedIds, successAction]
  )

  return { isPending, performBulkAction }
}

export function AdminBulkActionsBar({
  selectedCount,
  isPending,
  actions,
  onClear,
}: {
  selectedCount: number
  isPending: boolean
  actions: AdminBulkAction[]
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-sm border bg-muted/30 px-4 py-2">
      <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
      <div className="ml-auto flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant={action.variant ?? "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={isPending}
          >
            {action.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isPending}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
