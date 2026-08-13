export interface EmbeddedSection {
  _instanceId: string
  id: string
  type: string
  caption: string | null
  title: string | null
  text: string | null
  image: string | null
  alt_image: string | null
  bg_color: string | null
  bg_image: string | null
  style_css: string | null
  style_css_inline: string | null
  style_id: string | null
  alignment: string | null
  limit: number | null
  sort: number
  sort_by: string | null
  sort_order: string | null
  category: string | null
  links: { label: string; url: string }[] | null
  item: Record<string, unknown>[] | null
}

export interface SectionEmbedderProps {
  embeddedSections: EmbeddedSection[]
  onChange: (sections: EmbeddedSection[]) => void
}

export const ITEM_FIELD_LABELS: Record<string, string> = {
  question: "Question",
  answer: "Answer",
  icon: "Icon",
  caption: "Caption",
  title: "Title",
  text: "Text",
  image: "Image",
  alt_image: "Alt Image",
  video: "Video URL",
  map: "Coordinate",
  form_inquiry: "Form Inquiry",
  embed: "Embed Code",
  bg_color: "Background Color",
  bg_image: "Background Image",
  links: "Links",
  style_css: "Style CSS Class",
  style_css_inline: "Style CSS Inline",
  style_id: "Style ID",
}

export const ITEM_FIELD_PLACEHOLDERS: Record<string, string> = {
  map: "Latitude, longitude (example: -6.208763, 106.845599)",
}

export const EMPTY_ITEM_LINKS = [
  { label: "", url: "" },
  { label: "", url: "" },
]

export function createEmptyItem(template: Record<string, unknown>) {
  return Object.keys(template).reduce<Record<string, unknown>>(
    (item, field) => ({
      ...item,
      [field]: field === "links" ? EMPTY_ITEM_LINKS.map((link) => ({ ...link })) : field === "form_inquiry" ? false : "",
    }),
    {},
  )
}

export function normalizeItemLinks(value: unknown) {
  if (Array.isArray(value)) {
    const links = value.slice(0, 2).map((link) => {
      if (link && typeof link === "object") {
        const values = link as Record<string, unknown>
        return { label: String(values.label ?? ""), url: String(values.url ?? "") }
      }
      return { label: "", url: "" }
    })
    return [...links, ...EMPTY_ITEM_LINKS.slice(links.length).map((link) => ({ ...link }))]
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return normalizeItemLinks(parsed)
    } catch { /* fall through to default */ }
  }
  return EMPTY_ITEM_LINKS.map((link) => ({ ...link }))
}
