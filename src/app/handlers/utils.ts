import type { ZodIssue, ZodType } from "zod"

export function toFieldErrors(issues: ZodIssue[]) {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    const field = String(issue.path[0] ?? "_root")
    if (!acc[field]) acc[field] = []
    acc[field].push(issue.message)
    return acc
  }, {})
}

export function parseWithSchema<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
  message = "Validation error.",
) {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false as const,
      message,
      fieldErrors: toFieldErrors(parsed.error.issues),
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export const MAX_BULK_IDS = 100

const bulkIdPattern = /^[A-Za-z0-9_-]{1,128}$/

/** Validates and bounds IDs before bulk handlers fan out database queries. */
export function parseBulkIds(input: unknown) {
  if (!Array.isArray(input) || input.length === 0) {
    return { success: false as const, message: "At least one id is required." }
  }
  if (input.length > MAX_BULK_IDS) {
    return { success: false as const, message: `At most ${MAX_BULK_IDS} ids may be processed at once.` }
  }

  const ids: string[] = []
  for (const value of input) {
    if (typeof value !== "string" || !bulkIdPattern.test(value)) {
      return { success: false as const, message: "Every id must be a short alphanumeric identifier." }
    }
    if (!ids.includes(value)) ids.push(value)
  }

  return { success: true as const, ids }
}
