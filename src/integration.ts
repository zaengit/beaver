import type { AstroIntegration } from "astro"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { setContentTypeRegistry } from "./app/registry/content-types"

export interface BeaverOptions {
  adminPath?: string
  contentTypeRegistry?: string | URL
  sectionRegistry?: string | URL
  menuGroupRegistry?: string | URL
}

function normalizePath(value: string | undefined) {
  const segment = value?.trim().replace(/^\/+|\/+$/g, "") || process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "") || "admin"
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(segment)) {
    throw new Error("beaver adminPath must be a single URL segment, such as panel-rahasia.")
  }
  return `/${segment}`
}

function resolveRegistry(value: string | URL | undefined, defaultFile: string, optionName: string) {
  const filePath = value instanceof URL
    ? fileURLToPath(value)
    : value
      ? resolve(process.cwd(), value)
      : fileURLToPath(new URL(defaultFile, import.meta.url))
  if (!filePath.endsWith(".json")) {
    throw new Error(`beaver ${optionName} must point to a JSON file.`)
  }
  if (!existsSync(filePath)) {
    throw new Error(`beaver ${optionName} does not exist: ${filePath}`)
  }
  return filePath
}

function readRegistry(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf8"))
}

export default function beaver(options: BeaverOptions = {}): AstroIntegration {
  const adminPath = normalizePath(options.adminPath)
  const registries = {
    "@content-type-registry": resolveRegistry(options.contentTypeRegistry, "./registry/content-types.json", "contentTypeRegistry"),
    "@section-registry": resolveRegistry(options.sectionRegistry, "./registry/sections.json", "sectionRegistry"),
    "@menu-group-registry": resolveRegistry(options.menuGroupRegistry, "./registry/menu-groups.json", "menuGroupRegistry"),
  }
  process.env.BEAVER_CONTENT_TYPE_REGISTRY_PATH = registries["@content-type-registry"]
  process.env.BEAVER_SECTION_REGISTRY_PATH = registries["@section-registry"]
  process.env.BEAVER_MENU_GROUP_REGISTRY_PATH = registries["@menu-group-registry"]
  setContentTypeRegistry(readRegistry(registries["@content-type-registry"]))

  /**
   * React 19 removed `use-sync-external-store/shim/*` subpath exports.
   * Libraries (Zustand, @tiptap/react) import those subpaths directly, and
   * Rolldown (Astro 7) resolves them through React's package context — which
   * now fails.
   *
   * Our pre-built ui.js delegates these imports to the consumer (they're
   * externalised during package build).  In dev/browser Vite serves the
   * standalone CJS shim as-is — no named exports.
   *
   * Fix: ship an ESM shim inside `dist/compat/` that re-exports from
   * `react`, and alias every `use-sync-external-store` subpath to it.
   * Vite resolves `react` normally (pre-bundled → proper ESM), so named
   * exports work in both dev and build.
   */
  const compatShim = fileURLToPath(new URL("./compat/use-sync-external-store.js", import.meta.url))

  return {
    name: "@zaenpm/beaver",
    hooks: {
      "astro:config:setup": ({ addMiddleware, injectRoute, updateConfig }) => {
        updateConfig({
          vite: {
            resolve: {
              alias: [
                { find: /^use-sync-external-store(\/.*)?$/, replacement: compatShim },
                { find: "use-sync-external-store/shim/index.js", replacement: compatShim },
                { find: "use-sync-external-store/shim/with-selector.js", replacement: compatShim },
                { find: "use-sync-external-store/shim/index", replacement: compatShim },
                { find: "use-sync-external-store/shim/with-selector", replacement: compatShim },
                { find: "use-sync-external-store/shim", replacement: compatShim },
                { find: "use-sync-external-store", replacement: compatShim },
                ...Object.entries(registries).map(([find, replacement]) => ({ find, replacement })),
              ],
            },
            define: { __ADMIN_PATH__: JSON.stringify(adminPath) },
            ssr: { noExternal: ["@zaenpm/beaver"] },
            optimizeDeps: {
              include: [
                "highlight.js/lib/core",
              ],
            },
          },
        })
        injectRoute({ pattern: "/__cms/control-panel", entrypoint: new URL("./astro/admin.astro", import.meta.url), prerender: false })
        injectRoute({ pattern: "/__cms/http", entrypoint: new URL("./astro/http.js", import.meta.url), prerender: false })
        addMiddleware({ entrypoint: new URL("./astro/middleware.js", import.meta.url), order: "pre" })
      },
    },
  }
}
