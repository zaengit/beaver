
import { useEffect, useMemo, useState } from "react"

import { adminApiGet } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import { RoleForm } from "@zbeaver/beaver/ui/admin/roles/role-form"

interface Permission {
  id: string
  name: string
  slug: string
  group: string
  description: string | null
}

interface RolePayload {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: number
  permissionIds: string[]
}

function groupPermissions(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    const key = permission.group || "general"
    if (!groups[key]) groups[key] = []
    groups[key].push(permission)
    return groups
  }, {})
}

export function AdminRoleCreatePage() {
  const [permissions, setPermissions] = useState<Permission[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApiGet<{ roles: unknown[]; permissions: Permission[] }>("/api/admin/roles").then((data) => {
      setPermissions(data.permissions)
      setLoading(false)
    })
  }, [])

  const groupedPermissions = useMemo(
    () => groupPermissions(permissions ?? []),
    [permissions],
  )

  if (loading) return <AdminLoadingState />

  return (
    <>
      <RoleForm
        mode="create"
        groupedPermissions={groupedPermissions}
        pageTitle="Create Role" />
    </>
  )
}

export function AdminRoleEditPage({ id }: { id: string }) {
  const [role, setRole] = useState<RolePayload | null>(null)
  const [permissions, setPermissions] = useState<Permission[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApiGet<{ role: RolePayload; permissions: Permission[] }>(`/api/admin/roles/${id}`),
      adminApiGet<{ roles: unknown[]; permissions: Permission[] }>("/api/admin/roles"),
    ]).then(([roleData, permissionsData]) => {
      setRole(roleData.role)
      setPermissions(permissionsData.permissions)
      setLoading(false)
    })
  }, [id])

  const groupedPermissions = useMemo(
    () => groupPermissions(permissions ?? []),
    [permissions],
  )

  const hydratedRole = useMemo(() => {
    if (!role || !permissions) return null
    return {
      ...role,
      permissions: permissions.filter((permission) => role.permissionIds.includes(permission.id)),
    }
  }, [permissions, role])

  if (loading) return <AdminLoadingState />
  if (!hydratedRole) return <main className="p-6">Role not found.</main>

  return (
    <>
      <RoleForm
        mode="edit"
        role={hydratedRole}
        groupedPermissions={groupedPermissions}
        pageTitle="Edit Role" />
    </>
  )
}
