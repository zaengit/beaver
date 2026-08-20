
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronUp, Copy, GripVertical, Settings2, Trash2 } from "lucide-react"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@zbeaver/beaver/ui/admin/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@zbeaver/beaver/ui/admin/components/ui/tabs"
import { ITEM_FIELD_LABELS } from "./section-embedder-types"
import { ItemFieldRenderer } from "./section-embedder-item-fields"

export function SortableItemCard({
  id,
  item,
  itemIdx,
  itemTemplate,
  onUpdateItemField,
  onRemove,
  isExpanded,
  onToggleExpanded,
  onDuplicate,
}: {
  id: string
  item: Record<string, unknown>
  itemIdx: number
  itemTemplate: Record<string, unknown> | null
  onUpdateItemField: (itemIdx: number, field: string, value: unknown) => void
  onRemove: (itemIdx: number) => void
  isExpanded: boolean
  onToggleExpanded: () => void
  onDuplicate: (itemIdx: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const fields = itemTemplate ? Object.keys(itemTemplate) : Object.keys(item)
  const styleFields = fields.filter((field) => ["style_css", "style_css_inline", "style_id"].includes(field))
  const backgroundFields = fields.filter((field) => ["bg_color", "bg_image"].includes(field))
  const tabGroups = [
    { value: "text", label: "Text", fields: fields.filter((field) => ["caption", "title", "text"].includes(field)) },
    { value: "image", label: "Image", fields: fields.filter((field) => ["image", "alt_image"].includes(field)) },
    ...fields
      .filter((field) => !["caption", "title", "text", "image", "alt_image", "style_css", "style_css_inline", "style_id", "bg_color", "bg_image"].includes(field))
      .map((field) => ({ value: field, label: ITEM_FIELD_LABELS[field] || field, fields: [field] })),
  ].filter((group) => group.fields.length > 0)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`overflow-hidden rounded-sm border ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="cursor-grab text-muted-foreground hover:text-foreground"
            aria-label="Drag to reorder item"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-medium">Column #{itemIdx + 1}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Duplicate column"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(itemIdx)
            }}
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          {(styleFields.length > 0 || backgroundFields.length > 0) && (
            <Dialog>
              <DialogTrigger
                render={
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Open style settings">
                    <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Style settings</DialogTitle>
                  <DialogDescription>
                    Set background and custom styling for this column.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue={styleFields.length > 0 ? "style" : "background"} className="gap-0">
                  <TabsList className="w-full justify-start" aria-label="Style settings">
                    {styleFields.length > 0 && <TabsTrigger value="style" className="shrink-0 px-2 text-xs">Style</TabsTrigger>}
                    {backgroundFields.length > 0 && <TabsTrigger value="background" className="shrink-0 px-2 text-xs">Background</TabsTrigger>}
                  </TabsList>
                  {styleFields.length > 0 && (
                    <TabsContent value="style" className="p-4">
                      <div className="space-y-4">
                        {styleFields.map((field) => (
                          <ItemFieldRenderer key={field} field={field} value={item[field] ?? null} onItemChange={(val) => onUpdateItemField(itemIdx, field, val)} />
                        ))}
                      </div>
                    </TabsContent>
                  )}
                  {backgroundFields.length > 0 && (
                    <TabsContent value="background" className="p-4">
                      <div className="space-y-4">
                        {backgroundFields.map((field) => (
                          <ItemFieldRenderer key={field} field={field} value={item[field] ?? null} onItemChange={(val) => onUpdateItemField(itemIdx, field, val)} />
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove column"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(itemIdx)
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={isExpanded ? "Collapse column" : "Expand column"} onClick={onToggleExpanded}>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      </div>
      {isExpanded && tabGroups.length > 0 ? (
        <Tabs defaultValue={tabGroups[0].value} className="gap-0">
          <TabsList className="w-full justify-start" aria-label={`Column ${itemIdx + 1} fields`}>
            {tabGroups.map((group) => (
              <TabsTrigger key={group.value} value={group.value} className="shrink-0 px-2 text-xs">
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabGroups.map((group) => (
            <TabsContent key={group.value} value={group.value} className="p-4">
              <div className="space-y-4">
                {group.fields.map((field) => (
                  <ItemFieldRenderer
                    key={field}
                    field={field}
                    value={item[field] ?? null}
                    onItemChange={(val) => onUpdateItemField(itemIdx, field, val)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        isExpanded && <p className="p-4 text-xs text-muted-foreground">No template fields defined for this section.</p>
      )}
    </div>
  )
}
