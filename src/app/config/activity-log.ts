import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/time"

export const DEFAULT_ACTIVITY_LOG_RETENTION_DAYS = 90
export const MIN_ACTIVITY_LOG_RETENTION_DAYS = 1
export const MAX_ACTIVITY_LOG_RETENTION_DAYS = 3_650
export const ACTIVITY_LOG_RETENTION_ENV = "BEAVER_ACTIVITY_LOG_RETENTION_DAYS"

function parseRetentionDays(value: string | undefined) {
  if (value === undefined || value.trim() === "") return DEFAULT_ACTIVITY_LOG_RETENTION_DAYS

  if (!/^\d+$/.test(value.trim())) {
    throw new Error(`${ACTIVITY_LOG_RETENTION_ENV} must be a whole number between ${MIN_ACTIVITY_LOG_RETENTION_DAYS} and ${MAX_ACTIVITY_LOG_RETENTION_DAYS}.`)
  }

  const days = Number(value.trim())
  if (!Number.isSafeInteger(days) || days < MIN_ACTIVITY_LOG_RETENTION_DAYS || days > MAX_ACTIVITY_LOG_RETENTION_DAYS) {
    throw new Error(`${ACTIVITY_LOG_RETENTION_ENV} must be a whole number between ${MIN_ACTIVITY_LOG_RETENTION_DAYS} and ${MAX_ACTIVITY_LOG_RETENTION_DAYS}.`)
  }

  return days
}

export function getActivityLogRetentionDays() {
  return parseRetentionDays(process.env[ACTIVITY_LOG_RETENTION_ENV])
}

export function getActivityLogRetentionCutoff(now = getCurrentTimestamp()) {
  return now - getActivityLogRetentionDays() * 24 * 60 * 60
}
