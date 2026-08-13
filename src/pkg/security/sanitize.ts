import sanitizeHtmlLibrary from "sanitize-html"

const allowedTags = [
  "p", "br", "strong", "em", "u", "s", "blockquote", "pre", "code",
  "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "hr",
  "a", "button", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "iframe",
]

/**
 * Sanitizes editor HTML with a parser-based allowlist before it reaches an Astro
 * `set:html` sink. Do not replace this with regexes: browsers normalize encoded
 * URLs and malformed markup after a regex has inspected it.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  return sanitizeHtmlLibrary(html, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    exclusiveFilter(frame) {
      return frame.tag === "iframe" && !frame.attribs.src
    },
    enforceHtmlBoundary: true,
    disallowedTagsMode: "discard",
  })
}

/** Sanitizes plain text by stripping HTML tags and trimming. */
export function sanitizeText(text: string): string {
  if (!text) return ""
  return sanitizeHtmlLibrary(text, { allowedTags: [], allowedAttributes: {} }).trim()
}
