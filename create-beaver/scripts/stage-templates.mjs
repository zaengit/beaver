import { cp, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const sourceDirectory = resolve(packageDirectory, "..", "templates")
const destinationDirectory = resolve(packageDirectory, "templates")
const buildArtifacts = new Set(["node_modules", ".astro", ".vite"])
const copyFilter = (source) => !source.split(sep).some((segment) => buildArtifacts.has(segment))

if (process.argv.includes("--clean")) {
  await rm(destinationDirectory, { recursive: true, force: true })
} else {
  if (!existsSync(sourceDirectory)) throw new Error(`Template source was not found: ${sourceDirectory}`)
  await rm(destinationDirectory, { recursive: true, force: true })
  await cp(sourceDirectory, destinationDirectory, { recursive: true, filter: copyFilter })
}
