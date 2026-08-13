
import { useState, useTransition } from "react"

import { Button } from "zadm/ui/admin/components/ui/button"
import { adminApiPost, adminApiPut } from "zadm/ui/admin/shared/api-client"
import { Input } from "zadm/ui/admin/components/ui/input"
import { Label } from "zadm/ui/admin/components/ui/label"
import { Textarea } from "zadm/ui/admin/components/ui/textarea"
import { PermissionMatrix } from "zadm/ui/admin/roles/permission-matrix"
import {
  AdminPageHeader
} from "zadm/ui/admin/layout/admin-page-shell"
import { navigateToPath } from "zadm/ui/admin/navigation"
import { adminToast } from "zadm/ui/admin/shared/admin-toast"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "zadm/ui/admin/layout/admin-form-layout"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Permission {
  id: string
  name: string
  slug: string
  group: string
  description: string | null
}

interface RoleData {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: number
  permissions: Permission[]
}

interface RoleFormProps {
  mode: "create" | "edit"
  role?: RoleData
  groupedPermissions: Record<string, Permission[]>
  pageTitle?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RoleForm({ mode, role, groupedPermissions, pageTitle }: RoleFormProps) {
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [genericError, setGenericError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(role?.name ?? "")
  const [description, setDescription] = useState(role?.description ?? "")
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    () => role?.permissions?.map((p) => p.id) ?? []
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGenericError(null)

    startTransition(async () => {
      const payload = {
        name,
        description,
        permissionIds: selectedPermissionIds,
      }

      let result
      if (mode === "edit" && role) {
        result = await adminApiPut<RoleData>(`/api/admin/roles/${role.id}`, payload)
      } else {
        result = await adminApiPost<RoleData>("/api/admin/roles", payload)
      }

      if (result.success) {
        adminToast.success(mode === "edit" ? "update" : "create", "role")
        navigateToPath("/admin/roles")
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setFieldErrors(result.errors)
          adminToast.error(result.message)
        } else {
          setGenericError(result.message)
          adminToast.error(result.message)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="">
        <AdminPageHeader
          title={pageTitle || "Roles"}
          actions={
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? mode === "edit"
                    ? "Saving…"
                    : "Creating…"
                  : mode === "edit"
                    ? "Save Changes"
                    : "Create Role"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateToPath("/admin/roles")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          }
        />
        {genericError && <div className="mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{genericError}</div>}
        <AdminFormLayout>
          <AdminFormMain>
            <AdminFormCard title="Permissions" description="Select the permissions this role should have.">
              {fieldErrors.permissionIds && <p className="text-xs text-destructive">{fieldErrors.permissionIds[0]}</p>}
              <PermissionMatrix groupedPermissions={groupedPermissions} selectedIds={selectedPermissionIds} onChange={setSelectedPermissionIds} />
            </AdminFormCard>
          </AdminFormMain>
          <AdminFormSidebar>
            <AdminFormCard title="Role details">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Editor, Author, Moderator"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="text-xs text-destructive">
                {fieldErrors.name[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role's purpose..."
              rows={3}
              aria-invalid={!!fieldErrors.description}
              aria-describedby={
                fieldErrors.description ? "description-error" : undefined
              }
            />
            {fieldErrors.description && (
              <p id="description-error" className="text-xs text-destructive">
                {fieldErrors.description[0]}
              </p>
            )}
          </div>
            </AdminFormCard>
          </AdminFormSidebar>
        </AdminFormLayout>
    </form>
  )
}
