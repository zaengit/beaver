
import { useEffect, useState } from "react"
import { adminApiGet } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import { UserForm } from "@zbeaver/beaver/ui/admin/users/user-form"

export function AdminUserCreatePage() {
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApiGet<{ roles: any[] }>("/api/admin/roles").then((data) => {
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
  const [user, setUser] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApiGet<any>(`/api/admin/users/${id}`),
      adminApiGet<{ roles: any[] }>("/api/admin/roles"),
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
