
import { lazy, Suspense, useEffect, useState, useTransition } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@zaenpm/beaver/ui/admin/components/ui/button"
import { Input } from "@zaenpm/beaver/ui/admin/components/ui/input"
import { Label } from "@zaenpm/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zaenpm/beaver/ui/admin/components/ui/textarea"
import { Badge } from "@zaenpm/beaver/ui/admin/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@zaenpm/beaver/ui/admin/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zaenpm/beaver/ui/admin/components/ui/card"
import { adminApiPost, adminApiPut } from "@zaenpm/beaver/ui/admin/shared/api-client"
import { navigateToPath } from "@zaenpm/beaver/ui/admin/navigation"
import { slugify } from "@zaenpm/beaver/pkg/utils/slug"
import { ContentTypeFieldsRenderer } from "@zaenpm/beaver/ui/admin/posts/content-type-fields-renderer"
import { SectionEmbedder, type EmbeddedSection } from "@zaenpm/beaver/ui/admin/sections/section-embedder"
import { getContentTypeRegistry } from "@zaenpm/beaver/app/registry/content-types"
import { MediaPicker } from "@zaenpm/beaver/ui/admin/shared/media-picker"
import { MultiSelect } from "@zaenpm/beaver/ui/admin/components/ui/multi-select"
import { adminToast } from "@zaenpm/beaver/ui/admin/shared/admin-toast"
import { useAdminSession } from "@zaenpm/beaver/ui/admin/auth/admin-session-provider"
import type { AdminToastEntity } from "@zaenpm/beaver/ui/admin/shared/admin-toast"
import {
  AdminPageHeader
} from "@zaenpm/beaver/ui/admin/layout/admin-page-shell"

const TiptapEditor = lazy(async () => {
  const mod = await import("@zaenpm/beaver/ui/admin/editor/tiptap-editor")
  return { default: mod.TiptapEditor }
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
  type: string
}

interface PostData {
  id: string
  title: string
  slug: string
  type: string
  status: string
  excerpt: string | null
  description: string | null
  tags: string | null
  sections: string | null
  metaTitle: string | null
  metaDescription: string | null
  featuredImage: string | null
  gallery: string | null
  publishedAt: number | null
  categories?: Category[]
  customFieldValues?: string | null
}

interface PostFormProps {
  post?: PostData
  categories?: Category[]
  mode: "create" | "edit"
  pageTitle?: string
  defaultType?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PostForm({ post, categories = [], mode, pageTitle, defaultType }: PostFormProps) {
  const { session } = useAdminSession()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [genericError, setGenericError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState(post?.title ?? "")
  const [visibility, setVisibility] = useState<"published" | "draft">(post?.status === "published" ? "published" : "draft")
  const [publishedAt, setPublishedAt] = useState<number | null>(post?.publishedAt ?? null)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const isScheduled = visibility === "published" && !!publishedAt && publishedAt > Date.now()
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!post?.slug)
  const [type, setType] = useState(post?.type ?? defaultType ?? "post")
  const canPublish = session?.permissions.includes(`content.${type}.publish`) ?? false
  const canUnpublish = session?.permissions.includes(`content.${type}.unpublish`) ?? false
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [description, setDescription] = useState(post?.description ?? "")
  const [tagsInput, setTagsInput] = useState(() => {
    if (post?.tags) {
      try {
        const parsed = JSON.parse(post.tags)
        return Array.isArray(parsed) ? parsed.join(", ") : ""
      } catch {
        return ""
      }
    }
    return ""
  })
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
    return post?.categories?.map((c) => c.id) ?? []
  })
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "")
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "")
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage ?? "")
  const [gallery, setGallery] = useState<string[]>(() => {
    if (!post?.gallery) return []
    try {
      const parsed = JSON.parse(post.gallery)
      return Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : []
    } catch {
      return []
    }
  })
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>(() => {
    if (post?.customFieldValues) {
      try {
        return JSON.parse(post.customFieldValues)
      } catch {
        return {}
      }
    }
    return {}
  })
  const [embeddedSections, setEmbeddedSections] = useState<EmbeddedSection[]>(() => {
    if (post?.sections) {
      try {
        const parsed = JSON.parse(post.sections)
        const sections = Array.isArray(parsed) ? parsed : []
        return sections.map((s: any) => ({
          ...s,
          _instanceId: s._instanceId || `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        }))
      } catch {
        return []
      }
    }
    return []
  })
  const [sectionsEnabled, setSectionsEnabled] = useState(false)
  const [detailTemplate, setDetailTemplate] = useState<string | null>(null)
  const gallerySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && mode === "create") {
      setSlug(slugify(title))
    }
  }, [title, slugManuallyEdited, mode])

  useEffect(() => {
    const registry = getContentTypeRegistry()
    let cancelled = false

    const detailTemplate = registry.contentTypes.find((contentType) => contentType.slug === type)?.detailTemplate
    if (!cancelled) {
      setDetailTemplate(detailTemplate ?? null)
      setSectionsEnabled(detailTemplate ? registry.templates.find((template) => template.id === detailTemplate && template.kind === "detail")?.sectionsEnabled === true : false)
    }

    return () => { cancelled = true }
  }, [type])

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setSlug(value)
  }

  function handleGalleryDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setGallery((prev) => {
      const oldIndex = prev.indexOf(String(active.id))
      const newIndex = prev.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})
    setGenericError(null)

    // Tags: parse comma-separated into array
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
    const input: Record<string, unknown> = {
      title,
      type,
      status: visibility,
    }
    if (excerpt.trim()) input.excerpt = excerpt
    if (description.trim()) input.description = description
    if (metaTitle.trim()) input.metaTitle = metaTitle
    if (metaDescription.trim()) input.metaDescription = metaDescription
    if (featuredImage.trim()) input.featuredImage = featuredImage
    if (slug) input.slug = slug
    if (tags.length > 0) input.tags = tags
    if (selectedCategoryIds.length > 0) input.categoryIds = selectedCategoryIds
    if (Object.keys(customFieldValues).length > 0) input.customFieldValues = customFieldValues
    if (embeddedSections.length > 0) {
      input.sections = embeddedSections.map(({ _instanceId, ...rest }) => rest)
    }
    if (gallery.length > 0) input.gallery = gallery
    if (visibility === "published" && publishedAt) input.publishedAt = publishedAt

    startTransition(async () => {
      let result
      if (mode === "edit" && post) {
        result = await adminApiPut<PostData>(`/api/admin/posts/${post.id}`, input)
      } else {
        result = await adminApiPost<PostData>("/api/admin/posts", input)
      }

      if (result.success) {
        adminToast.success(mode === "edit" ? "update" : "create", type as AdminToastEntity)
        navigateToPath(`/admin/posts/${type}`)
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
          title={pageTitle || "Projects"}
          actions={
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? mode === "edit"
                    ? "Saving…"
                    : "Creating…"
                  : mode === "edit"
                    ? "Save Changes"
                    : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigateToPath("/admin/posts")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          }
        />
        <div className="p-4 space-y-4">
          <div className="space-y-4">
          {genericError && (
            <div className="rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {genericError}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]">
            <div className="space-y-4">
              <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="">
                  <CardTitle className="text-base">{type.charAt(0).toUpperCase() + type.slice(1)} Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-5">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} title`}
                        aria-invalid={!!fieldErrors.title}
                        aria-describedby={fieldErrors.title ? "title-error" : undefined}
                      />
                      {fieldErrors.title && (
                        <p id="title-error" className="text-xs text-destructive">
                          {fieldErrors.title[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder={`${type}-url-slug`}
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
                          Auto-generated from title. Edit to customize.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                          id="excerpt"
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder={`Brief summary of the ${type}...`}
                          rows={3}
                          aria-invalid={!!fieldErrors.excerpt}
                          aria-describedby={fieldErrors.excerpt ? "excerpt-error" : undefined}
                        />
                        {fieldErrors.excerpt && (
                          <p id="excerpt-error" className="text-xs text-destructive">
                            {fieldErrors.excerpt[0]}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Content</Label>
                    <Suspense
                      fallback={
                        <div className="min-h-64 rounded-sm border bg-muted/20" aria-busy="true" />
                      }
                    >
                      <TiptapEditor
                        content={description}
                        onChange={setDescription}
                        placeholder={`Write your ${type} content here...`}
                      />
                    </Suspense>
                    {fieldErrors.description && (
                      <p className="text-xs text-destructive">
                        {fieldErrors.description[0]}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                      <Label htmlFor="gallery">Gallery</Label>
                      <div className="rounded-sm border border-dashed bg-muted/30 p-4 space-y-3">
                        <MediaPicker
                          value={gallery[0] ?? null}
                          onChange={(media) => {
                            if (!media) {
                              setGallery([])
                              return
                            }
                            setGallery((prev) => [media.url, ...prev.filter((url) => url !== media.url)])
                          }}
                          onSelect={(media) => {
                            setGallery((prev) => {
                              const next = [...prev]
                              for (const item of media) {
                                if (!next.includes(item.url)) {
                                  next.push(item.url)
                                }
                              }
                              return next
                            })
                          }}
                          accept="image/*"
                          multiple
                          maxFiles={20}
                          trigger={
                            <Button type="button" variant="outline" className="gap-2">
                              Add Media
                            </Button>
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Add multiple images and reorder them visually. Stored as JSON.
                        </p>
                        {gallery.length > 0 && (
                          <DndContext
                            sensors={gallerySensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleGalleryDragEnd}
                          >
                            <SortableContext items={gallery} strategy={rectSortingStrategy}>
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
                                {gallery.map((url) => (
                                  <GalleryItem
                                    key={url}
                                    url={url}
                                    onRemove={() =>
                                      setGallery((prev) => prev.filter((item) => item !== url))
                                    }
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}
                      </div>
                      {fieldErrors.gallery && (
                        <p className="text-xs text-destructive">
                          {fieldErrors.gallery[0]}
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="">
                  <CardTitle className="text-base">SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="SEO title (max 60 characters)"
                      maxLength={60}
                      aria-invalid={!!fieldErrors.metaTitle}
                      aria-describedby={fieldErrors.metaTitle ? "metaTitle-error" : undefined}
                    />
                    <div className="flex justify-between">
                      {fieldErrors.metaTitle ? (
                        <p id="metaTitle-error" className="text-xs text-destructive">
                          {fieldErrors.metaTitle[0]}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {metaTitle.length}/60
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="SEO description (max 160 characters)"
                      maxLength={160}
                      rows={4}
                      aria-invalid={!!fieldErrors.metaDescription}
                      aria-describedby={
                        fieldErrors.metaDescription ? "metaDescription-error" : undefined
                      }
                    />
                    <div className="flex justify-between">
                      {fieldErrors.metaDescription ? (
                        <p id="metaDescription-error" className="text-xs text-destructive">
                          {fieldErrors.metaDescription[0]}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {metaDescription.length}/160
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {sectionsEnabled && (
                <Card className="overflow-hidden border-border/60 shadow-sm">
                  <CardHeader className="">
                    <CardTitle className="text-base">Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="">
                    <SectionEmbedder
                      embeddedSections={embeddedSections}
                      onChange={setEmbeddedSections}
                    />
                    {fieldErrors.sections && (
                      <p className="text-xs text-destructive mt-2">
                        {fieldErrors.sections[0]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
                <Card className="overflow-hidden border-border/60 shadow-sm"><CardHeader><CardTitle className="text-base">Visibility</CardTitle></CardHeader><CardContent className="space-y-3"><button type="button" disabled={!canPublish} className="flex items-center gap-2 text-sm disabled:opacity-50" onClick={() => { setVisibility("published"); setPublishedAt(null) }}><span className={`size-4 rounded-full border-4 ${visibility === "published" && !isScheduled ? "border-foreground" : "border-transparent ring-1 ring-border"}`} />Publish</button><button type="button" disabled={!canUnpublish} className="flex items-center gap-2 text-sm disabled:opacity-50" onClick={() => { setVisibility("draft"); setPublishedAt(null) }}><span className={`size-4 rounded-full border-4 ${visibility === "draft" || isScheduled ? "border-foreground" : "border-transparent ring-1 ring-border"}`} />Draft</button>{isScheduled ? <div className="ml-6 flex items-start justify-between gap-2 text-sm text-muted-foreground"><span>Will publish on {new Date(publishedAt!).toLocaleString()}</span><div className="flex"><Button type="button" variant="ghost" size="icon-sm" aria-label="Edit publish date" disabled={!canPublish} onClick={() => setIsScheduleOpen(true)}><Pencil /></Button><Button type="button" variant="ghost" size="icon-sm" aria-label="Remove publish date" disabled={!canUnpublish} onClick={() => { setVisibility("draft"); setPublishedAt(null) }}><Trash2 /></Button></div></div> : <Button type="button" variant="ghost" size="sm" className="ml-5" disabled={!canPublish} onClick={() => setIsScheduleOpen(true)}>Schedule publish</Button>}</CardContent></Card>
                <Card className="overflow-hidden border-border/60 shadow-sm">
                  <CardHeader><CardTitle className="text-base">Image</CardTitle></CardHeader>
                  <CardContent className="space-y-5">
                  <div className="rounded-sm border border-dashed bg-muted/30 p-4">
                    <div className="flex items-start gap-4">
                      {featuredImage ? (
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm border bg-muted">
                          <img
                            src={featuredImage}
                            alt="Featured image preview"
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
                          key={featuredImage || "empty"}
                          value={featuredImage}
                          onChange={(media) => {
                            setFeaturedImage(media ? media.url : "")
                          }}
                          accept="image/*"
                        />
                        <p className="text-xs text-muted-foreground">
                          Choose a hero image from the media library.
                        </p>
                        {featuredImage && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Remove image"
                            className="w-fit text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setFeaturedImage("")}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {fieldErrors.featuredImage && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.featuredImage[0]}
                    </p>
                  )}
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/60 shadow-sm">
                  <CardHeader><CardTitle className="text-base">Organization</CardTitle></CardHeader>
                  <CardContent className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="tag1, tag2, tag3 (comma-separated)"
                      aria-invalid={!!fieldErrors.tags}
                      aria-describedby={fieldErrors.tags ? "tags-error" : undefined}
                    />
                    {fieldErrors.tags && (
                      <p id="tags-error" className="text-xs text-destructive">
                        {fieldErrors.tags[0]}
                      </p>
                    )}
                    {tagsInput && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tagsInput
                          .split(",")
                          .map((t) => t.trim())
                          .filter((t) => t.length > 0)
                          .map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>Categories</Label>
                    {categories.length > 0 ? (
                      <MultiSelect
                        options={categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        }))}
                        selected={selectedCategoryIds}
                        onChange={setSelectedCategoryIds}
                        placeholder="Select categories..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No categories available. Create categories first.
                      </p>
                    )}
                    {fieldErrors.categoryIds && (
                      <p className="text-xs text-destructive">
                        {fieldErrors.categoryIds[0]}
                      </p>
                    )}
                  </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/60 shadow-sm">
                  <CardHeader><CardTitle className="text-base">Custom fields</CardTitle></CardHeader>
                  <CardContent>
                    <ContentTypeFieldsRenderer detailTemplate={detailTemplate} values={customFieldValues} onChange={setCustomFieldValues} />
                  </CardContent>
                </Card>
            </div>
          </div>

          </div>
        </div>
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}><DialogContent><DialogHeader><DialogTitle>Set visibility date</DialogTitle></DialogHeader><input type="datetime-local" className="w-full rounded-sm border px-3 py-2" value={publishedAt ? new Date(publishedAt - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} onChange={(event) => setPublishedAt(event.target.value ? new Date(event.target.value).getTime() : null)} /><DialogFooter><Button type="button" variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button><Button type="button" disabled={!publishedAt} onClick={() => { setVisibility("published"); setIsScheduleOpen(false) }}>Set visibility date</Button></DialogFooter></DialogContent></Dialog>
    </form>
  )
}

function GalleryItem({
  url,
  onRemove,
}: {
  url: string
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`overflow-hidden rounded-sm border bg-muted ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between border-b bg-background/70 px-2 py-1">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="relative aspect-square">
        <img src={url} alt="Gallery image" className="object-cover h-full w-full" />
      </div>
    </div>
  )
}
