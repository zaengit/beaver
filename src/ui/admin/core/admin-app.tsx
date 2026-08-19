
import { useEffect } from "react"
import { BrowserRouter, useNavigate } from "react-router"
import { AdminSessionProvider } from "@zaenpm/beaver/ui/admin/auth/admin-session-provider"
import { AdminRouter } from "@zaenpm/beaver/ui/admin/core/admin-router"
import { Toaster } from "@zaenpm/beaver/ui/admin/components/ui/sonner"
import { setGlobalNavigator } from "@zaenpm/beaver/ui/admin/navigation"

function NavigationTracker() {
  const navigate = useNavigate()

  useEffect(() => {
    setGlobalNavigator((url, options) => {
      navigate(url, { replace: options?.replace })
    })
    return () => {
      setGlobalNavigator(null)
    }
  }, [navigate])

  return null
}

export function AdminApp({ pathname: _initialPathname }: { pathname: string }) {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <NavigationTracker />
      <AdminSessionProvider>
        <AdminRouter />
      </AdminSessionProvider>
    </BrowserRouter>
  )
}
