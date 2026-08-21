
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

import { fetchAdminSession } from "@zbeaver/beaver/ui/admin/auth/auth-client"
import { setAdminForbiddenHandler, setAdminUnauthorizedHandler } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { ADMIN_PATH } from "@zbeaver/beaver/app/admin/admin-path"
import { navigateToPath } from "@zbeaver/beaver/ui/admin/navigation"

interface AdminSession {
  user: {
    id: string
    name: string
    email: string
    roleId: string | null
    emailVerified: number
    createdAt: number
    updatedAt: number
  }
  permissions: string[]
  roleName: string | null
}

const AdminSessionContext = createContext<{
  loading: boolean
  session: AdminSession | null
  setSession: (value: AdminSession | null) => void
  refreshSession: () => Promise<AdminSession | null>
}>({
  loading: true,
  session: null,
  setSession() {},
  async refreshSession() {
    return null
  },
})

/**
 * Interval (ms) untuk periodic session refresh di client.
 * 10 menit — artinya setiap 10 menit client akan panggil /session.
 * Karena access token expired 15 menit, interval 10 menit → token selalu
 * di-refresh sebelum habis (selama tab masih terbuka).
 */
const REFRESH_INTERVAL_MS = 10 * 60 * 1000

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<AdminSession | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const refreshSession = useCallback(async () => {
    const data = await fetchAdminSession()
    if (mountedRef.current) {
      setSession(data)
      // Jika session expired (null) — hentikan interval
      if (!data && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return data
  }, [])

  useEffect(() => {
    mountedRef.current = true

    setAdminUnauthorizedHandler(() => {
      if (!mountedRef.current) return

      setSession(null)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    })

    setAdminForbiddenHandler(() => {
      if (!mountedRef.current) return
      navigateToPath(`${ADMIN_PATH}/403`)
    })

    // Fetch awal
    refreshSession().finally(() => {
      if (mountedRef.current) setLoading(false)
    })

    // Periodic refresh — jaga access token tetap hidup
    intervalRef.current = setInterval(() => {
      refreshSession()
    }, REFRESH_INTERVAL_MS)

    return () => {
      mountedRef.current = false
      setAdminUnauthorizedHandler(null)
      setAdminForbiddenHandler(null)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [refreshSession])

  return (
    <AdminSessionContext.Provider value={{ loading, session, setSession, refreshSession }}>
      {children}
    </AdminSessionContext.Provider>
  )
}

export function useAdminSession() {
  return useContext(AdminSessionContext)
}
