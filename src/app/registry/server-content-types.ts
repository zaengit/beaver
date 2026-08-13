import { readFileSync } from "node:fs"
import { getContentTypeRegistry, setContentTypeRegistry } from "./content-types"

let loadedPath: string | undefined

export function getServerContentTypeRegistry() {
  const registryPath = process.env.ZADM_CONTENT_TYPE_REGISTRY_PATH
  if (registryPath && registryPath !== loadedPath) {
    setContentTypeRegistry(JSON.parse(readFileSync(registryPath, "utf8")))
    loadedPath = registryPath
  }

  return getContentTypeRegistry()
}
