const RATE_LIMITS = new Map<string, { count: number; resetAt: number }>()
const MAX_RATE_LIMIT_KEYS = 10_000

/** Check a limit without consuming a slot. Useful when the outcome of a
 * request determines whether it should count against the limit. */
export function isRateLimitAvailable(key: string, limit: number) {
  const current = RATE_LIMITS.get(key)
  if (!current) return true
  if (current.resetAt <= Date.now()) {
    RATE_LIMITS.delete(key)
    return true
  }
  return current.count < limit
}

export function resetRateLimit(key: string) {
  RATE_LIMITS.delete(key)
}

export function isWithinRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  if (RATE_LIMITS.size >= MAX_RATE_LIMIT_KEYS) {
    for (const [storedKey, value] of RATE_LIMITS) {
      if (value.resetAt <= now) RATE_LIMITS.delete(storedKey)
    }
    if (RATE_LIMITS.size >= MAX_RATE_LIMIT_KEYS && !RATE_LIMITS.has(key)) {
      const oldestKey = RATE_LIMITS.keys().next().value
      if (oldestKey) RATE_LIMITS.delete(oldestKey)
    }
  }

  const current = RATE_LIMITS.get(key)
  if (!current || current.resetAt <= now) {
    RATE_LIMITS.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}
