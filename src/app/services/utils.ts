import type { ServiceResult } from "@zaenpm/beaver/pkg/types"

export function serviceSuccess<T>(data: T, message: string): ServiceResult<T> {
  return { success: true, data, message }
}

export function serviceForbidden(message = "Forbidden."): ServiceResult<never> {
  return { success: false, error: { code: "forbidden", message } }
}

export function serviceNotFound(resource = "Resource"): ServiceResult<never> {
  return { success: false, error: { code: "not_found", message: `${resource} not found.` } }
}

export function serviceConflict(field: string, message = "Already exists."): ServiceResult<never> {
  return { success: false, error: { code: "conflict", message, fieldErrors: { [field]: [message] } } }
}

export function serviceValidationError(fieldErrors: Record<string, string[]>): ServiceResult<never> {
  return { success: false, error: { code: "validation", message: "Validation error.", fieldErrors } }
}

export function serviceUnauthorized(): ServiceResult<never> {
  return { success: false, error: { code: "unauthorized", message: "Unauthorized." } }
}
