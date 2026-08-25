function parseJson(value: unknown, maxLength: number): unknown {
  if (typeof value !== "string" || value.length > maxLength) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function parseJsonArray(value: unknown, maxLength = 100_000): unknown[] {
  const parsed = parseJson(value, maxLength)
  return Array.isArray(parsed) ? parsed : []
}

export function parseJsonObject(value: unknown, maxLength = 1_000_000): Record<string, unknown> {
  const parsed = parseJson(value, maxLength)
  return isRecord(parsed)
    ? parsed
    : {}
}
