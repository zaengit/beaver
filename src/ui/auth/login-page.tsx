
import { useState } from "react"
import { useNavigate } from "react-router"

import { useAdminSession } from "@zbeaver/beaver/ui/auth/session-provider"
import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@zbeaver/beaver/ui/components/ui/card"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/components/ui/label"

export function AdminLoginPage() {
  const { refreshSession } = useAdminSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const response = await fetch(
      requiresTwoFactor ? "/api/admin/auth/2fa/verify" : "/api/admin/auth/login",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requiresTwoFactor ? { code: twoFactorCode } : { email, password }),
      },
    )

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      setError(body?.message || `Login failed (${response.status}).`)
      return
    }

    const body = await response.json().catch(() => null)
    if (!requiresTwoFactor && body?.data?.requiresTwoFactor) {
      setRequiresTwoFactor(true)
      setTwoFactorCode("")
      return
    }

    try {
      const session = await refreshSession()
      if (!session) {
        setError("Login succeeded, but the session could not be verified. Please try again.")
        return
      }

      navigate("/admin", { replace: true })
    } catch {
      setError("The session could not be verified. Please try again.")
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form className="w-full" onSubmit={onSubmit}>
        <Card className="border-border/60 shadow-sm">
          <CardHeader><CardTitle>{requiresTwoFactor ? "Verify your identity" : "Log in"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error ? <div className="rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div> : null}
            {requiresTwoFactor ? (
              <>
                <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
                <div className="space-y-1.5">
                  <Label htmlFor="login-2fa-code">Verification code</Label>
                  <Input
                    id="login-2fa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    autoFocus
                  />
                </div>
                <Button className="w-full" type="submit">Verify and continue</Button>
                <Button className="w-full" type="button" variant="outline" onClick={() => { setRequiresTwoFactor(false); setError("") }}>Use another account</Button>
              </>
            ) : (
              <>
                <div className="space-y-1.5"><Label htmlFor="login-email">Email address</Label><Input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
                <div className="space-y-1.5"><Label htmlFor="login-password">Password</Label><Input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /></div>
                <Button className="w-full" type="submit">Log in</Button>
              </>
            )}
          </CardContent>
        </Card>
      </form>
    </main>
  )
}
