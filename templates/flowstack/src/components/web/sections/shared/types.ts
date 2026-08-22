import { safeCssColor, safeCssImageSrc } from "../../safe-url"

interface SectionContent {
  caption?: string | null
  title?: string | null
  text?: string | null
  image?: string | null
  alt_image?: string | null
  bg_color?: string | null
  bg_image?: string | null
  links?: { label: string; url: string }[] | null
}

export interface Section extends SectionContent {
  id: string
  type: string
  style_css?: string | null
  style_css_inline?: string | null
  style_id?: string | null
  alignment?: string | null
  category?: string | null
  sort_by?: string | null
  sort_order?: string | null
  limit?: number | null
  item?: SectionItem[] | null
}

export interface SectionItem extends SectionContent {
  video?: string | null
  map?: string | null
  icon?: string | null
  form_inquiry?: boolean | null
  [key: string]: unknown
}

export function getSectionStyle(section: Section) {
  const backgroundColor = safeCssColor(section.bg_color)
  const inlineStyle = typeof section.style_css_inline === "string"
    && section.style_css_inline.length <= 4_000
    && !/[{}<>"'\\\u0000-\u001f\u007f]/.test(section.style_css_inline)
    && !/(?:expression|javascript\s*:|@import|url\s*\()/i.test(section.style_css_inline)
    ? section.style_css_inline
    : null
  const backgroundImage = safeCssImageSrc(section.bg_image)
  return [
    backgroundColor ? `background-color: ${backgroundColor}` : null,
    backgroundImage ? `background-image: url(${backgroundImage})` : null,
    inlineStyle,
  ].filter(Boolean).join("; ") || undefined
}

export function toVideoEmbedUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "")
    const youtubeId = hostname === "youtu.be" || hostname === "www.youtu.be"
      ? url.pathname.slice(1).split("/")[0]
      : ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(hostname)
        ? url.searchParams.get("v") || url.pathname.match(/^\/embed\/([^/?]+)/)?.[1]
        : null
    return youtubeId && /^[A-Za-z0-9_-]{6,32}$/.test(youtubeId)
      ? `https://www.youtube-nocookie.com/embed/${youtubeId}`
      : null
  } catch {
    return null
  }
}
