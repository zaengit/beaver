
import { useEffect, useState } from "react"
import { adminApiGet } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import { UserForm } from "@zbeaver/beaver/ui/admin/users/user-form"
import type { AdminRole, AdminUser } from "@zbeaver/beaver/ui/admin/shared/admin-data"

export function AdminUserCreatePage() {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApiGet<{ roles: AdminRole[] }>("/api/admin/roles").then((data) => {
      setRoles(data.roles)
      setLoading(false)
    })
  }, [])

  if (loading) return <AdminLoadingState />

  return (
    <>
      <UserForm
        mode="create"
        roles={roles}
        pageTitle="Create User"
      />
    </>
  )
}

export function AdminUserEditPage({ id }: { id: string }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApiGet<AdminUser>(`/api/admin/users/${id}`),
      adminApiGet<{ roles: AdminRole[] }>("/api/admin/roles"),
    ]).then(([userData, roleData]) => {
      setUser(userData)
      setRoles(roleData.roles)
      setLoading(false)
    })
  }, [id])

  if (loading) return <AdminLoadingState />
  if (!user) return <main className="p-6">User not found.</main>

  return (
    <>
      <UserForm
        mode="edit"
        user={user}
        roles={roles}
        pageTitle="Edit User"
      />
    </>
  )
}
