
import { useEffect, useState } from "react"
import { adminApiGet } from "@zbeaver/beaver/ui/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import { UserForm } from "@zbeaver/beaver/ui/users/user-form"
import { STATIC_ROLES } from "@zbeaver/beaver/pkg/types/roles"
import type { AdminUser } from "@zbeaver/beaver/ui/shared/data"

const ASSIGNABLE_ROLES = STATIC_ROLES.filter((role) => role.slug !== "super-admin")

export function AdminUserCreatePage() {
  return (
    <UserForm mode="create" roles={ASSIGNABLE_ROLES} pageTitle="Create User" />
  )
}

export function AdminUserEditPage({ id }: { id: string }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApiGet<AdminUser>(`/api/admin/users/${id}`).then((userData) => {
      setUser(userData)
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
        roles={ASSIGNABLE_ROLES}
        pageTitle="Edit User"
      />
    </>
  )
}
