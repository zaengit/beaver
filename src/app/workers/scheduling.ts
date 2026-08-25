import {
  listDueScheduledPostRecords,
  normalizeLegacyScheduledPostRecords,
  publishScheduledPostRecord,
} from "@zbeaver/beaver/app/repositories/posts"
import { createActivityLogRecord } from "@zbeaver/beaver/app/repositories/activity-logs"
import { purgeExpiredActivityLogs } from "@zbeaver/beaver/app/services/activity-logs"
import { invalidatePublicDataCache } from "@zbeaver/beaver/app/cache/public-data-cache"

const DEFAULT_INTERVAL_SECONDS = 60
const MIN_INTERVAL_SECONDS = 1
const MAX_INTERVAL_SECONDS = 24 * 60 * 60
const DEFAULT_BATCH_SIZE = 100
const MAX_BATCH_SIZE = 1_000

export interface SchedulingWorkerCycleResult {
  normalized: number
  published: number
  activityLogs: number
  activityLogFailures: number
  purged: number
}

export interface SchedulingWorkerOptions {
  intervalMs?: number
  batchSize?: number
  signal?: AbortSignal
  onCycle?: (result: SchedulingWorkerCycleResult) => void | Promise<void>
}

function boundedInteger(value: string | undefined, fallback: number, minimum: number, maximum: number) {
  if (value === undefined || value.trim() === "") return fallback
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) return fallback
  return parsed
}

export function getSchedulingWorkerIntervalMs() {
  return boundedInteger(
    process.env.BEAVER_WORKER_INTERVAL_SECONDS,
    DEFAULT_INTERVAL_SECONDS,
    MIN_INTERVAL_SECONDS,
    MAX_INTERVAL_SECONDS,
  ) * 1_000
}

export function getSchedulingWorkerBatchSize() {
  return boundedInteger(process.env.BEAVER_WORKER_BATCH_SIZE, DEFAULT_BATCH_SIZE, 1, MAX_BATCH_SIZE)
}

async function recordScheduledPublication(postId: string, scheduledAt: number | null, publishedAt: number) {
  await createActivityLogRecord({
    action: "publish_scheduled",
    resource: "post",
    resourceId: postId,
    metadata: {
      scheduledAt,
      publishedAt,
      delaySeconds: scheduledAt === null ? null : Math.max(0, Math.floor((publishedAt - scheduledAt) / 1_000)),
    },
    userAgent: "beaver-scheduling-worker",
    success: true,
    statusCode: 200,
    actorId: null,
  })
}

export async function runSchedulingWorkerCycle(
  now = Date.now(),
  batchSize = getSchedulingWorkerBatchSize(),
): Promise<SchedulingWorkerCycleResult> {
  const normalized = await normalizeLegacyScheduledPostRecords(now)
  const duePosts = await listDueScheduledPostRecords(now, batchSize)
  let published = 0
  let activityLogs = 0
  let activityLogFailures = 0

  for (const post of duePosts) {
    const claimed = await publishScheduledPostRecord(post.id, now)
    if (!claimed) continue

    published += 1
    try {
      await recordScheduledPublication(post.id, post.publishedAt, now)
      activityLogs += 1
    } catch (error) {
      activityLogFailures += 1
      console.error(`Activity log failed for scheduled post ${post.id}`, error)
    }
  }

  if (published > 0) invalidatePublicDataCache()
  const purged = await purgeExpiredActivityLogs()

  return { normalized, published, activityLogs, activityLogFailures, purged }
}

function waitForNextCycle(intervalMs: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve()
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, intervalMs)
    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }
    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

/** Run the scheduling loop until the host sends an abort signal. */
export async function runSchedulingWorker(options: SchedulingWorkerOptions = {}) {
  const intervalMs = options.intervalMs ?? getSchedulingWorkerIntervalMs()
  const batchSize = options.batchSize ?? getSchedulingWorkerBatchSize()

  if (!Number.isInteger(intervalMs) || intervalMs < MIN_INTERVAL_SECONDS * 1_000) {
    throw new Error("Scheduling worker interval must be at least one second.")
  }
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) {
    throw new Error(`Scheduling worker batch size must be between 1 and ${MAX_BATCH_SIZE}.`)
  }

  while (!options.signal?.aborted) {
    try {
      const result = await runSchedulingWorkerCycle(Date.now(), batchSize)
      await options.onCycle?.(result)
    } catch (error) {
      console.error("Scheduling worker cycle failed", error)
    }

    if (options.signal?.aborted) break
    await waitForNextCycle(intervalMs, options.signal)
  }
}
