
import { Input } from "@zbeaver/beaver/ui/admin/components/ui/input"
import { Label } from "@zbeaver/beaver/ui/admin/components/ui/label"
import { Textarea } from "@zbeaver/beaver/ui/admin/components/ui/textarea"
import { Button } from "@zbeaver/beaver/ui/admin/components/ui/button"
import { MediaPicker } from "@zbeaver/beaver/ui/admin/shared/media-picker"
import { safeAdminImageUrl } from "@zbeaver/beaver/ui/admin/shared/media-url"
import { getContentTypeRegistry } from "@zbeaver/beaver/app/registry/content-types"

interface Props {
  detailTemplate: string | null
  values: Record<string, unknown>
  onChange: (values: Record<string, unknown>) => void
}

export function ContentTypeFieldsRenderer({ detailTemplate, values, onChange }: Props) {
  const registry = getContentTypeRegistry()
  const fields = detailTemplate
    ? registry.templates.find((template) => template.id === detailTemplate && template.kind === "detail")?.fieldSlots ?? []
    : []
  if (fields.length === 0) return null

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={`template-field-${field.key}`}>{field.label}</Label>
          {field.type === "rich-text" ? (
            <Textarea id={`template-field-${field.key}`} value={String((values as Record<string, unknown>)[field.key] ?? "")} onChange={(event) => onChange({ ...values, [field.key]: event.target.value })} />
          ) : field.type === "boolean" ? (
            <input id={`template-field-${field.key}`} type="checkbox" checked={(values as Record<string, unknown>)[field.key] === true} onChange={(event) => onChange({ ...values, [field.key]: event.target.checked })} className="rounded-sm border-input" />
          ) : field.type === "image" ? (
            <div className="space-y-2">
              <MediaPicker value={typeof (values as Record<string, unknown>)[field.key] === "string" ? String((values as Record<string, unknown>)[field.key]) : null} onChange={(media) => onChange({ ...values, [field.key]: media?.url ?? "" })} accept="image/*" />
              {typeof (values as Record<string, unknown>)[field.key] === "string" && String((values as Record<string, unknown>)[field.key]) && (
                <div className="flex items-start gap-3">
                  <img src={safeAdminImageUrl((values as Record<string, unknown>)[field.key]) ?? undefined} alt={field.label} className="h-32 w-48 rounded-sm border object-cover" />
                  <Button type="button" variant="outline" onClick={() => onChange({ ...values, [field.key]: "" })}>Remove image</Button>
                </div>
              )}
            </div>
          ) : (
            <Input id={`template-field-${field.key}`} type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} value={String((values as Record<string, unknown>)[field.key] ?? "")} onChange={(event) => onChange({ ...values, [field.key]: field.type === "number" && event.target.value ? Number(event.target.value) : event.target.value })} />
          )}
        </div>
      ))}
    </div>
  )
}
