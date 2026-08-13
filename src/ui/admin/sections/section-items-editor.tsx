
import { Label } from "zadm/ui/admin/components/ui/label"
import { Checkbox } from "zadm/ui/admin/components/ui/checkbox"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SectionItemData {
  caption?: string
  title?: string
  text?: string
  image?: string
  alt_image?: string
  video?: string
  embed?: string
  map?: string
  form_inquiry?: boolean | null
  bg_color?: string
  bg_image?: string
  links?: { label: string; url: string }[]
  style_css?: string
  style_css_inline?: string
  style_id?: string
}

interface SectionItemsEditorProps {
  enabledFields: Set<string>
  onToggleField: (field: string) => void
}

// ─── Available fields ───────────────────────────────────────────────────────

const AVAILABLE_FIELDS = [
  { key: "caption", label: "Caption" },
  { key: "title", label: "Title" },
  { key: "text", label: "Text" },
  { key: "image", label: "Image" },
  { key: "alt_image", label: "Alt Image" },
  { key: "video", label: "Video" },
  { key: "map", label: "Map" },
  { key: "form_inquiry", label: "Form Inquiry" },
  { key: "embed", label: "Embed" },
  { key: "bg_color", label: "Background Color" },
  { key: "bg_image", label: "Background Image" },
  { key: "links", label: "Links" },
  { key: "style_css", label: "Style CSS" },
  { key: "style_css_inline", label: "Style CSS Inline" },
  { key: "style_id", label: "Style ID" },
] as const

// ─── Component ───────────────────────────────────────────────────────────────

export function SectionItemsEditor({
  enabledFields,
  onToggleField,
}: SectionItemsEditorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Select fields to enable for this section's item template:</Label>
      <div className="flex flex-wrap gap-3">
        {AVAILABLE_FIELDS.map((f) => (
          <label key={f.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <Checkbox
              checked={enabledFields.has(f.key)}
              onCheckedChange={() => onToggleField(f.key)}
            />
            {f.label}
          </label>
        ))}
      </div>
    </div>
  )
}
