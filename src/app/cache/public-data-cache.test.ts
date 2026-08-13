import { afterEach, describe, expect, it } from "vitest"
import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const cacheDir = mkdtempSync(join(tmpdir(), "web-next-public-cache-"))
process.env.PUBLIC_CACHE_DIR = cacheDir

const { getCachedPublicData, invalidatePublicDataCache } = await import("./public-data-cache")

afterEach(() => invalidatePublicDataCache())

describe("public file cache", () => {
  it("uses the cached file until it expires", () => {
    let calls = 0
    const load = () => ({ value: ++calls })

    expect(getCachedPublicData("home", load)).toEqual({ value: 1 })
    expect(getCachedPublicData("home", load)).toEqual({ value: 1 })
    expect(calls).toBe(1)
  })

  it("invalidates all public cache files", () => {
    getCachedPublicData("settings", () => ({ title: "CMS" }))
    expect(existsSync(cacheDir)).toBe(true)

    invalidatePublicDataCache()
    expect(existsSync(cacheDir)).toBe(false)
  })
})

afterEach(() => rmSync(cacheDir, { recursive: true, force: true }))
