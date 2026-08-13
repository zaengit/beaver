
import { lazy, Suspense, useEffect, useState, useTransition } from "react"

import { Button } from "zadm/ui/admin/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "zadm/ui/admin/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "zadm/ui/admin/components/ui/dialog"
import { Input } from "zadm/ui/admin/components/ui/input"
import { Label } from "zadm/ui/admin/components/ui/label"
import { AdminPageHeader } from "zadm/ui/admin/layout/admin-page-shell"
import { SectionEmbedder, type EmbeddedSection } from "zadm/ui/admin/sections/section-embedder"
import { adminApiPost, adminApiPut } from "zadm/ui/admin/shared/api-client"
import { adminToast } from "zadm/ui/admin/shared/admin-toast"
import { navigateToPath } from "zadm/ui/admin/navigation"
import { slugify } from "zadm/pkg/utils/slug"
import { Settings2 } from "lucide-react"

const TiptapEditor = lazy(async () => {
  const mod = await import("zadm/ui/admin/editor/tiptap-editor")
  return { default: mod.TiptapEditor }
})

export interface PageData {
  id: string
  title: string
  slug: string
  status: string
  description: string | null
  sections: string | null
}

interface PageFormProps {
  page?: PageData
  mode: "create" | "edit"
}

function parseSections(sections: string | null | undefined): EmbeddedSection[] {
  if (!sections) return []

  try {
    const parsed = JSON.parse(sections)
    if (!Array.isArray(parsed)) return []
    return parsed.map((section) => ({
      ...section,
      _instanceId:
        section._instanceId || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }))
  } catch {
    return []
  }
}

export function PageForm({ page, mode }: PageFormProps) {
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [genericError, setGenericError] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [title, setTitle] = useState(page?.title ?? "")
  const [slug, setSlug] = useState(page?.slug ?? "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!page?.slug)
  const [description, setDescription] = useState(page?.description ?? "")
  const [embeddedSections, setEmbeddedSections] = useState<EmbeddedSection[]>(() =>
    parseSections(page?.sections),
  )

  useEffect(() => {
    if (!slugManuallyEdited && mode === "create") setSlug(slugify(title))
  }, [title, slugManuallyEdited, mode])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setGenericError(null)

    const input: Record<string, unknown> = {
      title,
      type: "page",
      status: page?.status ?? "draft",
    }
    if (slug) input.slug = slug
    if (description.trim()) input.description = description
    if (embeddedSections.length > 0) {
      input.sections = embeddedSections.map(({ _instanceId, ...section }) => section)
    }

    startTransition(async () => {
      const result = mode === "edit" && page
        ? await adminApiPut<PageData>(`/api/admin/posts/${page.id}`, input)
        : await adminApiPost<PageData>("/api/admin/posts", input)

      if (result.success) {
        adminToast.success(mode === "edit" ? "update" : "create", "post")
        navigateToPath("/admin/posts/page")
        return
      }

      if (result.errors && Object.keys(result.errors).length > 0) {
        setFieldErrors(result.errors)
      } else {
        setGenericError(result.message)
      }
      adminToast.error(result.message)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="">
      <AdminPageHeader
        title={mode === "edit" ? "Edit Page" : "Create Page"}
        actions={
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? (mode === "edit" ? "Saving…" : "Creating…") : mode === "edit" ? "Save Changes" : "Create Page"}
            </Button>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger
                render={
                  <Button type="button" variant="outline" disabled={isPending}>
                    <Settings2 />
                    Settings
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Page Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="grid gap-5">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Page title" aria-invalid={!!fieldErrors.title} aria-describedby={fieldErrors.title ? "title-error" : undefined} />
                      {fieldErrors.title && <p id="title-error" className="text-xs text-destructive">{fieldErrors.title[0]}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="slug">Slug</Label>
                      <Input id="slug" value={slug} onChange={(event) => { setSlugManuallyEdited(true); setSlug(event.target.value) }} placeholder="page-url-slug" aria-invalid={!!fieldErrors.slug} aria-describedby={fieldErrors.slug ? "slug-error" : undefined} />
                      {fieldErrors.slug && <p id="slug-error" className="text-xs text-destructive">{fieldErrors.slug[0]}</p>}
                      {!slugManuallyEdited && mode === "create" && <p className="text-xs text-muted-foreground">Auto-generated from title. Edit to customize.</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Content</Label>
                    <Suspense fallback={<div className="min-h-64 rounded-sm border bg-muted/20" aria-busy="true" />}>
                      <TiptapEditor content={description} onChange={setDescription} placeholder="Write your page content here..." />
                    </Suspense>
                    {fieldErrors.description && <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="outline" />}>
                    Done
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button type="button" variant="outline" onClick={() => navigateToPath("/admin/posts/page")} disabled={isPending}>
              Cancel
            </Button>
          </div>
        }
      />
      <div className="space-y-4 p-4">
        {genericError && <div className="rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">{genericError}</div>}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader><CardTitle className="text-base">Sections</CardTitle></CardHeader>
          <CardContent className="">
            <SectionEmbedder embeddedSections={embeddedSections} onChange={setEmbeddedSections} />
            {fieldErrors.sections && <p className="mt-2 text-xs text-destructive">{fieldErrors.sections[0]}</p>}
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
