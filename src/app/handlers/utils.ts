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
