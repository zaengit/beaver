
import { useEffect } from "react"
import { BrowserRouter, useNavigate } from "react-router"
import { AdminSessionProvider } from "zadm/ui/admin/auth/admin-session-provider"
import { AdminRouter } from "zadm/ui/admin/core/admin-router"
import { Toaster } from "zadm/ui/admin/components/ui/sonner"
import { setGlobalNavigator } from "zadm/ui/admin/navigation"

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
