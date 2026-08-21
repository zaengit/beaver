
import { useEffect } from "react"
import { BrowserRouter, useNavigate } from "react-router"
import { AdminSessionProvider } from "@zbeaver/beaver/ui/admin/auth/admin-session-provider"
import { AdminRouter } from "@zbeaver/beaver/ui/admin/core/admin-router"
import { Toaster } from "@zbeaver/beaver/ui/admin/components/ui/sonner"
import { setGlobalNavigator } from "@zbeaver/beaver/ui/admin/navigation"

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

export function AdminApp() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" closeButton />
      <NavigationTracker />
      <AdminSessionProvider>
        <AdminRouter />
      </AdminSessionProvider>
    </BrowserRouter>
  )
}
