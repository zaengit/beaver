#!/usr/bin/env node

import { randomBytes } from "node:crypto"
import { chmodSync, existsSync, lstatSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const args = process.argv.slice(2)
const command = args[0]
const positionalArgs = args.slice(1).filter((arg) => !arg.startsWith("-"))
const target = positionalArgs[0]
const force = args.includes("--force")
const secretNames = ["SESSION_SECRET", "ADMIN_JWT_ACCESS_SECRET", "ADMIN_JWT_REFRESH_SECRET"]

function generateSecret() {
  return randomBytes(32).toString("base64url")
}

function parseEnvValue(rawValue) {
  const value = rawValue.trim()
  return value.length >= 2 && value[0] === value.at(-1) && ["'", '"'].includes(value[0])
    ? value.slice(1, -1)
    : value
}

function generateEnvironmentSecrets(rotate) {
  const envPath = resolve(process.cwd(), ".env")
  let content = ""

  try {
    const envStat = lstatSync(envPath)
    if (!envStat.isFile() || envStat.isSymbolicLink()) throw new Error("Refusing to write a non-regular .env path.")
    chmodSync(envPath, 0o600)
    content = readFileSync(envPath, "utf8")
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
  }

  const newline = content.includes("\r\n") ? "\r\n" : "\n"
  const lines = content.length === 0 ? [] : content.split(/\r?\n/)
  if (content.endsWith("\n")) lines.pop()

  const generated = new Map()
  const changedNames = new Set()
  const getSecret = (name) => {
    if (!generated.has(name)) generated.set(name, generateSecret())
    return generated.get(name)
  }
  const secretLinePattern = /^\s*(SESSION_SECRET|ADMIN_JWT_ACCESS_SECRET|ADMIN_JWT_REFRESH_SECRET)\s*=\s*(.*?)\s*$/
  const foundNames = new Set()

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(secretLinePattern)
    if (!match) continue

    const [, name, rawValue] = match
    foundNames.add(name)
    if (!rotate && parseEnvValue(rawValue)) continue

    lines[index] = `${name}=${getSecret(name)}`
    changedNames.add(name)
  }

  for (const name of secretNames) {
    if (foundNames.has(name)) continue
    lines.push(`${name}=${getSecret(name)}`)
    changedNames.add(name)
  }

  if (changedNames.size > 0) {
    writeFileSync(envPath, `${lines.join(newline)}${newline}`, { encoding: "utf8", mode: 0o600 })
    chmodSync(envPath, 0o600)
  }

  return { changedNames: [...changedNames] }
}

function optionValue(name) {
  const inline = args.find((arg) => arg.startsWith(`${name}=`))
  if (inline) {
    const value = inline.slice(name.length + 1)
    if (!value) throw new Error(`Option ${name} requires a value.`)
    return value
  }

  const index = args.indexOf(name)
  if (index === -1) return undefined
  const value = args[index + 1]
  if (!value || value.startsWith("-")) throw new Error(`Option ${name} requires a value.`)
  return value
}

function seedPositionalTarget() {
  const values = []
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === "--file") {
      index += 1
      continue
    }
    if (!arg.startsWith("-")) values.push(arg)
  }
  if (values.length > 1) throw new Error("Only one seed file may be supplied.")
  return values[0]
}

function parseSeedOptions() {
  const fileFlag = optionValue("--file")
  const positional = seedPositionalTarget()
  if (fileFlag && positional) throw new Error("Use either a positional seed file or --file, not both.")
  const filePath = fileFlag || positional
  if (!filePath) throw new Error("A seed file is required.")
  return {
    filePath,
    dryRun: args.includes("--dry-run"),
    overwrite: args.includes("--overwrite"),
  }
}

const usage = `Usage:
  beaver key:generate [--force]
  beaver migrate
  beaver migrate:fresh --force
  beaver seed
  beaver seed <seed.json> [--dry-run] [--overwrite]
  beaver seed --file <seed.json> [--dry-run] [--overwrite]
  beaver seed:fresh <seed.json> --force [--overwrite]
  beaver seed:system
  beaver seed:system:fresh --force
  beaver 2fa:setup [--force]
  beaver worker
  beaver worker:once
  beaver activity-log:purge
  beaver reset superadmin`

function loadDotEnv() {
  const envPath = resolve(process.cwd(), ".env")
  if (!existsSync(envPath)) return
  const envStat = lstatSync(envPath)
  if (!envStat.isFile() || envStat.isSymbolicLink()) throw new Error("Refusing to read a non-regular .env path.")
  chmodSync(envPath, 0o600)

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue
    const value = rawValue.length >= 2 && rawValue[0] === rawValue.at(-1) && ["'", '"'].includes(rawValue[0])
      ? rawValue.slice(1, -1)
      : rawValue
    process.env[key] = value
  }
}

let closeDb
async function run() {
  if (command === "key:generate") {
    const extraArgs = args.slice(1).filter((arg) => arg !== "--force")
    if (extraArgs.length > 0) throw new Error("key:generate only accepts --force.")

    const result = generateEnvironmentSecrets(force)
    if (result.changedNames.length === 0) {
      console.log(".env already contains all Beaver secrets. Use --force to rotate them.")
    } else {
      console.log(`Generated ${result.changedNames.join(", ")} in .env.`)
    }
    return
  }

  loadDotEnv()
  const runtime = await import("../dist/server.js")
  closeDb = runtime.closeDatabase
  const {
    migrate,
    formatSeedDataSummary,
    resetDatabase,
    seed,
    purgeExpiredActivityLogs,
    runSchedulingWorker,
    runSchedulingWorkerCycle,
    resetSuperAdminPassword,
    generateSuperAdminTwoFactorSetup,
  } = runtime

  const isFreshCommand = command === "migrate:fresh"
    || command === "seed:fresh"
    || command === "seed:system:fresh"
  if (isFreshCommand && !force) {
    throw new Error(`Command "${command}" is destructive. Re-run it with --force.`)
  }

  if (command === "migrate") {
    await migrate()
    console.log("CMS database migrations complete.")
  } else if (command === "migrate:fresh") {
    await resetDatabase()
    await migrate()
    console.log("CMS database reset and migrations complete.")
  } else if (command === "seed:fresh") {
    const seedOptions = parseSeedOptions()
    if (seedOptions.dryRun) throw new Error("seed:fresh cannot be combined with --dry-run.")
    await resetDatabase()
    await migrate()
    const result = await seed(seedOptions)
    console.log(formatSeedDataSummary(result))
  } else if (command === "seed:system:fresh") {
    if (args.length > 1) throw new Error(`${command} does not accept additional arguments.`)
    await resetDatabase()
    await migrate()
    await seed()
    console.log("Fresh system seed complete.")
  } else if (command === "seed") {
    const hasSeedDataArguments = target !== undefined
      || args.some((arg) => arg === "--file" || arg.startsWith("--file=") || arg === "--dry-run" || arg === "--overwrite")
    if (hasSeedDataArguments) {
      const result = await seed(parseSeedOptions())
      console.log(formatSeedDataSummary(result))
    } else if (args.length > 1) {
      throw new Error("seed does not accept additional arguments without a seed file.")
    } else {
      await seed()
    }
  } else if (command === "seed:system") {
    if (args.length > 1) throw new Error(`${command} does not accept additional arguments.`)
    await seed()
  } else if (command === "2fa:setup") {
    if (target) throw new Error("2fa:setup does not accept additional arguments.")
    const setup = generateSuperAdminTwoFactorSetup(force)
    console.log("Add these values to the application environment, then restart Beaver:")
    console.log(`ADMIN_2FA_ENABLED=true\nADMIN_2FA_SECRET=${setup.secret}`)
    console.log(`\notpauth URI (for manual QR generation):\n${setup.otpauthUrl}`)
  } else if (command === "worker" || command === "worker:once") {
    if (args.length > 1) throw new Error(`${command} does not accept additional arguments.`)

    if (command === "worker:once") {
      const result = await runSchedulingWorkerCycle()
      console.log(`Scheduling worker cycle complete. Normalized ${result.normalized}, published ${result.published}, activity logs ${result.activityLogs}, purged ${result.purged}.`)
    } else {
      const controller = new AbortController()
      const stop = () => controller.abort()
      process.once("SIGINT", stop)
      process.once("SIGTERM", stop)
      console.log("Beaver scheduling worker started. Send SIGTERM or SIGINT to stop.")
      await runSchedulingWorker({
        signal: controller.signal,
        onCycle: (result) => {
          if (result.normalized || result.published || result.purged || result.activityLogFailures) {
            console.log(`Scheduling worker cycle: normalized ${result.normalized}, published ${result.published}, activity logs ${result.activityLogs}, log failures ${result.activityLogFailures}, purged ${result.purged}.`)
          }
        },
      })
      process.removeListener("SIGINT", stop)
      process.removeListener("SIGTERM", stop)
      console.log("Beaver scheduling worker stopped.")
    }
  } else if (command === "activity-log:purge") {
    if (args.length > 1) throw new Error(`${command} does not accept additional arguments.`)
    const deleted = await purgeExpiredActivityLogs()
    console.log(`Activity log retention purge complete. Removed ${deleted} record(s).`)
  } else if (command === "reset" && target === "superadmin") {
    const result = await resetSuperAdminPassword()
    console.log(`Super-admin credentials are managed by ADMIN_* environment variables (${result.email}). Restart the app after changing them.`)
  } else {
    console.error(usage)
    process.exitCode = 1
  }
}

try {
  await run()
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  try {
    await closeDb?.()
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  }
}
