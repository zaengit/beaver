import { getServerContentTypeRegistry } from "@zbeaver/beaver/app/registry/server-content-types"

const builtInContentTypes = ["post", "page"]

export type ContentAction =
  | "view"
  | "create"
  | "edit"
  | "edit-own"
  | "delete"
  | "delete-own"
  | "publish"
  | "publish-own"
  | "unpublish"
  | "unpublish-own"
export type CategoryAction = "view" | "manage" | "publish" | "unpublish"

export function isKnownContentType(type: string) {
  return builtInContentTypes.includes(type) || getServerContentTypeRegistry().contentTypes.some((contentType) => contentType.slug === type)
}

export function getKnownContentTypes() {
  const seen = new Set<string>()
  return [...builtInContentTypes, ...getServerContentTypeRegistry().contentTypes.map((contentType) => contentType.slug)]
    .filter((type) => {
      if (seen.has(type)) return false
      seen.add(type)
      return true
    })
}

export function contentPermission(type: string, action: ContentAction) {
  return `content.${type}.${action}`
}

export function categoryPermission(type: string, action: CategoryAction) {
  return `category.${type}.${action}`
}
