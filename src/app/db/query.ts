export function affectedRows(result: unknown): number {
  if (Array.isArray(result)) return affectedRows(result[0])
  if (!result || typeof result !== "object") return 0
  const record = result as Record<string, unknown>
  for (const key of ["changes", "affectedRows", "rowCount"]) {
    const value = record[key]
    if (typeof value === "number") return value
  }
  // sqlite-proxy wraps the run metadata in `{ rows: [{ changes }] }`.
  if (record.rows !== result) return affectedRows(record.rows)
  return 0
}
