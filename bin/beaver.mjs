#!/usr/bin/env node

import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { resolve, dirname, sep } from "node:path"
import { fileURLToPath } from "node:url"
const __dirname = dirname(fileURLToPath(import.meta.url))
const templatesDir = resolve(__dirname, "..", "dist", "templates")
const packageName = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8")).name

const command = process.argv[2]
const target = process.argv[3]

const usage = `Usage: beaver <install|migrate|seed|reset superadmin|config|example> [template]`

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

function validateSeedEnvironment() {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim()
  const placeholders = new Set(["admin@example.com", "password123", "change-this-password", "Super Admin"])

  if (!email || !password || !name || password.length < 12 || password.length > 128 || placeholders.has(email) || placeholders.has(password)) {
    throw new Error("Set ADMIN_EMAIL, ADMIN_NAME, and a non-placeholder ADMIN_PASSWORD of at least 12 characters in .env before running install.")
  }
}


try {
  loadDotEnv()
  const { migrate, seed, seedTemplate, resetSuperAdminPassword } = await import("../dist/server.js")

  if (command === "install") {
    const templateName = target || "flowstack"
    templateSource(templateName)
    generateConfig()
    copyExample(templateName)
    installDeps()
    loadDotEnv()
    migrate()
    validateSeedEnvironment()
    await seed()
    await seedTemplate(templateName)
    console.log("CMS installation complete.")
  } else if (command === "migrate") {
    migrate()
    console.log("CMS database migrations complete.")
  } else if (command === "seed") {
    if (target) templateSource(target)
    await seed()
    if (target) await seedTemplate(target)
  } else if (command === "reset" && target === "superadmin") {
    const result = resetSuperAdminPassword()
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
}
