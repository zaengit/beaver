import fallbackSections from "../../registry/sections.json"

export interface SectionTemplate {
  type: string
  label?: string
  description?: string
  sectionFields?: string[]
  itemFields: string[]
  itemMode?: string
  contentType?: string
  demo?: { section?: Record<string, unknown>; items?: Record<string, unknown>[] }
}

function isSectionRegistry(value: unknown): value is SectionTemplate[] {
  return Array.isArray(value)
}

export function getSectionRegistry() {
  const browserRegistry = (globalThis as typeof globalThis & { __CMS_SECTION_REGISTRY__?: unknown }).__CMS_SECTION_REGISTRY__
  return isSectionRegistry(browserRegistry) ? browserRegistry : fallbackSections as SectionTemplate[]
}
