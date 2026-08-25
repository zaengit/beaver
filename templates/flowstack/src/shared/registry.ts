export interface ContentTypeRegistry {
  contentTypes: Array<{
    name: string
    label: string
    slug: string
    icon?: string
    description: string | null
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

export interface SectionTemplate {
  type: string
  contentType?: string
  [key: string]: unknown
}

export interface MenuGroup {
  type: string
  label: string
  description?: string
}

const registryModules = import.meta.glob("../components/**/registry.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>

function loadRegistry<T>(configuredPath: string | undefined, envName: string): T {
  const path = configuredPath?.trim()
  if (!path) throw new Error(`${envName} is required`)

  const normalizedPath = path.replaceAll("\\", "/")
  const marker = "src/components/"
  const markerIndex = normalizedPath.lastIndexOf(marker)
  const relativePath = markerIndex >= 0
    ? normalizedPath.slice(markerIndex + marker.length)
    : normalizedPath.replace(/^\.?\/?/, "")
  const moduleKey = `../components/${relativePath}`
  const registry = registryModules[moduleKey]

  if (!registry) throw new Error(`${envName} points to an unavailable registry: ${path}`)
  return registry as T
}

export const contentTypeRegistry = loadRegistry<ContentTypeRegistry>(
  import.meta.env.CONTENT_TYPE_REGISTRY_PATH,
  "CONTENT_TYPE_REGISTRY_PATH",
)

export const sectionRegistry = loadRegistry<SectionTemplate[]>(
  import.meta.env.SECTION_REGISTRY_PATH,
  "SECTION_REGISTRY_PATH",
)

export const menuGroupRegistry = loadRegistry<MenuGroup[]>(
  import.meta.env.MENU_GROUP_REGISTRY_PATH,
  "MENU_GROUP_REGISTRY_PATH",
)
