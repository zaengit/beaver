
import { useState, useTransition } from "react"
import { useNavigate } from "react-router"
import { Loader2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/components/ui/label"
import { adminApiPost, adminApiPut } from "@zbeaver/beaver/ui/shared/api-client"
import { adminToast } from "@zbeaver/beaver/ui/shared/toast"
import { useAdminSession } from "@zbeaver/beaver/ui/auth/session-provider"
import { AdminPageHeader } from "@zbeaver/beaver/ui/layout/page-shell"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "@zbeaver/beaver/ui/layout/form-layout"

export function AdminProfilePage() {
  const navigate = useNavigate()
  const { session, refreshSession, setSession } = useAdminSession()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [disablePassword, setDisablePassword] = useState("")
  const [disableCode, setDisableCode] = useState("")

  const user = session?.user
  const isEnvironmentManaged = user?.role === "super-admin"

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    startTransition(async () => {
      const payload: Record<string, string> = { name, email }
      if (password) {
        payload.password = password
      }

      const result = await adminApiPut<{
        id: string
        name: string
        email: string
        role: string
        emailVerified: number
        createdAt: number
        updatedAt: number
      }>("/api/admin/auth/profile", payload)

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors)
        } else {
          setErrors({ _form: [result.message] })
        }
        adminToast.error(result.message)
        return
      }

      // Refresh session to update sidebar/header with new name
      await refreshSession()
      adminToast.success("update", "profile")
    })
  }

  function leaveAfterTwoFactorChange() {
    setSession(null)
    navigate("/admin/login", { replace: true })
  }

  function handleTwoFactorSetup() {
    startTransition(async () => {
      const result = await adminApiPost<{ secret: string; otpauthUrl: string }>("/api/admin/auth/2fa/setup")
      if (!result.success) {
        adminToast.error(result.message)
        return
      }

      setTwoFactorSetup(result.data)
      setTwoFactorCode("")
    })
  }

  function handleTwoFactorEnable() {
    startTransition(async () => {
      const result = await adminApiPost<{ enabled: true }>("/api/admin/auth/2fa/enable", { code: twoFactorCode })
      if (!result.success) {
        adminToast.error(result.message)
        return
      }

      adminToast.message("Two-factor authentication enabled.")
      leaveAfterTwoFactorChange()
    })
  }

  function handleTwoFactorDisable() {
    startTransition(async () => {
      const result = await adminApiPost<{ enabled: false }>("/api/admin/auth/2fa/disable", {
        password: disablePassword,
        code: disableCode,
      })
      if (!result.success) {
        adminToast.error(result.message)
        return
      }

      adminToast.message("Two-factor authentication disabled.")
      leaveAfterTwoFactorChange()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="">
      <AdminPageHeader
        title="Profile"
        actions={
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending || isEnvironmentManaged}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        }
      />

      <AdminFormLayout>
        <AdminFormMain>
          <AdminFormCard
            title="Account information"
            description={isEnvironmentManaged
              ? "Super Admin is managed by ADMIN_EMAIL and ADMIN_NAME."
              : "Update your name and email."}
          >
            {/* Form-level error */}
            {errors._form && (
              <div className="rounded-sm bg-destructive/10 p-3 text-sm text-destructive">
                {errors._form[0]}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-name"
                name="name"
                defaultValue={user?.name ?? ""}
                placeholder="Full name"
                required
                maxLength={100}
                disabled={isEnvironmentManaged}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name[0]}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-email"
                name="email"
                type="email"
                defaultValue={user?.email ?? ""}
                placeholder="user@example.com"
                required
                disabled={isEnvironmentManaged}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email[0]}</p>
              )}
            </div>

          </AdminFormCard>
        </AdminFormMain>
        <AdminFormSidebar>
          <AdminFormCard
            title="Password"
            description={isEnvironmentManaged
              ? "Super Admin password is managed by ADMIN_PASSWORD."
              : "Leave empty to keep your current password."}
          >
            <div className="space-y-1.5">
              <Label htmlFor="profile-password">New Password</Label>
              <Input
                id="profile-password"
                name="password"
                type="password"
                placeholder="Leave blank to keep current"
                minLength={12}
                maxLength={128}
                disabled={isEnvironmentManaged}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password[0]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 12 characters. Leave empty to keep your current password.
              </p>
            </div>
          </AdminFormCard>
          <AdminFormCard
            title="Two-factor authentication"
            description={isEnvironmentManaged
              ? "Super Admin 2FA is managed by environment variables."
              : "Protect admin sign-in with a code from an authenticator app."}
          >
            {isEnvironmentManaged ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {session?.twoFactorEnabled
                    ? "Super Admin 2FA is enabled and is not stored in the users database."
                    : "Configure TOTP outside the admin panel so the Super Admin remains environment-managed."}
                </p>
                {session?.twoFactorEnabled ? (
                  <p className="text-xs text-muted-foreground">
                    To disable it, set ADMIN_2FA_ENABLED=false and restart the application.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Run <code>npx @zbeaver/beaver 2fa:setup</code>, copy the generated values to the application environment, and restart.
                    </p>
                    <code className="block rounded-sm bg-muted px-2 py-1 text-xs">
                      ADMIN_2FA_ENABLED=true<br />
                      ADMIN_2FA_SECRET=…
                    </code>
                  </>
                )}
              </div>
            ) : session?.twoFactorEnabled ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Two-factor authentication is enabled for this account.</p>
                <div className="space-y-1.5">
                  <Label htmlFor="disable-2fa-password">Current password</Label>
                  <Input
                    id="disable-2fa-password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Current password"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="disable-2fa-code">Authenticator code</Label>
                  <Input
                    id="disable-2fa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    disabled={isPending}
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleTwoFactorDisable} disabled={isPending}>
                  Disable 2FA
                </Button>
              </div>
            ) : twoFactorSetup ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app, or enter the secret manually.</p>
                <div className="flex justify-center rounded-sm bg-white p-3">
                  <QRCodeSVG
                    value={twoFactorSetup.otpauthUrl}
                    size={192}
                    level="M"
                    includeMargin
                    aria-label="Two-factor authentication setup QR code"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Manual secret</p>
                <code className="block break-all rounded-sm bg-muted px-2 py-1 text-xs">{twoFactorSetup.secret}</code>
                <a className="text-sm text-primary underline underline-offset-4" href={twoFactorSetup.otpauthUrl}>
                  Open in authenticator app
                </a>
                <div className="space-y-1.5">
                  <Label htmlFor="enable-2fa-code">Authenticator code</Label>
                  <Input
                    id="enable-2fa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    disabled={isPending}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleTwoFactorEnable} disabled={isPending}>
                    Enable 2FA
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setTwoFactorSetup(null)} disabled={isPending}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" onClick={handleTwoFactorSetup} disabled={isPending}>
                Set up 2FA
              </Button>
            )}
          </AdminFormCard>
        </AdminFormSidebar>
      </AdminFormLayout>
    </form>
  )
}
