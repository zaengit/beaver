import type { AstroComponentFactory } from "astro/runtime/server/index.js"

type AstroModule = { default: AstroComponentFactory }

export function createComponentMap(modules: Record<string, unknown>, directory: string) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, module]) => [
      path.replace(directory, "").replace(/\.astro$/, ""),
      (module as AstroModule).default,
    ]),
  ) as Record<string, AstroComponentFactory>
}
