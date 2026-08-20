
import { Navigate } from "react-router"

import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import { useAdminSession } from "@zbeaver/beaver/ui/admin/auth/admin-session-provider"

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { loading, session } = useAdminSession()

  if (loading) return <AdminLoadingState />
  if (!session) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
