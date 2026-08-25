import type { AstroComponentFactory } from "astro/runtime/server/index.js"
import { contentTypeRegistry as registry } from "@/shared/registry"
import { createComponentMap } from "@/components/component-map"

type TemplateKind = "archive" | "detail"
type TemplateComponent = AstroComponentFactory

const archiveComponents = createComponentMap(
  import.meta.glob("./archive/*.astro", { eager: true }),
  "./archive/",
)
const detailComponents = createComponentMap(
  import.meta.glob("./detail/*.astro", { eager: true }),
  "./detail/",
)

export function getTemplate(id: string, kind: TemplateKind) {
  return registry.templates.find((candidate) => candidate.id === id && candidate.kind === kind)
}

export function getArchiveTemplateComponent(id: string): TemplateComponent {
  const template = getTemplate(id, "archive")
  return archiveComponents[template?.id ?? "default"] ?? archiveComponents.default
}

export function getDetailTemplateComponent(id: string): TemplateComponent {
  const template = getTemplate(id, "detail")
  return detailComponents[template?.id ?? "default"] ?? detailComponents.default
}
