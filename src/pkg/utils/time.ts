export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

/** Normalize Unix timestamps expressed in either seconds or milliseconds. */
export function toDateMilliseconds(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  return Math.abs(value) < 10_000_000_000 ? value * 1_000 : value
}
