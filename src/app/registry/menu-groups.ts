import fallbackGroups from "../../registry/menu-groups.json"

export interface MenuGroup {
  type: string
  label: string
  description?: string
}

function isMenuGroupRegistry(value: unknown): value is MenuGroup[] {
  return Array.isArray(value)
}

export function getMenuGroupRegistry() {
  const browserRegistry = (globalThis as typeof globalThis & { __CMS_MENU_GROUP_REGISTRY__?: unknown }).__CMS_MENU_GROUP_REGISTRY__
  return isMenuGroupRegistry(browserRegistry) ? browserRegistry : fallbackGroups as MenuGroup[]
}
