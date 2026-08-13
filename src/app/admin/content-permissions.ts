import { getServerContentTypeRegistry } from "zadm/app/registry/server-content-types"

const builtInContentTypes = ["post", "page"]

export const contentTypes = [
  ...builtInContentTypes,
  ...getServerContentTypeRegistry().contentTypes.map((contentType) => contentType.slug),
]

export type ContentAction = "view" | "create" | "edit" | "edit-own" | "delete" | "publish" | "unpublish"
export type CategoryAction = "view" | "manage" | "publish" | "unpublish"

export function isKnownContentType(type: string) {
  return builtInContentTypes.includes(type) || getServerContentTypeRegistry().contentTypes.some((contentType) => contentType.slug === type)
}

export function contentPermission(type: string, action: ContentAction) {
  return `content.${type}.${action}`
}

export function categoryPermission(type: string, action: CategoryAction) {
  return `category.${type}.${action}`
}
