import { useCallback, useState } from "react"

export function useAdminListSelection<Item extends { id: string }>(items: Item[] | null) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!items) return
      setSelectedIds(checked ? items.map((item) => item.id) : [])
    },
    [items]
  )

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((currentIds) =>
      checked
        ? currentIds.includes(id)
          ? currentIds
          : [...currentIds, id]
        : currentIds.filter((currentId) => currentId !== id)
    )
  }, [])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  return {
    selectedIds,
    clearSelection,
    handleSelectAll,
    handleSelectOne,
    isAllSelected: items !== null && items.length > 0 && selectedIds.length === items.length,
    isSomeSelected: selectedIds.length > 0,
  }
}
