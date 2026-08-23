import { createHash, randomUUID } from "node:crypto"
import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

const cacheDirectory = process.env.PUBLIC_CACHE_DIR || join(process.cwd(), ".cache", "public-data")
const configuredTtlSeconds = process.env.PUBLIC_CACHE_TTL_SECONDS === undefined
  ? 300
  : Number(process.env.PUBLIC_CACHE_TTL_SECONDS)
const defaultTtlMs = Number.isFinite(configuredTtlSeconds) && configuredTtlSeconds >= 0 && configuredTtlSeconds <= 7 * 24 * 60 * 60
  ? configuredTtlSeconds * 1_000
  : 300_000
const MAX_CACHE_FILES = 2_048
const MAX_CACHE_BYTES = 64 * 1024 * 1024
const MAX_CACHE_ENTRY_BYTES = 1 * 1024 * 1024
const CACHE_FILE_PATTERN = /^[a-f0-9]{64}\.json$/
let cacheGeneration = 0

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

function cachePath(key: string): string {
  const filename = createHash("sha256").update(key).digest("hex")
  return join(cacheDirectory, `${filename}.json`)
}

function pruneCacheDirectory(requiredBytes = 0) {
  const entries = readdirSync(cacheDirectory)
    .filter((name) => CACHE_FILE_PATTERN.test(name))
    .flatMap((name) => {
      try {
        const stats = statSync(join(cacheDirectory, name))
        return stats.isFile() ? [{ name, size: stats.size, mtimeMs: stats.mtimeMs }] : []
      } catch {
        return []
      }
    })
    .sort((left, right) => left.mtimeMs - right.mtimeMs)

  let totalBytes = entries.reduce((total, entry) => total + entry.size, 0)
  while (entries.length >= MAX_CACHE_FILES || totalBytes + requiredBytes > MAX_CACHE_BYTES) {
    const oldest = entries.shift()
    if (!oldest) break
    totalBytes -= oldest.size
    try {
      unlinkSync(join(cacheDirectory, oldest.name))
    } catch {
      // Another request may have removed the entry already.
    }
  }
}

/**
 * Read public data from a local JSON cache file, falling back to the supplied
 * loader when the entry is missing, expired, or unreadable.
 */
export async function getCachedPublicData<T>(key: string, loader: () => T | Promise<T>, ttlMs = defaultTtlMs): Promise<T> {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) return await loader()
  const generationAtStart = cacheGeneration
  const path = cachePath(key)

  try {
    if (existsSync(path) && lstatSync(path).isFile() && statSync(path).size <= MAX_CACHE_ENTRY_BYTES) {
      const entry = JSON.parse(readFileSync(path, "utf8")) as CacheEntry<T>
      if (generationAtStart === cacheGeneration && Number.isFinite(entry.expiresAt) && entry.expiresAt > Date.now()) return entry.value
    }
  } catch {
    // A cache failure must never prevent the public site from rendering.
  }

  const value = await loader()

  if (value === null || value === undefined) return value
  if (generationAtStart !== cacheGeneration) return value

  let serialized: string
  try {
    const encoded = JSON.stringify({ expiresAt: Date.now() + ttlMs, value })
    if (typeof encoded !== "string") return value
    serialized = encoded
  } catch {
    return value
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_CACHE_ENTRY_BYTES) return value

  let tempPath: string | undefined
  try {
    if (generationAtStart !== cacheGeneration) return value
    const directory = dirname(path)
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    chmodSync(directory, 0o700)
    pruneCacheDirectory(Buffer.byteLength(serialized, "utf8"))
    tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`
    writeFileSync(tempPath, serialized, { encoding: "utf8", mode: 0o600, flag: "wx" })
    renameSync(tempPath, path)
    tempPath = undefined
  } catch {
    if (tempPath) {
      try {
        unlinkSync(tempPath)
      } catch {
        // Cleanup is best effort.
      }
    }
    // The result remains valid even when the cache directory is not writable.
  }

  return value
}

/** Remove every public-data entry after a CMS write changes public output. */
export function invalidatePublicDataCache(): void {
  cacheGeneration += 1
  try {
    if (!existsSync(cacheDirectory)) return
    for (const name of readdirSync(cacheDirectory)) {
      if (!CACHE_FILE_PATTERN.test(name)) continue
      try {
        unlinkSync(join(cacheDirectory, name))
      } catch {
        // Another request may have removed the entry already.
      }
    }
  } catch {
    // Cache invalidation is best effort; expired entries still self-heal.
  }
}
