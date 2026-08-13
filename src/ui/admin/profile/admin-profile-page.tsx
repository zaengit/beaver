
import { useState, useTransition } from "react"
import { useNavigate } from "react-router"
import { Loader2 } from "lucide-react"

import { Button } from "zadm/ui/admin/components/ui/button"
import { Input } from "zadm/ui/admin/components/ui/input"
import { Label } from "zadm/ui/admin/components/ui/label"
import { adminApiPut } from "zadm/ui/admin/shared/api-client"
import { adminToast } from "zadm/ui/admin/shared/admin-toast"
import { useAdminSession } from "zadm/ui/admin/auth/admin-session-provider"
import { AdminPageHeader } from "zadm/ui/admin/layout/admin-page-shell"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "zadm/ui/admin/layout/admin-form-layout"

export function AdminProfilePage() {
  const navigate = useNavigate()
  const { session, refreshSession } = useAdminSession()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const user = session?.user

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
        roleId: string | null
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

  return (
    <form onSubmit={handleSubmit} className="">
      <AdminPageHeader
        title="Profile"
        actions={
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
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
          <AdminFormCard title="Account information" description="Update your name and email.">
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
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email[0]}</p>
              )}
            </div>

          </AdminFormCard>
        </AdminFormMain>
        <AdminFormSidebar>
          <AdminFormCard title="Password" description="Leave empty to keep your current password.">
            <div className="space-y-1.5">
              <Label htmlFor="profile-password">New Password</Label>
              <Input
                id="profile-password"
                name="password"
                type="password"
                placeholder="Leave blank to keep current"
                minLength={8}
                maxLength={128}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password[0]}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters. Leave empty to keep your current password.
              </p>
            </div>
          </AdminFormCard>
        </AdminFormSidebar>
      </AdminFormLayout>
    </form>
  )
}
