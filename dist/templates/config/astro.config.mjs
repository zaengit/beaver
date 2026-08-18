import { defineConfig } from "astro/config"
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import react from "@astrojs/react"
import node from "@astrojs/node"
import tailwindcss from "@tailwindcss/vite"
import { loadEnv } from "vite"
import zadm from "@zaenpm/zadm"

function normalizePath(value, fallback, envName) {
  const segment = value?.trim().replace(/^\/+|\/+$/g, "") || fallback

  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(segment)) {
    throw new Error(`${envName} must be a single URL segment, such as panel-rahasia.`)
  }

  return `/${segment}`
}

function resolveRegistryPath(value, fallback, envName) {
  const filePath = resolve(process.cwd(), value?.trim() || fallback)

  if (!filePath.endsWith(".json")) {
    throw new Error(`${envName} must point to a JSON file.`)
  }
  if (!existsSync(filePath)) {
    throw new Error(`${envName} does not exist: ${filePath}`)
  }

  return filePath
}

const environment = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "")
Object.assign(process.env, environment)
const adminPath = normalizePath(environment.ADMIN_PATH, "admin", "ADMIN_PATH")
const sectionRegistryPath = resolveRegistryPath(
  environment.SECTION_REGISTRY_PATH,
  "src/components/web/sections/registry.json",
  "SECTION_REGISTRY_PATH",
)
const contentTypeRegistryPath = resolveRegistryPath(
  environment.CONTENT_TYPE_REGISTRY_PATH,
  "src/components/web/content-type-templates/registry.json",
  "CONTENT_TYPE_REGISTRY_PATH",
)
const menuGroupRegistryPath = resolveRegistryPath(
  environment.MENU_GROUP_REGISTRY_PATH,
  "src/components/web/menus/registry.json",
  "MENU_GROUP_REGISTRY_PATH",
)

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    server: {
      watch: {
        ignored: [
          "**/sqlite.db",
          "**/sqlite.db-wal",
          "**/sqlite.db-shm",
        ],
      },
    },
  },
  integrations: [react(), zadm({
    adminPath,
    sectionRegistry: sectionRegistryPath,
    contentTypeRegistry: contentTypeRegistryPath,
    menuGroupRegistry: menuGroupRegistryPath,
  })],
  server: { host: true },
  security: {
    checkOrigin: true,
  },
})
