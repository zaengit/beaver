const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"])

export function safeHref(value: unknown) {
  if (typeof value !== "string") return "#"
  const candidate = value.trim()
  if (!candidate || candidate.length > 2048 || /[\u0000-\u001f\u007f\\]/.test(candidate) || candidate.startsWith("//")) return "#"
  if (candidate.startsWith("/") || candidate.startsWith("#") || candidate.startsWith("?")) return candidate

  try {
    return SAFE_SCHEMES.has(new URL(candidate).protocol) ? candidate : "#"
  } catch {
    return "#"
  }
}

export function safeImageSrc(value: unknown) {
  const href = safeHref(value)
  if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://")) return href
  return null
}

export function safeTarget(value: unknown) {
  return value === "_self" || value === "_blank" || value === "_parent" || value === "_top" ? value : undefined
}

export function safePathSegment(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback
  const candidate = value.trim()
  return candidate && /^[A-Za-z0-9_-]+$/.test(candidate) ? candidate : candidate ? encodeURIComponent(candidate) : fallback
}

export function safeContentHref(type: unknown, slug: unknown) {
  const safeType = safePathSegment(type, "post")
  const safeSlug = safePathSegment(slug)
  return safeSlug ? `/${safeType}/${safeSlug}` : `/${safeType}`
}

export function safeContentArchiveHref(type: unknown) {
  return `/${safePathSegment(type, "post")}`
}

export function safeCssImageSrc(value: unknown) {
  const src = safeImageSrc(value)
  return src && !/[()"'\\\u0000-\u001f\u007f]/.test(src) ? src : null
}

export function safeCssColor(value: unknown) {
  if (typeof value !== "string") return null
  const candidate = value.trim()
  if (!candidate || candidate.length > 200 || !/^[#(),.%/\sA-Za-z0-9-]+$/.test(candidate)) return null
  return /\b(?:url|expression|javascript|var)\b/i.test(candidate) ? null : candidate
}
