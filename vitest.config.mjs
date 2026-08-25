import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = fileURLToPath(new URL(".", import.meta.url))
const sourceRoot = resolve(projectRoot, "src")

export default {
  resolve: {
    alias: {
      "@zbeaver/beaver": sourceRoot,
      "@content-type-registry": resolve(sourceRoot, "registry/content-types.json"),
      "@menu-group-registry": resolve(sourceRoot, "registry/menu-groups.json"),
      "@section-registry": resolve(sourceRoot, "registry/sections.json"),
    },
  },
  test: {
    globals: true,
    exclude: ["**/node_modules/**", "**/dist/**", "create-beaver/bin/installer.test.mjs"],
  },
}
