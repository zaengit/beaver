import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import registry from "@content-type-registry";

type TemplateComponent = AstroComponentFactory;

const archiveComponents = Object.fromEntries(
  Object.entries(import.meta.glob("./archive/*.astro", { eager: true })).map(
    ([path, module]) => [
      path.replace("./archive/", "").replace(".astro", ""),
      (module as { default: TemplateComponent }).default,
    ],
  ),
) as Record<string, TemplateComponent>;

const detailComponents = Object.fromEntries(
  Object.entries(import.meta.glob("./detail/*.astro", { eager: true })).map(
    ([path, module]) => [
      path.replace("./detail/", "").replace(".astro", ""),
      (module as { default: TemplateComponent }).default,
    ],
  ),
) as Record<string, TemplateComponent>;

export function getArchiveTemplateComponent(id: string): TemplateComponent {
  const template = registry.templates.find((candidate) => candidate.id === id && candidate.kind === "archive");
  return archiveComponents[template?.id ?? "default"] ?? archiveComponents.default;
}

export function getDetailTemplateComponent(id: string): TemplateComponent {
  const template = registry.templates.find((candidate) => candidate.id === id && candidate.kind === "detail");
  return detailComponents[template?.id ?? "default"] ?? detailComponents.default;
}
