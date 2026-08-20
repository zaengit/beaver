"use client" 

import { useState, useTransition } from "react"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zbeaver/beaver/ui/admin/components/ui/textarea"
import { AdminFormCard, AdminFormLayout, AdminFormMain, AdminFormSidebar } from "@zbeaver/beaver/ui/admin/layout/admin-form-layout"
import { adminApiPut } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { navigateToPath } from "@zbeaver/beaver/ui/admin/navigation"
import { adminToast } from "@zbeaver/beaver/ui/admin/shared/admin-toast"
import {
  AdminPageHeader,
} from "@zbeaver/beaver/ui/admin/layout/admin-page-shell"

// ─── Types ───────────────────────────────────────────────────────────────────

interface MediaData {
  id: string
  name: string
  fileName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl: string | null
  alt: string | null
  caption: string | null
  width: number | null
  height: number | null
  folder: string | null
  createdAt: number
  updatedAt: number
}

interface MediaFormProps {
  media: MediaData
  mode: "edit"
  pageTitle?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MediaForm({ media, mode, pageTitle }: MediaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [genericError, setGenericError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(media.name)
  const [alt, setAlt] = useState(media.alt ?? "")
  const [caption, setCaption] = useState(media.caption ?? "")
  const [folder, setFolder] = useState(media.folder ?? "")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGenericError(null)

    const input: Record<string, unknown> = {}
    if (name.trim()) input.name = name
    if (alt.trim()) input.alt = alt
    else input.alt = null
    if (caption.trim()) input.caption = caption
    else input.caption = null
    if (folder.trim()) input.folder = folder
    else input.folder = null

    startTransition(async () => {
      const result = await adminApiPut<MediaData>(`/api/admin/media/${media.id}`, input)

      if (result.success) {
        adminToast.success("update", "media")
        navigateToPath("/admin/media")
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

  const isImage = media.mimeType.startsWith("image/")

  return (
    <form onSubmit={handleSubmit} className="">
      <AdminPageHeader
        title={pageTitle || "Media"}
        actions={
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigateToPath("/admin/media")}
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
          <AdminFormCard title="Media details">
            {/* Editable fields */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="media-name">Name</Label>
                <Input id="media-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-error" : undefined} />
                {fieldErrors.name && <p id="name-error" className="text-xs text-destructive">{fieldErrors.name[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="media-alt">Alt Text</Label>
                <Input id="media-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image for accessibility" aria-invalid={!!fieldErrors.alt} aria-describedby={fieldErrors.alt ? "alt-error" : undefined} />
                {fieldErrors.alt && <p id="alt-error" className="text-xs text-destructive">{fieldErrors.alt[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="media-caption">Caption</Label>
                <Textarea id="media-caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" rows={3} aria-invalid={!!fieldErrors.caption} aria-describedby={fieldErrors.caption ? "caption-error" : undefined} />
                {fieldErrors.caption && <p id="caption-error" className="text-xs text-destructive">{fieldErrors.caption[0]}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="media-folder">Folder</Label>
                <Input id="media-folder" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Optional folder name" aria-invalid={!!fieldErrors.folder} aria-describedby={fieldErrors.folder ? "folder-error" : undefined} />
                {fieldErrors.folder && <p id="folder-error" className="text-xs text-destructive">{fieldErrors.folder[0]}</p>}
              </div>
            </div>
          </AdminFormCard>
        </AdminFormMain>
        <AdminFormSidebar>
          <AdminFormCard title="Preview">
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-sm border bg-muted">
              {isImage ? (
                <img
                  src={media.thumbnailUrl || media.url}
                  alt={alt || media.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p className="text-sm">{media.mimeType}</p>
                </div>
              )}
            </div>

            {/* File info (read-only) */}
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>File: {media.fileName}</p>
              <p>Type: {media.mimeType}</p>
              <p>Size: {formatFileSize(media.size)}</p>
              {media.width && media.height && (
                <p>Dimensions: {media.width} × {media.height}</p>
              )}
              <p>URL: <span className="font-mono">{media.url}</span></p>
            </div>
          </AdminFormCard>
        </AdminFormSidebar>
      </AdminFormLayout>
    </form>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
