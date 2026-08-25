import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { getContentTypeRegistry, setContentTypeRegistry } from "./content-types"

let loadedPath: string | undefined

export function getServerContentTypeRegistry() {
  const configuredPath = process.env.BEAVER_CONTENT_TYPE_REGISTRY_PATH?.trim()
    || process.env.CONTENT_TYPE_REGISTRY_PATH?.trim()
  const hostPath = resolve(process.cwd(), "src/components/web/content-type-templates/registry.json")
  const registryPath = configuredPath
    ? resolve(process.cwd(), configuredPath)
    : existsSync(hostPath)
      ? hostPath
      : undefined
  if (registryPath && registryPath !== loadedPath) {
    setContentTypeRegistry(JSON.parse(readFileSync(registryPath, "utf8")))
    loadedPath = registryPath
  }

  return getContentTypeRegistry()
}
