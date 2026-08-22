import { safeContentHref, safePathSegment } from "./safe-url"

export interface PublicPostLink {
  type: string
  slug: string
}

export function publicPostHref(post: PublicPostLink) {
  if (post.type === "page") {
    return post.slug === "home" ? "/" : `/${safePathSegment(post.slug, "")}`
  }

  return safeContentHref(post.type, post.slug)
}
