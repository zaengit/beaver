
import { useEffect, useState, useTransition } from "react"
import { Button } from "@zaenpm/beaver/ui/admin/components/ui/button"
import { Input } from "@zaenpm/beaver/ui/admin/components/ui/input"
import { Label } from "@zaenpm/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zaenpm/beaver/ui/admin/components/ui/textarea"
import { adminApiPost, adminApiPut } from "@zaenpm/beaver/ui/admin/shared/api-client"
import { MediaPicker } from "@zaenpm/beaver/ui/admin/shared/media-picker"
import { navigateToPath } from "@zaenpm/beaver/ui/admin/navigation"
import { slugify } from "@zaenpm/beaver/pkg/utils/slug"
import { adminToast } from "@zaenpm/beaver/ui/admin/shared/admin-toast"
import { useAdminSession } from "@zaenpm/beaver/ui/admin/auth/admin-session-provider"
import {
  AdminPageHeader,
} from "@zaenpm/beaver/ui/admin/layout/admin-page-shell"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "@zaenpm/beaver/ui/admin/layout/admin-form-layout"

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryData {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  image: string | null
  status: "draft" | "published"
}

interface CategoryFormProps {
  category?: CategoryData
  mode: "create" | "edit"
  pageTitle?: string
  defaultType?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CategoryForm({ category, mode, pageTitle, defaultType }: CategoryFormProps) {
  const { session } = useAdminSession()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [genericError, setGenericError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(category?.name ?? "")
  const [slug, setSlug] = useState(category?.slug ?? "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!category?.slug)
  const [type, setType] = useState(category?.type ?? defaultType ?? "post")
  const [description, setDescription] = useState(category?.description ?? "")
  const [imageUrl, setImageUrl] = useState(category?.image ?? "")
  const [status, setStatus] = useState<"draft" | "published">(category?.status ?? "published")
  const hasPublishPermission = session?.permissions.includes(`category.${type}.publish`) ?? false
  const hasUnpublishPermission = session?.permissions.includes(`category.${type}.unpublish`) ?? false
  const canChangeStatus = status === "published" ? hasUnpublishPermission : hasPublishPermission

  useEffect(() => {
    if (mode === "create" && !hasPublishPermission) setStatus("draft")
  }, [hasPublishPermission, mode])

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && mode === "create") {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited, mode])

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setSlug(value)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGenericError(null)

    const input: Record<string, unknown> = {
      name,
      type,
      status,
    }
    if (description.trim()) input.description = description
    if (imageUrl) input.image = imageUrl
    else input.image = null
    if (slug) input.slug = slug

    startTransition(async () => {
      let result
      if (mode === "edit" && category) {
        result = await adminApiPut<CategoryData>(`/api/admin/categories/${category.id}`, input)
      } else {
        result = await adminApiPost<CategoryData>("/api/admin/categories", input)
      }

      if (result.success) {
        adminToast.success(mode === "edit" ? "update" : "create", "category")
        navigateToPath(`/admin/categories/${type}`)
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
        title={pageTitle || "Categories"}
        actions={
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? mode === "edit"
                  ? "Saving…"
                  : "Creating…"
                : mode === "edit"
                  ? "Save Changes"
                  : "Create Category"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigateToPath(`/admin/categories/${type}`)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        }
      />

      {genericError && (
        <div className="mx-4 rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {genericError}
        </div>
      )}
      <AdminFormLayout>
        <AdminFormMain>
          <AdminFormCard title="Basic information">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Category name"
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
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="category-url-slug"
                    aria-invalid={!!fieldErrors.slug}
                    aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
                  />
                  {fieldErrors.slug && (
                    <p id="slug-error" className="text-xs text-destructive">
                      {fieldErrors.slug[0]}
                    </p>
                  )}
                  {!slugManuallyEdited && mode === "create" && (
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from name. Edit to customize.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={4}
                    aria-invalid={!!fieldErrors.description}
                    aria-describedby={fieldErrors.description ? "description-error" : undefined}
                  />
                  {fieldErrors.description && (
                    <p id="description-error" className="text-xs text-destructive">
                      {fieldErrors.description[0]}
                    </p>
                  )}
                </div>
          </AdminFormCard>
        </AdminFormMain>
        <AdminFormSidebar>
          <AdminFormCard title="Status">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Visibility</Label>
              <select id="status" value={status} disabled={!canChangeStatus} onChange={(event) => setStatus(event.target.value as "draft" | "published")} className="h-9 rounded-sm border bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                <option value="published" disabled={!hasPublishPermission && status !== "published"}>Published</option>
                <option value="draft" disabled={!hasUnpublishPermission && status !== "draft"}>Unpublished</option>
              </select>
              {!canChangeStatus && <p className="text-xs text-muted-foreground">Your role cannot change this status.</p>}
            </div>
          </AdminFormCard>
          <AdminFormCard title="Image">
              <div className="rounded-sm border border-dashed bg-muted/30 p-4">
                  <div className="flex items-start gap-4">
                    {imageUrl ? (
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted">
                        <img
                          src={imageUrl}
                          alt="Category image preview"
                          className="object-cover h-full w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed bg-background text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <MediaPicker
                        key={imageUrl || "empty"}
                        value={imageUrl || null}
                        onChange={(media) => {
                          setImageUrl(media ? media.url : "")
                        }}
                        accept="image/*"
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose an image from the media library.
                      </p>
                      {imageUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label="Remove image"
                          className="w-fit text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setImageUrl("")}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {fieldErrors.image && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.image[0]}
                  </p>
                )}
          </AdminFormCard>
        </AdminFormSidebar>
      </AdminFormLayout>
    </form>
  )
}
