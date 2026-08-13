import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const cacheDirectory = process.env.PUBLIC_CACHE_DIR || join(process.cwd(), ".cache", "public-data")
const defaultTtlMs = Number(process.env.PUBLIC_CACHE_TTL_SECONDS || 300) * 1_000

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

function cachePath(key: string): string {
  const filename = createHash("sha256").update(key).digest("hex")
  return join(cacheDirectory, `${filename}.json`)
}

/**
 * Read public data from a local JSON cache file, falling back to the supplied
 * loader when the entry is missing, expired, or unreadable.
 */
export function getCachedPublicData<T>(key: string, loader: () => T, ttlMs = defaultTtlMs): T {
  const path = cachePath(key)

  try {
    if (existsSync(path)) {
      const entry = JSON.parse(readFileSync(path, "utf8")) as CacheEntry<T>
      if (entry.expiresAt > Date.now()) return entry.value
    }
  } catch {
    // A cache failure must never prevent the public site from rendering.
  }

  const value = loader()

  try {
    mkdirSync(dirname(path), { recursive: true })
    const tempPath = `${path}.${process.pid}.tmp`
    writeFileSync(tempPath, JSON.stringify({ expiresAt: Date.now() + ttlMs, value }), "utf8")
    renameSync(tempPath, path)
  } catch {
    // The result remains valid even when the cache directory is not writable.
  }

  return value
}

/** Remove every public-data entry after a CMS write changes public output. */
export function invalidatePublicDataCache(): void {
  try {
    rmSync(cacheDirectory, { recursive: true, force: true })
  } catch {
    // Cache invalidation is best effort; expired entries still self-heal.
  }
}
