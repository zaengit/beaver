export interface Section {
  id: string
  type: string
  caption?: string | null
  title?: string | null
  text?: string | null
  image?: string | null
  alt_image?: string | null
  bg_color?: string | null
  bg_image?: string | null
  style_css?: string | null
  style_css_inline?: string | null
  style_id?: string | null
  alignment?: string | null
  category?: string | null
  sort_by?: string | null
  sort_order?: string | null
  limit?: number | null
  links?: { label: string; url: string }[] | null
  item?: SectionItem[] | null
}

export interface SectionItem {
  caption?: string | null
  title?: string | null
  text?: string | null
  image?: string | null
  alt_image?: string | null
  bg_color?: string | null
  bg_image?: string | null
  links?: { label: string; url: string }[] | null
  video?: string | null
  map?: string | null
  question?: string | null
  answer?: string | null
  icon?: string | null
  form_inquiry?: boolean | null
  [key: string]: unknown
}

export function getSectionStyle(section: Section) {
  return [
    section.bg_color ? `background-color: ${section.bg_color}` : null,
    section.bg_image ? `background-image: url(${section.bg_image})` : null,
    section.style_css_inline || null,
  ].filter(Boolean).join("; ") || undefined
}

export function toVideoEmbedUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const url = new URL(value)
    const youtubeId = url.hostname.includes("youtu.be")
      ? url.pathname.slice(1)
      : url.searchParams.get("v") || url.pathname.match(/\/embed\/([^/?]+)/)?.[1]
    return youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}` : null
  } catch {
    return null
  }
}
