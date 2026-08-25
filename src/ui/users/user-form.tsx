
import { useState, useTransition } from "react"

import { Button } from "@zbeaver/beaver/ui/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@zbeaver/beaver/ui/components/ui/select"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "@zbeaver/beaver/ui/layout/form-layout"
import { adminApiPost, adminApiPut } from "@zbeaver/beaver/ui/shared/api-client"
import { navigateToPath } from "@zbeaver/beaver/ui/navigation"
import { adminToast } from "@zbeaver/beaver/ui/shared/toast"
import { useAdminSession } from "@zbeaver/beaver/ui/auth/session-provider"
import {
  AdminPageHeader
} from "@zbeaver/beaver/ui/layout/page-shell"
import type { StaticRole, StaticRoleDefinition } from "@zbeaver/beaver/pkg/types/roles"

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserData {
  id: string
  name: string
  email: string
  role: StaticRole
  emailVerified: number
  createdAt: number
  updatedAt: number
  twoFactorEnabled?: boolean
}

interface UserFormProps {
  user?: UserData
  roles?: readonly StaticRoleDefinition[]
  mode: "create" | "edit"
  pageTitle?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserForm({ user, roles = [], mode, pageTitle }: UserFormProps) {
  const { session } = useAdminSession()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [genericError, setGenericError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<StaticRole>(user?.role ?? "author")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled === true)
  const assignableRoles = roles.filter((item) => item.slug !== "super-admin")
  const selectedRoleName = assignableRoles.find((item) => item.slug === role)?.name

  function handleDisableTwoFactor() {
    if (!user || !window.confirm(`Disable two-factor authentication for ${user.name}?`)) return

    startTransition(async () => {
      const result = await adminApiPost<{ enabled: false }>(`/api/admin/users/${user.id}/2fa/disable`)
      if (!result.success) {
        adminToast.error(result.message)
        return
      }

      setTwoFactorEnabled(false)
      adminToast.message("Two-factor authentication disabled.")
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGenericError(null)

    const input: Record<string, unknown> = {
      name,
      email,
    }
    if (password) input.password = password
    input.role = role

    startTransition(async () => {
      let result
      if (mode === "edit" && user) {
        result = await adminApiPut<UserData>(`/api/admin/users/${user.id}`, input)
      } else {
        result = await adminApiPost<UserData>("/api/admin/users", input)
      }

      if (result.success) {
        adminToast.success(mode === "edit" ? "update" : "create", "user")
        navigateToPath("/admin/users")
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setFieldErrors(result.errors)
          adminToast.error(result.message)
        } else {
          setGenericError(result.message)
          adminToast.error(result.message)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="">
      <AdminPageHeader
        title={pageTitle || "Users"}
        actions={
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? mode === "edit"
                  ? "Saving…"
                  : "Creating…"
                : mode === "edit"
                  ? "Save Changes"
                  : "Create User"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigateToPath("/admin/users")}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        }
      />
      {genericError && <div className="mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{genericError}</div>}
      <AdminFormLayout>
        <AdminFormMain>
          <AdminFormCard title="User details">
            <div className="grid gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                    maxLength={100}
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="text-xs text-destructive">
                      {fieldErrors.name[0]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="text-xs text-destructive">
                      {fieldErrors.email[0]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">
                    Password{" "}
                    {mode === "create" && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "edit"
                        ? "Leave blank to keep current"
                        : "Minimum 12 characters"
                    }
                    required={mode === "create"}
                    minLength={mode === "create" ? 12 : undefined}
                    maxLength={128}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  />
                  {fieldErrors.password && (
                    <p id="password-error" className="text-xs text-destructive">
                      {fieldErrors.password[0]}
                    </p>
                  )}
                </div>

            </div>
          </AdminFormCard>
        </AdminFormMain>
        <AdminFormSidebar>
          <AdminFormCard title="Organization">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              {assignableRoles.length > 0 ? (
                <Select value={role} onValueChange={(value) => { if (value && value !== "super-admin") setRole(value as StaticRole) }}>
                  <SelectTrigger id="role"><SelectValue placeholder="Select role">{selectedRoleName}</SelectValue></SelectTrigger>
                  <SelectContent>{assignableRoles.map((item) => <SelectItem key={item.slug} value={item.slug}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              ) : <p className="text-sm text-muted-foreground">No roles available.</p>}
              {fieldErrors.role && <p className="text-xs text-destructive">{fieldErrors.role[0]}</p>}
            </div>
          </AdminFormCard>
          {mode === "edit" && user ? (
            <AdminFormCard
              title="Two-factor authentication"
              description="Manage this user's authenticator requirement."
            >
              {user.role === "super-admin" ? (
                <p className="text-sm text-muted-foreground">
                  Super Admin 2FA is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET.
                </p>
              ) : user.id === session?.user.id ? (
                <p className="text-sm text-muted-foreground">
                  Manage your own 2FA from your Profile page.
                </p>
              ) : twoFactorEnabled ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication is enabled for this user.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDisableTwoFactor}
                    disabled={isPending}
                  >
                    {isPending ? "Disabling…" : "Disable 2FA"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication is not enabled for this user.
                </p>
              )}
            </AdminFormCard>
          ) : null}
        </AdminFormSidebar>
      </AdminFormLayout>
    </form>
  )
}
