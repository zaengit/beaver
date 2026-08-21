import sanitizeHtmlLibrary from "sanitize-html"

const allowedTags = [
  "p", "br", "strong", "em", "u", "s", "blockquote", "pre", "code",
  "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "hr",
  "a", "button", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "iframe",
]
const MAX_HTML_LENGTH = 100_000
const MAX_TEXT_LENGTH = 10_000

/**
 * Sanitizes editor HTML with a parser-based allowlist before it reaches an Astro
 * `set:html` sink. Do not replace this with regexes: browsers normalize encoded
 * URLs and malformed markup after a regex has inspected it.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ""

  return sanitizeHtmlLibrary(html.slice(0, MAX_HTML_LENGTH), {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    transformTags: {
      a(tagName, attribs) {
        const target = attribs.target?.trim().toLowerCase()
        const nextAttribs = { ...attribs }

        if (!["_self", "_blank", "_parent", "_top"].includes(target ?? "")) {
          delete nextAttribs.target
          delete nextAttribs.rel
          return { tagName, attribs: nextAttribs }
        }

        nextAttribs.target = target
        if (target === "_blank") {
          // Never preserve an attacker-supplied `opener` token.
          nextAttribs.rel = "noopener noreferrer"
        } else {
          delete nextAttribs.rel
        }
        return { tagName, attribs: nextAttribs }
      },
    },
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
  return sanitizeHtmlLibrary(text.slice(0, MAX_TEXT_LENGTH), { allowedTags: [], allowedAttributes: {} }).trim()
}
