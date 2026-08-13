import fallbackRegistry from "../../registry/content-types.json"

export interface ContentTypeRegistry {
  contentTypes: Array<{
    name: string
    label: string
    slug: string
    icon?: string
    description?: string | null
    archiveTemplate: string
    detailTemplate: string
    position?: number
  }>
  templates: Array<{
    id: string
    kind: string
    sectionsEnabled?: boolean
    fieldSlots?: Array<{ key: string; label: string; type: string }>
  }>
}

let configuredRegistry = fallbackRegistry as ContentTypeRegistry

function isRegistry(value: unknown): value is ContentTypeRegistry {
  return typeof value === "object" && value !== null && Array.isArray((value as ContentTypeRegistry).contentTypes) && Array.isArray((value as ContentTypeRegistry).templates)
}

export function setContentTypeRegistry(registry: unknown) {
  if (isRegistry(registry)) configuredRegistry = registry
}

export function getContentTypeRegistry() {
  const browserRegistry = (globalThis as typeof globalThis & { __CMS_CONTENT_TYPE_REGISTRY__?: unknown }).__CMS_CONTENT_TYPE_REGISTRY__
  return isRegistry(browserRegistry) ? browserRegistry : configuredRegistry
}
