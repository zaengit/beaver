import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

const SOURCE_ROOT = path.resolve(import.meta.dirname, "../..")
const SOURCE_FILE = /(?<!\.test)\.(?:ts|tsx|astro)$/
const IMPORT = /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g

const forbiddenDependencies: Record<string, RegExp[]> = {
  pkg: [/^@cms\/astro\/(?:app|router|ui|astro)(?:\/|$)/],
  app: [/^@cms\/astro\/(?:router|ui|astro)(?:\/|$)/],
  router: [/^@cms\/astro\/(?:ui|astro)(?:\/|$)/],
  ui: [
    /^@cms\/astro\/(?:router|astro)(?:\/|$)/,
    /^@cms\/astro\/app\/(?:auth|db|handlers|repositories|services|validations)(?:\/|$)/,
    /^@cms\/astro\/pkg\/security(?:\/|$)/,
  ],
}

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(target)
    return SOURCE_FILE.test(entry.name) ? [target] : []
  }))
  return nested.flat()
}

function layerOf(file: string) {
  return path.relative(SOURCE_ROOT, file).split(path.sep)[0]
}

function importsOf(source: string) {
  return [...source.matchAll(IMPORT)].map((match) => match[1] ?? match[2])
}

describe("CMS clean architecture boundaries", () => {
  it("keeps production dependencies flowing inward", async () => {
    const files = await sourceFiles(SOURCE_ROOT)
    const violations: string[] = []

    for (const file of files) {
      const rules = forbiddenDependencies[layerOf(file)]
      if (!rules) continue

      const imports = importsOf(await readFile(file, "utf8"))
      for (const specifier of imports) {
        if (rules.some((rule) => rule.test(specifier))) {
          violations.push(`${path.relative(SOURCE_ROOT, file)} must not import ${specifier}`)
        }
      }
    }

    expect(violations).toEqual([])
  })
})
