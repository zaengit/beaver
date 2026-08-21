
import { useEffect, useState } from "react"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Settings2, Trash2 } from "lucide-react"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zbeaver/beaver/ui/admin/components/ui/textarea"
import { Badge } from "@zbeaver/beaver/ui/admin/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@zbeaver/beaver/ui/admin/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@zbeaver/beaver/ui/admin/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@zbeaver/beaver/ui/admin/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@zbeaver/beaver/ui/admin/components/ui/tabs"
import { adminApiGet } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { MediaPicker } from "@zbeaver/beaver/ui/admin/shared/media-picker"
import { safeAdminImageUrl } from "@zbeaver/beaver/ui/admin/shared/media-url"
import { getSectionRegistry, type SectionTemplate } from "@zbeaver/beaver/app/registry/sections"
import { createEmptyItem, type AvailableSection, type EmbeddedSection } from "./section-embedder-types"
import { SortableItemCard } from "./sortable-item-card"

// ─── Embedded Section Card ───────────────────────────────────────────────────

function resolveItemTemplate(
  itemTemplate: Record<string, unknown> | null,
  section: EmbeddedSection,
  availableSections: AvailableSection[],
): Record<string, unknown> | null {
  if (itemTemplate && Object.keys(itemTemplate).length > 0) return itemTemplate
  if (section.item && section.item.length > 0) return { ...section.item[0] }

  // Fallback: derive from the library section definition
  const librarySection = availableSections.find((candidate) => candidate.id === section.id)
  if (librarySection?.item) {
    try {
      const parsed = typeof librarySection.item === "string" ? JSON.parse(librarySection.item) : librarySection.item
      if (parsed && !Array.isArray(parsed)) return { ...parsed }
      if (Array.isArray(parsed) && parsed.length > 0) return { ...parsed[0] }
    } catch { /* ignore */ }
  }

  return null
}
export function EmbeddedSectionCard({
  section,
  index,
  isExpanded,
  itemTemplate,
  availableSections,
  template,
  onToggleExpanded,
  onRemove,
  onDuplicate,
  onUpdateField,
  onUpdateItemField,
  collapsedItems,
  onToggleItemExpanded,
  onCollapseItems,
  onExpandItems,
}: {
  section: EmbeddedSection
  index: number
  isExpanded: boolean
  itemTemplate: Record<string, unknown> | null
  availableSections: AvailableSection[]
  template: SectionTemplate | null
  onToggleExpanded: () => void
  onRemove: () => void
  onDuplicate: () => void
  onUpdateField: (field: keyof EmbeddedSection, value: unknown) => void
  onUpdateItemField: (itemIdx: number, field: string, value: unknown) => void
  collapsedItems: Set<string>
  onToggleItemExpanded: (itemId: string) => void
  onCollapseItems: () => void
  onExpandItems: () => void
}) {
  const sectionTemplates = getSectionRegistry()
  const itemTemplateFields = resolveItemTemplate(itemTemplate, section, availableSections)
  const templateConfig = template ?? sectionTemplates.find((candidate) => candidate.type === section.type) ?? null
  const supportsFilter = Boolean(templateConfig?.contentType)
  const allowsItems = templateConfig?.itemMode !== "none"
  const isSingleItem = templateConfig?.itemMode === "single"
  const sectionFields = new Set(templateConfig?.sectionFields ?? ["caption", "title", "text"])
  const columns = templateConfig?.columns
  const columnsMax = columns ? (columns.desktop ?? columns.tablet ?? columns.mobile) : undefined
  const sectionLink = section.links?.[0] ?? { label: "", url: "" }
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const selectedCategory = categories.find(
    (category) => category.id === section.category || category.name === section.category
  )
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section._instanceId })

  useEffect(() => {
    if (!supportsFilter) {
      setCategories([])
      return
    }

    adminApiGet<{ id: string; name: string }[]>(`/api/admin/categories?type=${encodeURIComponent(section.type)}`)
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))
  }, [section.type, supportsFilter])

  return (
    <Card ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`gap-0 overflow-hidden rounded-sm border-border/70 bg-card py-0 shadow-sm ${isDragging ? "opacity-60" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between border-b py-3 px-3 cursor-pointer select-none" onClick={onToggleExpanded}>
        <div className="flex items-center gap-2">
          <button type="button" className="cursor-grab text-muted-foreground hover:text-foreground" aria-label="Drag to reorder" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
          <CardTitle className="text-sm">{templateConfig?.label ?? section.type ?? `Section #${index + 1}`}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Duplicate section"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open section style settings"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Section settings</DialogTitle>
                <DialogDescription>
                  Configure media, display options, link, and custom styling for this section.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="style" className="gap-0">
                <TabsList className="w-full justify-start" aria-label="Section settings">
                  <TabsTrigger value="style" className="shrink-0 px-2 text-xs">Style</TabsTrigger>
                  {supportsFilter && <TabsTrigger value="filter" className="shrink-0 px-2 text-xs">Filter</TabsTrigger>}
                  {sectionFields.has("image") && <TabsTrigger value="image" className="shrink-0 px-2 text-xs">Image</TabsTrigger>}
                  {sectionFields.has("links") && <TabsTrigger value="link" className="shrink-0 px-2 text-xs">Link</TabsTrigger>}
                  {(sectionFields.has("bg_color") || sectionFields.has("bg_image")) && <TabsTrigger value="background" className="shrink-0 px-2 text-xs">Background</TabsTrigger>}
                </TabsList>
                <TabsContent value="style" className="p-1 pt-4">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Custom Class</Label>
                      <Input value={section.style_css ?? ""} onChange={(e) => onUpdateField("style_css", e.target.value || null)} placeholder="custom-class" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Custom Style</Label>
                      <Input value={section.style_css_inline ?? ""} onChange={(e) => onUpdateField("style_css_inline", e.target.value || null)} placeholder="color: red;" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Custom ID</Label>
                      <Input value={section.style_id ?? ""} onChange={(e) => onUpdateField("style_id", e.target.value || null)} placeholder="#my-id" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Alignment</Label>
                      <Select value={section.alignment ?? ""} onValueChange={(val) => onUpdateField("alignment", val || null)}>
                        <SelectTrigger><SelectValue placeholder="Select alignment" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                {supportsFilter && (
                  <TabsContent value="filter" className="p-1 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label>Category</Label>
                        <Select value={selectedCategory?.id ?? section.category ?? "all"} onValueChange={(value) => onUpdateField("category", value === "all" ? null : value)}>
                          <SelectTrigger>
                            <SelectValue>{selectedCategory?.name ?? "All categories"}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Sort By</Label>
                        <Select value={section.sort_by ?? "created_at"} onValueChange={(value) => onUpdateField("sort_by", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="created_at">Created at</SelectItem><SelectItem value="title">Title</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Order</Label>
                        <Select value={section.sort_order ?? "desc"} onValueChange={(value) => onUpdateField("sort_order", value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="asc">Ascending</SelectItem><SelectItem value="desc">Descending</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Limit</Label>
                        <Input type="number" min={0} value={section.limit ?? ""} onChange={(e) => onUpdateField("limit", e.target.value ? Number(e.target.value) : null)} placeholder="Max items" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Sort</Label>
                        <Input type="number" min={0} value={section.sort} onChange={(e) => onUpdateField("sort", Number(e.target.value) || 0)} />
                      </div>
                    </div>
                  </TabsContent>
                )}
                {sectionFields.has("image") && <TabsContent value="image" className="p-1 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label>Image</Label>
                      <div className="flex items-center gap-2">
                        {section.image && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted">
                            <img src={safeAdminImageUrl(section.image) ?? undefined} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <MediaPicker value={section.image ?? null} onChange={(media) => onUpdateField("image", media ? media.url : null)} accept="image/*" />
                        {section.image && (
                          <Button type="button" variant="outline" aria-label="Remove image" className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onUpdateField("image", null)}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Alt Image</Label>
                      <Input value={section.alt_image ?? ""} onChange={(e) => onUpdateField("alt_image", e.target.value || null)} placeholder="Alt text" />
                    </div>
                  </div>
                </TabsContent>}
                {sectionFields.has("links") && <TabsContent value="link" className="p-1 pt-4">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input value={sectionLink.label} onChange={(e) => onUpdateField("links", [{ ...sectionLink, label: e.target.value }])} placeholder="Label" />
                    <Input value={sectionLink.url} onChange={(e) => onUpdateField("links", [{ ...sectionLink, url: e.target.value }])} placeholder="https://..." className="sm:col-span-2" />
                  </div>
                </TabsContent>}
                {(sectionFields.has("bg_color") || sectionFields.has("bg_image")) && <TabsContent value="background" className="p-1 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label>Background Image</Label>
                      <div className="flex items-center gap-2">
                        {section.bg_image && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-muted">
                            <img src={safeAdminImageUrl(section.bg_image) ?? undefined} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <MediaPicker value={section.bg_image ?? null} onChange={(media) => onUpdateField("bg_image", media ? media.url : null)} accept="image/*" />
                        {section.bg_image && (
                          <Button type="button" variant="outline" aria-label="Remove background image" className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onUpdateField("bg_image", null)}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Background Color</Label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={section.bg_color ?? "#ffffff"} onChange={(e) => onUpdateField("bg_color", e.target.value || null)} className="h-9 w-10 rounded-sm border p-1" />
                        <Input value={section.bg_color ?? ""} onChange={(e) => onUpdateField("bg_color", e.target.value || null)} placeholder="#000000" />
                      </div>
                    </div>
                  </div>
                </TabsContent>}
              </Tabs>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>
          <Button type="button" variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onRemove() }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-5 px-3 py-4">
          {(sectionFields.has("caption") || sectionFields.has("title") || sectionFields.has("text")) && (
            <div className="space-y-4">
              {sectionFields.has("caption") && <div className="flex flex-col gap-1.5">
                <Label>Caption</Label>
                <Input value={section.caption ?? ""} onChange={(e) => onUpdateField("caption", e.target.value || null)} placeholder="Enter your caption..." />
              </div>}
              {sectionFields.has("title") && <div className="flex flex-col gap-1.5">
                <Label>Heading</Label>
                <Input value={section.title ?? ""} onChange={(e) => onUpdateField("title", e.target.value || null)} placeholder="Enter your heading..." />
              </div>}
              {sectionFields.has("text") && <div className="flex flex-col gap-1.5">
                <Label>Text</Label>
                <Textarea value={section.text ?? ""} onChange={(e) => onUpdateField("text", e.target.value || null)} placeholder="Enter your text..." rows={3} />
              </div>}
            </div>
          )}

          {/* Items — dynamic template-based fields */}
          {allowsItems && <div className="space-y-3 border-t pt-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Items{columnsMax ? ` · up to ${columnsMax} columns per row` : ""}</Label>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <button type="button" onClick={onCollapseItems} className="hover:text-foreground">Collapse all</button>
                  <button type="button" onClick={onExpandItems} className="hover:text-foreground">Expand all</button>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSingleItem && (section.item?.length ?? 0) >= 1}
                onClick={(e) => {
                  e.stopPropagation()
                  const emptyItem = itemTemplateFields ? createEmptyItem(itemTemplateFields) : {}
                  onUpdateField("item", [...(section.item ?? []), emptyItem])
                }}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </Button>
            </div>

            {section.item && section.item.length > 0 ? (
              <SortableContext
                items={(section.item ?? []).map((_, i) => `${section._instanceId}-item-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid gap-3 lg:grid-cols-2">
                  {section.item.map((item, itemIdx) => (
                    <SortableItemCard
                      key={`${section._instanceId}-item-${itemIdx}`}
                      id={`${section._instanceId}-item-${itemIdx}`}
                      item={item}
                      itemIdx={itemIdx}
                  itemTemplate={itemTemplateFields}
                      onUpdateItemField={onUpdateItemField}
                      onRemove={(idx) =>
                        onUpdateField(
                          "item",
                          (section.item ?? []).filter((_, j) => j !== idx)
                        )
                      }
                      isExpanded={!collapsedItems.has(`${section._instanceId}-item-${itemIdx}`)}
                      onToggleExpanded={() => onToggleItemExpanded(`${section._instanceId}-item-${itemIdx}`)}
                      onDuplicate={(idx) => onUpdateField("item", [...(section.item ?? []), { ...(section.item ?? [])[idx] }])}
                    />
                  ))}
                </div>
              </SortableContext>
            ) : (
              <p className="text-xs text-muted-foreground">No items added. Click "Add Item" to create one.</p>
            )}
          </div>}

          {section.links && section.links.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{section.links.length} links</Badge>
              <span>embedded</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
