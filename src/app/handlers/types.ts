/**
 * Shared handler types — imported by all handler modules.
 */

/** Current user session (null = unauthenticated). */
export type Session = { user: { id: string } } | null

/** Response returned by admin API handlers (JSON Response). */
export type HandlerResponse = Response

/** Signature for service-layer calls that return `ServiceResult<T>`. */
export type ServiceCall<T> = {
  success: boolean
  data?: T
  error?: { code: string; message: string; fieldErrors?: Record<string, string[]> }
  message?: string
}
