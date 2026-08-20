
import { useState } from "react"
import { useNavigate } from "react-router"

import { useAdminSession } from "@zbeaver/beaver/ui/admin/auth/admin-session-provider"
import { ADMIN_PATH } from "@zbeaver/beaver/app/admin/admin-path"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@zbeaver/beaver/ui/admin/components/ui/card"
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/admin/components/ui/label"

export function AdminLoginPage() {
  const { refreshSession } = useAdminSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      setError(body?.message || `Login failed (${response.status}).`)
      return
    }

    try {
      const session = await refreshSession()
      if (!session) {
        setError("Login berhasil, tetapi sesi tidak dapat diverifikasi. Silakan coba lagi.")
        return
      }

      navigate(ADMIN_PATH, { replace: true })
    } catch {
      setError("Sesi tidak dapat diverifikasi. Silakan coba lagi.")
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form className="w-full" onSubmit={onSubmit}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader><CardTitle>Login</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error ? <div className="rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
            <div className="space-y-1.5"><Label htmlFor="login-email">Email</Label><Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" /></div>
            <div className="space-y-1.5"><Label htmlFor="login-password">Password</Label><Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /></div>
            <Button className="w-full" type="submit">Sign in</Button>
          </CardContent>
        </Card>
      </form>
    </main>
  )
}
