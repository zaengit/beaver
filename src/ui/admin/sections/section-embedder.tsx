
import { useState } from "react"
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@zbeaver/beaver/ui/admin/components/ui/dialog"
import { getSectionRegistry, type SectionTemplate } from "@zbeaver/beaver/app/registry/sections"
import {
  createEmptyItem,
  type AvailableSection,
  type EmbeddedSection,
  type SectionEmbedderProps,
} from "./section-embedder-types"
import { EmbeddedSectionCard } from "./embedded-section-card"

export type { EmbeddedSection } from "./section-embedder-types"

function createTemplateSection(template: SectionTemplate): AvailableSection {
  const demo = (template.demo?.section ?? {}) as Record<string, unknown>
  const text = (field: "caption" | "title" | "text" | "image" | "alt_image" | "bg_color" | "bg_image" | "style_css" | "style_css_inline" | "style_id" | "alignment") =>
    typeof demo[field] === "string" ? (demo[field] as string) : null
  return {
    id: `template-${template.type}`,
    type: template.type,
    caption: text("caption"),
    title: text("title"),
    text: text("text"),
    image: text("image"),
    alt_image: text("alt_image"),
    bg_color: text("bg_color"),
    bg_image: text("bg_image"),
    style_css: text("style_css"),
    style_css_inline: text("style_css_inline"),
    style_id: text("style_id"),
    alignment: text("alignment"),
    limit: null,
    sort: 0,
    sort_by: null,
    sort_order: null,
    category: null,
    links: null,
    item: Object.fromEntries(template.itemFields.map((field) => [field, null])),
    template,
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SectionEmbedder({ embeddedSections, onChange }: SectionEmbedderProps) {
  const sectionTemplates = getSectionRegistry()
  const [availableSections] = useState<AvailableSection[]>(() => sectionTemplates.map(createTemplateSection))
  const [isSectionPickerOpen, setIsSectionPickerOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set())
  const [itemTemplates, setItemTemplates] = useState<Map<number, Record<string, unknown>>>(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  function addSection(sectionId: string) {
    const section = availableSections.find((candidate) => candidate.id === sectionId)
    if (!section) return

    let links: { label: string; url: string }[] | null = null
    let item: Record<string, unknown>[] | null = null
    let template: Record<string, unknown> | null = null
    const usesItems = section.template?.itemMode !== "none"
    try { if (section.links) links = JSON.parse(section.links) } catch { /* ignore */ }
    const demoItems = section.template?.demo?.items as Record<string, unknown>[] | undefined
    if (usesItems && demoItems?.length) {
      template = { ...(section.item as Record<string, unknown>) }
      item = demoItems.map((demoItem) => ({
        ...demoItem,
        links: Array.isArray(demoItem.links) ? demoItem.links.map((link: unknown) => ({ ...(link as Record<string, unknown>) })) : demoItem.links,
      }))
    }
    try {
      if (usesItems && !item && section.item) {
        const parsed = typeof section.item === "string" ? JSON.parse(section.item) : section.item
        if (parsed && !Array.isArray(parsed)) {
          template = { ...parsed }
          item = [createEmptyItem({ ...parsed })]
        } else if (Array.isArray(parsed)) {
          item = parsed
          template = parsed.length > 0 ? { ...parsed[0] } : null
        }
      }
    } catch { /* ignore */ }
    if (usesItems && !item && template) item = [createEmptyItem(template)]

    const embedded: EmbeddedSection = {
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      id: section.id,
      type: section.type,
      caption: section.caption,
      title: section.title,
      text: section.text,
      image: section.image,
      alt_image: section.alt_image,
      bg_color: section.bg_color,
      bg_image: section.bg_image,
      style_css: section.style_css,
      style_css_inline: section.style_css_inline,
      style_id: section.style_id,
      alignment: section.alignment,
      limit: section.limit,
      sort: section.sort ?? 0,
      sort_by: section.sort_by,
      sort_order: section.sort_order,
      category: section.category,
      links,
      item: usesItems ? (item && item.length > 0 ? item : []) : null,
    }

    const newIndex = embeddedSections.length
    onChange([...embeddedSections, embedded])
    setIsSectionPickerOpen(false)
    if (usesItems && template) setItemTemplates((prev) => new Map(prev).set(newIndex, template!))
    setExpandedSections((prev) => new Set(prev).add(newIndex))
  }

  function removeSection(index: number) {
    onChange(embeddedSections.filter((_, i) => i !== index))
  }

  function duplicateSection(index: number) {
    const source = embeddedSections[index]
    if (!source) return

    const duplicate: EmbeddedSection = {
      ...source,
      _instanceId: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      links: source.links?.map((link) => ({ ...link })) ?? null,
      item: source.item?.map((item) => ({ ...item })) ?? null,
    }

    onChange([
      ...embeddedSections.slice(0, index + 1),
      duplicate,
      ...embeddedSections.slice(index + 1),
    ])
    setExpandedSections((prev) => {
      const next = new Set<number>()
      prev.forEach((expandedIndex) => next.add(expandedIndex > index ? expandedIndex + 1 : expandedIndex))
      next.add(index + 1)
      return next
    })
    setItemTemplates((prev) => {
      const next = new Map<number, Record<string, unknown>>()
      prev.forEach((template, templateIndex) => {
        next.set(templateIndex > index ? templateIndex + 1 : templateIndex, template)
      })
      const template = prev.get(index)
      if (template) next.set(index + 1, { ...template })
      return next
    })
  }

  function updateSectionField(index: number, field: keyof EmbeddedSection, value: unknown) {
    onChange(embeddedSections.map((sec, i) => (i === index ? { ...sec, [field]: value } : sec)))
  }

  function updateItemField(sectionIndex: number, itemIndex: number, field: string, value: unknown) {
    onChange(
      embeddedSections.map((sec, i) => {
        if (i !== sectionIndex || !sec.item) return sec
        return {
          ...sec,
          item: sec.item.map((it, j) => (j === itemIndex ? { ...it, [field]: value } : it)),
        }
      })
    )
  }

  function toggleExpanded(index: number) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function toggleItemExpanded(itemId: string) {
    setCollapsedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  function collapseAll() {
    setExpandedSections(new Set())
    setCollapsedItems(new Set(
      embeddedSections.flatMap((section) =>
        (section.item ?? []).map((_, itemIndex) => `${section._instanceId}-item-${itemIndex}`)
      )
    ))
  }

  function expandAll() {
    setExpandedSections(new Set(embeddedSections.map((_, index) => index)))
    setCollapsedItems(new Set())
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Section-level reorder
    if (!activeId.includes("-item-") && !overId.includes("-item-")) {
      const oldIndex = embeddedSections.findIndex((s) => s._instanceId === activeId)
      const newIndex = embeddedSections.findIndex((s) => s._instanceId === overId)
      if (oldIndex === -1 || newIndex === -1) return
      onChange(arrayMove(embeddedSections, oldIndex, newIndex))
      return
    }

    // Item-level reorder (within the same section only)
    if (activeId.includes("-item-") && overId.includes("-item-")) {
      const activeSectionId = activeId.split("-item-")[0]
      const overSectionId = overId.split("-item-")[0]
      if (activeSectionId !== overSectionId) return

      const sectionIndex = embeddedSections.findIndex((s) => s._instanceId === activeSectionId)
      if (sectionIndex === -1) return

      const section = embeddedSections[sectionIndex]
      if (!section.item) return

      const activeItemIdx = parseInt(activeId.split("-item-")[1], 10)
      const overItemIdx = parseInt(overId.split("-item-")[1], 10)
      if (isNaN(activeItemIdx) || isNaN(overItemIdx)) return

      const newItems = arrayMove(section.item, activeItemIdx, overItemIdx)
      onChange(
        embeddedSections.map((sec, i) =>
          i === sectionIndex ? { ...sec, item: newItems } : sec
        )
      )
      return
    }
  }

  return (
    <div className="space-y-3">
      {embeddedSections.length > 0 && (
        <div className="flex items-center gap-3 px-0.5 text-xs font-medium">
          <button type="button" onClick={collapseAll} className="text-muted-foreground transition-colors hover:text-foreground">Collapse all</button>
          <button type="button" onClick={expandAll} className="text-muted-foreground transition-colors hover:text-foreground">Expand all</button>
        </div>
      )}

      <Dialog open={isSectionPickerOpen} onOpenChange={setIsSectionPickerOpen}>
        <DialogTrigger
          render={
            <Button type="button" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </Button>
          }
        />
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>
              Select a developer-provided section template. Its fields and layout are defined in code.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {availableSections.map((section) => (
              <Button
                key={section.id}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start px-3 py-3 text-left"
                onClick={() => addSection(section.id)}
              >
                <span className="flex flex-col items-start gap-0.5">
                  <span>{section.template?.label ?? section.type}</span>
                  {section.template?.description && <span className="text-xs font-normal text-muted-foreground">{section.template.description}</span>}
                </span>
              </Button>
            ))}
            {availableSections.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No sections available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {embeddedSections.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={embeddedSections.map((s) => s._instanceId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {embeddedSections.map((section, index) => (
                <EmbeddedSectionCard
                  key={section._instanceId}
                  section={section}
                  index={index}
                  isExpanded={expandedSections.has(index)}
                  itemTemplate={itemTemplates.get(index) ?? null}
                  availableSections={availableSections}
                  template={sectionTemplates.find((candidate) => candidate.type === section.type) ?? null}
                  onToggleExpanded={() => toggleExpanded(index)}
                  onRemove={() => removeSection(index)}
                  onDuplicate={() => duplicateSection(index)}
                  onUpdateField={(field, value) => updateSectionField(index, field, value)}
                  onUpdateItemField={(itemIdx, field, value) => updateItemField(index, itemIdx, field, value)}
                  collapsedItems={collapsedItems}
                  onToggleItemExpanded={toggleItemExpanded}
                  onCollapseItems={() => setCollapsedItems((prev) => new Set([...prev, ...(section.item ?? []).map((_, itemIndex) => `${section._instanceId}-item-${itemIndex}`)]))}
                  onExpandItems={() => setCollapsedItems((prev) => {
                    const next = new Set(prev)
                    ;(section.item ?? []).forEach((_, itemIndex) => next.delete(`${section._instanceId}-item-${itemIndex}`))
                    return next
                  })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {embeddedSections.length === 0 && (
        <p className="text-sm text-muted-foreground">No sections embedded. Pick one from above.</p>
      )}
    </div>
  )
}
