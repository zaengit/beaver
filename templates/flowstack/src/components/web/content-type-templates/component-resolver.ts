import registry from "@content-type-registry";

const archiveComponents = Object.fromEntries(
  Object.entries(import.meta.glob("./archive/*.astro", { eager: true })).map(
    ([path, module]) => [
      path.replace("./archive/", "").replace(".astro", ""),
      (module as { default: unknown }).default,
    ],
  ),
) as Record<string, unknown>;

const detailComponents = Object.fromEntries(
  Object.entries(import.meta.glob("./detail/*.astro", { eager: true })).map(
    ([path, module]) => [
      path.replace("./detail/", "").replace(".astro", ""),
      (module as { default: unknown }).default,
    ],
  ),
) as Record<string, unknown>;

export function getArchiveTemplateComponent(id: string) {
  const template = registry.templates.find((candidate) => candidate.id === id && candidate.kind === "archive");
  return archiveComponents[template?.id ?? "default"] ?? archiveComponents.default;
}

export function getDetailTemplateComponent(id: string) {
  const template = registry.templates.find((candidate) => candidate.id === id && candidate.kind === "detail");
  return detailComponents[template?.id ?? "default"] ?? detailComponents.default;
}
