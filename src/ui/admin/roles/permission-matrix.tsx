
import { Card, CardContent, CardHeader, CardTitle } from "@zaenpm/beaver/ui/admin/components/ui/card"
import { Button } from "@zaenpm/beaver/ui/admin/components/ui/button"
import { Checkbox } from "@zaenpm/beaver/ui/admin/components/ui/checkbox"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Permission {
  id: string
  name: string
  slug: string
  group: string
  description: string | null
}

interface PermissionMatrixProps {
  groupedPermissions: Record<string, Permission[]>
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PermissionMatrix({
  groupedPermissions,
  selectedIds,
  onChange,
}: PermissionMatrixProps) {
  const groups = Object.keys(groupedPermissions).sort()

  function handleToggle(permissionId: string) {
    if (selectedIds.includes(permissionId)) {
      onChange(selectedIds.filter((id) => id !== permissionId))
    } else {
      onChange([...selectedIds, permissionId])
    }
  }

  function handleSelectAllGroup(group: string) {
    const groupIds = groupedPermissions[group].map((p) => p.id)
    const allSelected = groupIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      // Deselect all in this group
      onChange(selectedIds.filter((id) => !groupIds.includes(id)))
    } else {
      // Select all in this group
      const newIds = new Set([...selectedIds, ...groupIds])
      onChange(Array.from(newIds))
    }
  }

  function isGroupAllSelected(group: string): boolean {
    const groupIds = groupedPermissions[group].map((p) => p.id)
    return groupIds.every((id) => selectedIds.includes(id))
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => {
        const perms = groupedPermissions[group]
        const allSelected = isGroupAllSelected(group)

        return (
          <Card key={group} size="sm">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{group}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => handleSelectAllGroup(group)}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex flex-col gap-2">
                {perms.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.includes(permission.id)}
                      onCheckedChange={() => handleToggle(permission.id)}
                    />
                    <span>{permission.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
