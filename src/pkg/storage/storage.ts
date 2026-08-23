import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3"
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import { dirname, isAbsolute, relative, resolve, sep } from "node:path"

export type StorageType = "local" | "s3"

interface S3StorageConfig {
  bucket: string
  endpoint?: string
  region: string
  forcePathStyle: boolean
  accessKeyId?: string
  secretAccessKey?: string
}

let cachedS3: { cacheKey: string; client: S3Client; config: S3StorageConfig } | null = null

function envValue(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value || undefined
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return !["false", "0", "no", "off"].includes(value.toLowerCase())
}

/** Returns the configured storage backend. */
export function getStorageType(): StorageType {
  const value = envValue("STORAGE_TYPE")?.toLowerCase() || "local"
  if (value !== "local" && value !== "s3") {
    throw new Error('STORAGE_TYPE must be either "local" or "s3".')
  }
  return value
}

/**
 * Returns the directory used by the local storage backend.
 *
 * STORAGE_PATH is resolved from the consuming project's working directory
 * when it is relative. STORAGE_DIR is accepted as an alias. Existing
 * projects that only configure UPLOAD_DIR continue to use <UPLOAD_DIR>/storage.
 */
export function getStorageDir(): string {
  const configuredPath = envValue("STORAGE_PATH") || envValue("STORAGE_DIR")
  if (configuredPath) return resolve(process.cwd(), configuredPath)

  const uploadDir = envValue("UPLOAD_DIR") || "./public"
  return resolve(process.cwd(), uploadDir, "storage")
}

function normalizeStorageKey(filePath: string): string {
  const value = filePath.trim().replace(/^\/+/, "")
  const key = value === "storage"
    ? ""
    : value.startsWith("storage/")
      ? value.slice("storage/".length)
      : value

  if (
    !key
    || key.includes("\0")
    || key.includes("\\")
    || key.split("/").some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Invalid storage file path.")
  }

  return key
}

function resolveStorageFile(filePath: string): string {
  const storageDir = getStorageDir()
  const target = resolve(storageDir, normalizeStorageKey(filePath))
  const relativeTarget = relative(storageDir, target)

  if (
    !relativeTarget
    || relativeTarget === ".."
    || relativeTarget.startsWith(`..${sep}`)
    || isAbsolute(relativeTarget)
  ) {
    throw new Error("Invalid storage file path.")
  }

  return target
}

function getS3StorageConfig(): S3StorageConfig {
  const bucket = envValue("S3_BUCKET")
  if (!bucket) throw new Error("S3_BUCKET is required when STORAGE_TYPE=s3.")

  const accessKeyId = envValue("S3_ACCESS_KEY_ID")
    || envValue("S3_ACCESS_KEY")
    || envValue("AWS_ACCESS_KEY_ID")
  const secretAccessKey = envValue("S3_SECRET_ACCESS_KEY")
    || envValue("S3_SECRET_KEY")
    || envValue("AWS_SECRET_ACCESS_KEY")

  if ((accessKeyId && !secretAccessKey) || (!accessKeyId && secretAccessKey)) {
    throw new Error("S3 access key and secret key must be configured together.")
  }

  return {
    bucket,
    endpoint: envValue("S3_ENDPOINT"),
    region: envValue("S3_REGION") || "us-east-1",
    forcePathStyle: parseBoolean(envValue("S3_FORCE_PATH_STYLE"), false),
    accessKeyId,
    secretAccessKey,
  }
}

function getS3Storage(): { client: S3Client; config: S3StorageConfig } {
  const config = getS3StorageConfig()
  const cacheKey = JSON.stringify(config)
  if (cachedS3?.cacheKey === cacheKey) return cachedS3

  const clientConfig: S3ClientConfig = {
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    ...(config.endpoint ? { endpoint: config.endpoint } : {}),
    ...(config.accessKeyId && config.secretAccessKey
      ? { credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } }
      : {}),
  }
  const client = new S3Client(clientConfig)
  cachedS3 = { cacheKey, client, config }
  return cachedS3
}

function isMissingS3Object(error: unknown): boolean {
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } }
  return candidate.name === "NoSuchKey"
    || candidate.name === "NotFound"
    || candidate.$metadata?.httpStatusCode === 404
}

/** Saves a file using the configured local or S3-compatible backend. */
export async function writeStorageFile(filePath: string, data: Uint8Array | string): Promise<void> {
  if (getStorageType() === "local") {
    const target = resolveStorageFile(filePath)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, data)
    return
  }

  const key = normalizeStorageKey(filePath)
  const { client, config } = getS3Storage()
  await client.send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: data }))
}

/** Reads a file using the configured local or S3-compatible backend. */
export async function readStorageFile(filePath: string): Promise<Uint8Array | null> {
  if (getStorageType() === "local") {
    const target = resolveStorageFile(filePath)
    try {
      return await readFile(target)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
      throw error
    }
  }

  const key = normalizeStorageKey(filePath)
  const { client, config } = getS3Storage()
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }))
    if (!response.Body) return null
    return Buffer.from(await response.Body.transformToByteArray())
  } catch (error) {
    if (isMissingS3Object(error)) return null
    throw error
  }
}

/** Deletes a file using the configured local or S3-compatible backend. */
export async function deleteStorageFile(filePath: string): Promise<boolean> {
  if (getStorageType() === "local") {
    const target = resolveStorageFile(filePath)
    try {
      await unlink(target)
      return true
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return false
      throw error
    }
  }

  const key = normalizeStorageKey(filePath)
  const { client, config } = getS3Storage()
  try {
    await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }))
    return true
  } catch (error) {
    if (isMissingS3Object(error)) return false
    throw error
  }
}
