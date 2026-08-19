/**
 * Maps service-layer error codes to HTTP responses.
 *
 * Every handler used to repeat the same if-else chain:
 *   if (result.error.code === "validation") return adminError(..., 422)
 *   if (result.error.code === "conflict")   return adminError(..., 409)
 *   ...
 *
 * This function centralises that mapping so handlers can just call
 * `mapServiceError(result)`.
 */

import { adminError } from "@zaenpm/beaver/app/admin/api-response"
import type { HandlerResponse } from "@zaenpm/beaver/app/handlers/types"

/** Maps well-known `error.code` strings to HTTP status codes. */
const CODE_STATUS: Record<string, number> = {
  validation: 422,
  conflict: 409,
  not_found: 404,
  forbidden: 403,
  unauthorized: 401,
}

/**
 * Converts a failed service result into the appropriate `adminError` response.
 * Falls back to `statusCode` (default 400) for unknown error codes.
 */
export function mapServiceError(
  result: { error?: { code?: string; message: string; fieldErrors?: Record<string, string[]> } },
  fallbackStatus = 400,
): HandlerResponse {
  const code = result.error?.code ?? ""
  const status = CODE_STATUS[code] ?? fallbackStatus
  return adminError(result.error?.message ?? "Unknown error.", status, result.error?.fieldErrors)
}