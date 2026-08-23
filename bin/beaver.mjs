#!/usr/bin/env node

import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { resolve, dirname, sep } from "node:path"
import { fileURLToPath } from "node:url"
const __dirname = dirname(fileURLToPath(import.meta.url))
const templatesDir = resolve(__dirname, "..", "dist", "templates")
const packageName = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8")).name

const args = process.argv.slice(2)
const command = args[0]
const positionalArgs = args.slice(1).filter((arg) => !arg.startsWith("-"))
const target = positionalArgs[0]
const force = args.includes("--force")

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

function dataPositionalTarget() {
  const values = []
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === "--file" || arg === "--template") {
      index += 1
      continue
    }
    if (!arg.startsWith("-")) values.push(arg)
  }
  if (values.length > 1) throw new Error("Only one seed file may be supplied.")
  return values[0]
}

function parseDataOptions() {
  const fileFlag = optionValue("--file")
  const template = optionValue("--template")
  const positional = dataPositionalTarget()
  if (fileFlag && positional) throw new Error("Use either a positional seed file or --file, not both.")
  const filePath = fileFlag || positional
  if (!filePath && !template) throw new Error("A seed file or --template is required.")
  if (filePath && template) throw new Error("Use either a seed file or --template, not both.")
  return {
    filePath,
    template,
    dryRun: args.includes("--dry-run"),
    overwrite: args.includes("--overwrite"),
  }
}

const usage = `Usage:
  beaver migrate
  beaver migrate:fresh --force
  beaver migrate:data <seed.json> [--dry-run] [--overwrite]
  beaver migrate:data --file <seed.json> [--dry-run] [--overwrite]
  beaver migrate:data --template <template> [--dry-run] [--overwrite]
  beaver migrate:data:fresh <seed.json> --force
  beaver seed [template]
  beaver seed:fresh --force
  beaver seed:template <template>
  beaver seed:template:fresh <template> --force
  beaver reset superadmin
  beaver config
  beaver example [template]`

const installDepsList = ["astro", "@astrojs/react", "@astrojs/node", "react", "react-dom", "@tailwindcss/vite"]

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

function detectPm() {
  const cwd = process.cwd()
  if (existsSync(resolve(cwd, "bun.lock"))) return "bun"
  if (existsSync(resolve(cwd, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(resolve(cwd, "yarn.lock"))) return "yarn"
  return "npm"
}

function ensureScripts() {
  const cwd = process.cwd()
  const pkgPath = resolve(cwd, "package.json")
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
    pkg.scripts = pkg.scripts || {}
    let updated = false
    if (!pkg.scripts.dev) { pkg.scripts.dev = "astro dev"; updated = true }
    if (!pkg.scripts.build) { pkg.scripts.build = "astro build"; updated = true }
    if (!pkg.scripts.preview) { pkg.scripts.preview = "astro preview"; updated = true }
    if (updated) {
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
      console.log("Updated package.json scripts (dev, build, preview).")
    }
  }
}

function installDeps() {
  const cwd = process.cwd()
  const pm = detectPm()
  const installCmd = pm === "npm" ? "install" : "add"
  const packageDependencies = existsSync(resolve(cwd, "node_modules", "@zbeaver", "beaver", "package.json"))
    ? installDepsList
    : [packageName, ...installDepsList]
  console.log(`Installing dependencies with ${pm}...`)
  execSync(`${pm} ${installCmd} ${packageDependencies.join(" ")}`, { cwd, stdio: "inherit" })
  console.log("Dependencies installed.")
  ensureScripts()
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

function copyDir(src, dest) {
  ensureDir(dest)
  const entries = readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name)
    const destPath = resolve(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else if (entry.isFile()) {
      if (existsSync(destPath)) {
        console.warn(`Skipping existing file: ${destPath}`)
        continue
      }
      cpSync(srcPath, destPath)
      console.log(`Created: ${destPath}`)
    }
  }
}

function copyFileIfMissing(source, destination) {
  if (existsSync(destination)) {
    console.warn(`Skipping existing file: ${destination}`)
    return false
  }
  cpSync(source, destination)
  console.log(`Created: ${destination}`)
  return true
}

function createInitialEnv(source, destination) {
  if (existsSync(destination)) {
    const existing = lstatSync(destination)
    if (!existing.isFile() || existing.isSymbolicLink()) {
      throw new Error("Refusing to use a non-regular .env path.")
    }
    chmodSync(destination, 0o600)
    console.warn(`Skipping existing file: ${destination}`)
    return null
  }

  const credentials = {
    email: `admin-${randomBytes(6).toString("hex")}@cms.local`,
    password: `cms_${randomBytes(24).toString("base64url")}`,
    name: "Super Admin",
    sessionSecret: randomBytes(48).toString("base64url"),
    accessSecret: randomBytes(48).toString("base64url"),
    refreshSecret: randomBytes(48).toString("base64url"),
  }
  const contents = readFileSync(source, "utf8")
    .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${credentials.sessionSecret}`)
    .replace(/^ADMIN_JWT_ACCESS_SECRET=.*$/m, `ADMIN_JWT_ACCESS_SECRET=${credentials.accessSecret}`)
    .replace(/^ADMIN_JWT_REFRESH_SECRET=.*$/m, `ADMIN_JWT_REFRESH_SECRET=${credentials.refreshSecret}`)
    .replace(/^ADMIN_EMAIL=.*$/m, `ADMIN_EMAIL=${credentials.email}`)
    .replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${credentials.password}`)
    .replace(/^ADMIN_NAME=.*$/m, `ADMIN_NAME=${credentials.name}`)

  writeFileSync(destination, contents, { mode: 0o600, flag: "wx" })
  chmodSync(destination, 0o600)
  console.log(`Created: ${destination}`)
  console.log("Initial Super Admin credentials (save these now; the password is only shown once):")
  console.log(`  Email: ${credentials.email}`)
  console.log(`  Password: ${credentials.password}`)
}

function generateConfig() {
  const cwd = process.cwd()
  const configSrc = resolve(templatesDir, "config")
  if (!existsSync(configSrc)) throw new Error("Config templates not found. Ensure the package is built correctly.")

  console.log("Generating configuration files...")
  createInitialEnv(resolve(configSrc, ".env"), resolve(cwd, ".env"))
  copyFileIfMissing(resolve(configSrc, "astro.config.mjs"), resolve(cwd, "astro.config.mjs"))
  copyFileIfMissing(resolve(configSrc, "tsconfig.json"), resolve(cwd, "tsconfig.json"))
}

function templateSource(templateName = "flowstack") {
  if (!/^[a-z0-9-]+$/.test(templateName)) {
    throw new Error("Invalid template name.")
  }
  const source = resolve(templatesDir, templateName)
  if (source !== templatesDir && !source.startsWith(`${templatesDir}${sep}`)) {
    throw new Error("Invalid template path.")
  }
  if (!existsSync(source)) throw new Error(`Template "${templateName}" was not found. Ensure the package is built correctly.`)
  return source
}

function copyExample(templateName) {
  const cwd = process.cwd()
  const exampleSrc = templateSource(templateName)

  console.log(`Copying ${templateName} template files...`)
  copyDir(resolve(exampleSrc, "src"), resolve(cwd, "src"))
  copyDir(resolve(exampleSrc, "skills"), resolve(cwd, "skills"))
}

let closeDb
try {
  loadDotEnv()
  const runtime = await import("../dist/server.js")
  closeDb = runtime.closeDatabase
  const { migrate, migrateData, formatSeedDataSummary, resetDatabase, seed, seedTemplate, resetSuperAdminPassword } = runtime

  const isFreshCommand = command === "migrate:fresh"
    || command === "migrate:data:fresh"
    || command === "seed:fresh"
    || command === "seed:system:fresh"
    || command === "seed:template:fresh"
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
  } else if (command === "migrate:data" || command === "migrate:data:fresh") {
    const dataOptions = parseDataOptions()
    if (dataOptions.template) templateSource(dataOptions.template)
    if (command === "migrate:data:fresh") {
      if (dataOptions.dryRun) throw new Error("migrate:data:fresh cannot be combined with --dry-run.")
      await resetDatabase()
      await migrate()
      await seed()
    }
    const result = await migrateData(dataOptions)
    console.log(formatSeedDataSummary(result))
  } else if (command === "seed" || command === "seed:system") {
    if (target) templateSource(target)
    await seed()
    if (target) await seedTemplate(target)
  } else if (command === "seed:fresh" || command === "seed:system:fresh") {
    if (target) throw new Error(`${command} does not accept a template. Use seed:template:fresh <template> --force.`)
    await resetDatabase()
    await migrate()
    await seed()
    console.log("Fresh system seed complete.")
  } else if (command === "seed:template") {
    if (!target) throw new Error("A template name is required. Example: beaver seed:template flowstack.")
    templateSource(target)
    await seedTemplate(target)
  } else if (command === "seed:template:fresh") {
    if (!target) throw new Error("A template name is required. Example: beaver seed:template:fresh flowstack --force.")
    templateSource(target)
    await resetDatabase()
    await migrate()
    await seed()
    await seedTemplate(target)
    console.log(`Fresh system and ${target} template seed complete.`)
  } else if (command === "reset" && target === "superadmin") {
    const result = await resetSuperAdminPassword()
    console.log(`Super-admin password reset and active sessions revoked (${result.email}).`)
  } else if (command === "config") {
    generateConfig()
    installDeps()
  } else if (command === "example") {
    const templateName = target || "flowstack"
    templateSource(templateName)
    copyExample(templateName)
    installDeps()
  } else {
    console.error(usage)
    process.exitCode = 1
  }
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
