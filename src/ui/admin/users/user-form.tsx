
import { useState, useTransition } from "react"

import { Button } from "zadm/ui/admin/components/ui/button"
import { Input } from "zadm/ui/admin/components/ui/input"
import { Label } from "zadm/ui/admin/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "zadm/ui/admin/components/ui/select"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "zadm/ui/admin/layout/admin-form-layout"
import { adminApiPost, adminApiPut } from "zadm/ui/admin/shared/api-client"
import { navigateToPath } from "zadm/ui/admin/navigation"
import { adminToast } from "zadm/ui/admin/shared/admin-toast"
import {
  AdminPageHeader
} from "zadm/ui/admin/layout/admin-page-shell"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Role {
  id: string
  name: string
  slug: string
}

interface UserData {
  id: string
  name: string
  email: string
  roleId: string | null
  emailVerified: number
  createdAt: number
  updatedAt: number
}

interface UserFormProps {
  user?: UserData
  roles?: Role[]
  mode: "create" | "edit"
  pageTitle?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserForm({ user, roles = [], mode, pageTitle }: UserFormProps) {
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [genericError, setGenericError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState(user?.roleId ?? "")
  const selectedRoleName = roles.find((role) => role.id === roleId)?.name

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGenericError(null)

    const input: Record<string, unknown> = {
      name,
      email,
    }
    if (password) input.password = password
    if (roleId) input.roleId = roleId

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
                        : "Minimum 8 characters"
                    }
                    required={mode === "create"}
                    minLength={mode === "create" ? 8 : undefined}
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
              {roles.length > 0 ? (
                <Select value={roleId || "none"} onValueChange={(val) => setRoleId(val === "none" || !val ? "" : val)}>
                  <SelectTrigger id="role"><SelectValue placeholder="Select role">{selectedRoleName ?? (roleId ? "No role" : undefined)}</SelectValue></SelectTrigger>
                  <SelectContent><SelectItem value="none">No role</SelectItem>{roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectContent>
                </Select>
              ) : <p className="text-sm text-muted-foreground">No roles available.</p>}
              {fieldErrors.roleId && <p className="text-xs text-destructive">{fieldErrors.roleId[0]}</p>}
            </div>
          </AdminFormCard>
        </AdminFormSidebar>
      </AdminFormLayout>
    </form>
  )
}
