import {
  chmodSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { execFileSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"
import { basename, dirname, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const BEAVER_PACKAGE = "@zbeaver/beaver"
const DEFAULT_TEMPLATE = "flowstack"
const DEFAULT_PROJECT_NAME = "my-beaver-site"
const DEFAULT_ADMIN_NAME = "Super Admin"
const MAX_ADMIN_EMAIL_LENGTH = 254
const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"]
const INSTALL_DEPENDENCIES = [
  "astro",
  "@astrojs/react",
  "@astrojs/node",
  "react",
  "react-dom",
  "@tailwindcss/vite",
]

const colors = {
  reset: "\u001b[0m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  dim: "\u001b[2m",
}

export class CancelledError extends Error {
  constructor() {
    super("Installation cancelled.")
    this.name = "CancelledError"
  }
}

function colorize(color, value) {
  if (!stdout.isTTY) return value
  return `${colors[color]}${value}${colors.reset}`
}

function optionValue(argv, index) {
  const value = argv[index]
  if (value === undefined || value.startsWith("-")) {
    throw new Error(`Missing value for ${argv[index - 1]}.`)
  }
  return value
}

export function parseArgs(argv = []) {
  const options = {
    help: false,
    yes: false,
    nonInteractive: false,
    projectName: undefined,
    templateName: undefined,
    packageManager: undefined,
    adminName: undefined,
    adminEmail: undefined,
    adminPassword: undefined,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === "--") continue
    if (argument === "--help" || argument === "-h") {
      options.help = true
      continue
    }
    if (argument === "--yes" || argument === "-y") {
      options.yes = true
      continue
    }
    if (argument === "--non-interactive") {
      options.nonInteractive = true
      options.yes = true
      continue
    }

    const [flag, inlineValue] = argument.split("=", 2)
    if (["--project", "--project-name"].includes(flag)) {
      options.projectName = inlineValue ?? optionValue(argv, ++index)
    } else if (flag === "--template") {
      options.templateName = inlineValue ?? optionValue(argv, ++index)
    } else if (["--package-manager", "--pm"].includes(flag)) {
      options.packageManager = inlineValue ?? optionValue(argv, ++index)
    } else if (flag === "--admin-name") {
      options.adminName = inlineValue ?? optionValue(argv, ++index)
    } else if (flag === "--admin-email") {
      options.adminEmail = inlineValue ?? optionValue(argv, ++index)
    } else if (flag === "--admin-password") {
      options.adminPassword = inlineValue ?? optionValue(argv, ++index)
    } else if (!argument.startsWith("-") && !options.projectName) {
      options.projectName = argument
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }

  return options
}

export function detectPackageManager(directory) {
  if (existsSync(resolve(directory, "bun.lock")) || existsSync(resolve(directory, "bun.lockb"))) return "bun"
  if (existsSync(resolve(directory, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(resolve(directory, "yarn.lock"))) return "yarn"
  return "npm"
}

export function sanitizePackageName(value) {
  const name = basename(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
  let start = 0
  let end = name.length

  while (start < end && "._-".includes(name[start])) start += 1
  while (end > start && "._-".includes(name[end - 1])) end -= 1

  return name.slice(start, end) || "beaver-site"
}

export function generatedCredentials() {
  return {
    email: `admin-${randomBytes(6).toString("hex")}@cms.local`,
    password: `cms_${randomBytes(24).toString("base64url")}`,
  }
}

function isValidAdminEmail(value) {
  if (typeof value !== "string" || value.length > MAX_ADMIN_EMAIL_LENGTH || /\s/.test(value)) return false

  const atIndex = value.indexOf("@")
  if (atIndex <= 0 || atIndex !== value.lastIndexOf("@")) return false

  const domain = value.slice(atIndex + 1)
  const dotIndex = domain.indexOf(".")
  return dotIndex > 0 && dotIndex < domain.length - 1
}

export function validateAnswers(answers, templateNames = [DEFAULT_TEMPLATE]) {
  if (!answers.projectName?.trim()) throw new Error("Project name is required.")
  if (!templateNames.includes(answers.templateName)) throw new Error(`Template "${answers.templateName}" was not found.`)
  if (!PACKAGE_MANAGERS.includes(answers.packageManager)) throw new Error(`Unsupported package manager: ${answers.packageManager}.`)
  if (!answers.adminName?.trim() || answers.adminName.length > 100) throw new Error("Admin name must be between 1 and 100 characters.")
  if (!isValidAdminEmail(answers.adminEmail ?? "")) throw new Error("Admin email must be a valid email address.")
  if (!answers.adminPassword || answers.adminPassword.length < 12 || answers.adminPassword.length > 128) {
    throw new Error("Admin password must be between 12 and 128 characters.")
  }
  if (/\r|\n/.test(`${answers.adminName}${answers.adminEmail}${answers.adminPassword}`)) {
    throw new Error("Admin values cannot contain newlines.")
  }
}

export function listTemplates(templatesDirectory) {
  if (!existsSync(templatesDirectory)) throw new Error("Beaver templates were not found. Ensure @zbeaver/beaver is built correctly.")
  return readdirSync(templatesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "config" && /^[a-z0-9-]+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
}

function templateSource(templatesDirectory, templateName) {
  if (!/^[a-z0-9-]+$/.test(templateName)) throw new Error("Invalid template name.")
  const source = resolve(templatesDirectory, templateName)
  if (!source.startsWith(`${templatesDirectory}${sep}`)) throw new Error("Invalid template path.")
  if (!existsSync(source)) throw new Error(`Template "${templateName}" was not found.`)
  return source
}

function ensureProjectDirectory(projectDirectory) {
  if (!existsSync(projectDirectory)) {
    mkdirSync(projectDirectory, { recursive: true, mode: 0o755 })
    return
  }

  const stats = lstatSync(projectDirectory)
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new Error("Project path must be a regular directory, not a file or symlink.")
  }
}

function copyDirectory(source, destination) {
  if (!existsSync(destination)) mkdirSync(destination, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = resolve(source, entry.name)
    const destinationPath = resolve(destination, entry.name)
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath)
    } else if (entry.isFile() && !existsSync(destinationPath)) {
      cpSync(sourcePath, destinationPath)
    }
  }
}

function copyFileIfMissing(source, destination) {
  if (existsSync(destination)) return false
  cpSync(source, destination)
  return true
}

function ensureProjectPackage(projectDirectory, projectInput) {
  const packagePath = resolve(projectDirectory, "package.json")
  if (existsSync(packagePath)) return false

  const packageJson = {
    name: sanitizePackageName(projectInput),
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview",
    },
  }
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, { flag: "wx" })
  return true
}

function ensureScripts(projectDirectory) {
  const packagePath = resolve(projectDirectory, "package.json")
  if (!existsSync(packagePath)) return
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"))
  packageJson.scripts ??= {}
  let changed = false
  for (const [name, command] of Object.entries({ dev: "astro dev", build: "astro build", preview: "astro preview" })) {
    if (!packageJson.scripts[name]) {
      packageJson.scripts[name] = command
      changed = true
    }
  }
  if (changed) writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
}

function formatEnvValue(value) {
  if (/^[A-Za-z0-9_./:@+-]+$/.test(value)) return value
  return JSON.stringify(value)
}

function createInitialEnv(source, destination, answers) {
  if (existsSync(destination)) {
    const stats = lstatSync(destination)
    if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("Refusing to use a non-regular .env path.")
    chmodSync(destination, 0o600)
    return { created: false, credentialsShown: false }
  }

  const credentials = {
    email: answers.adminEmail,
    password: answers.adminPassword,
    name: answers.adminName,
    sessionSecret: randomBytes(48).toString("base64url"),
    accessSecret: randomBytes(48).toString("base64url"),
    refreshSecret: randomBytes(48).toString("base64url"),
  }
  const contents = readFileSync(source, "utf8")
    .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${formatEnvValue(credentials.sessionSecret)}`)
    .replace(/^ADMIN_JWT_ACCESS_SECRET=.*$/m, `ADMIN_JWT_ACCESS_SECRET=${formatEnvValue(credentials.accessSecret)}`)
    .replace(/^ADMIN_JWT_REFRESH_SECRET=.*$/m, `ADMIN_JWT_REFRESH_SECRET=${formatEnvValue(credentials.refreshSecret)}`)
    .replace(/^ADMIN_EMAIL=.*$/m, `ADMIN_EMAIL=${formatEnvValue(credentials.email)}`)
    .replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${formatEnvValue(credentials.password)}`)
    .replace(/^ADMIN_NAME=.*$/m, `ADMIN_NAME=${formatEnvValue(credentials.name)}`)

  writeFileSync(destination, contents, { mode: 0o600, flag: "wx" })
  chmodSync(destination, 0o600)
  return { created: true, credentialsShown: true }
}

function loadDotEnv(directory) {
  const envPath = resolve(directory, ".env")
  if (!existsSync(envPath)) return
  const stats = lstatSync(envPath)
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("Refusing to read a non-regular .env path.")
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

function projectDirectoryFromInput(projectInput, currentDirectory = process.cwd()) {
  if (!projectInput?.trim()) throw new Error("Project name is required.")
  return resolve(currentDirectory, projectInput.trim())
}

function projectLabel(projectDirectory, currentDirectory = process.cwd()) {
  const displayed = relative(currentDirectory, projectDirectory)
  if (!displayed) return "."
  if (displayed === ".." || displayed.startsWith(`..${sep}`)) return projectDirectory
  return displayed
}

function stripBoundarySlashes(value) {
  const trimmed = value?.trim() ?? ""
  let start = 0
  let end = trimmed.length

  while (start < end && trimmed[start] === "/") start += 1
  while (end > start && trimmed[end - 1] === "/") end -= 1

  return trimmed.slice(start, end)
}

function askText(readline, label, defaultValue = "") {
  const suffix = defaultValue ? ` ${colorize("dim", `(default: ${defaultValue})`)}` : ""
  return readline.question(`? ${label}${suffix}: `).then((value) => value.trim() || defaultValue)
}

async function askRequiredText(readline, label, defaultValue, validate) {
  while (true) {
    const value = await askText(readline, label, defaultValue)
    const error = validate(value)
    if (!error) return value
    console.log(colorize("yellow", `  ! ${error}`))
  }
}

async function askChoice(readline, label, values, defaultValue) {
  const defaultIndex = Math.max(0, values.indexOf(defaultValue))
  console.log(`\n? ${label}`)
  values.forEach((value, index) => {
    const marker = index === defaultIndex ? colorize("cyan", "›") : " "
    console.log(`  ${marker} ${index + 1}) ${value}`)
  })

  while (true) {
    const answer = await readline.question(`  Choice ${colorize("dim", `(default: ${defaultIndex + 1})`)}: `)
    if (!answer.trim()) return values[defaultIndex]
    const choice = Number(answer.trim())
    if (Number.isInteger(choice) && choice >= 1 && choice <= values.length) return values[choice - 1]
    console.log(colorize("yellow", `  ! Choose a number from 1 to ${values.length}.`))
  }
}

export function promptSecret(label, inputStream = stdin, outputStream = stdout) {
  if (!inputStream.isTTY || typeof inputStream.setRawMode !== "function") {
    const readline = createInterface({ input: inputStream, output: outputStream })
    return readline.question(`? ${label}: `).finally(() => readline.close())
  }

  return new Promise((resolveValue, reject) => {
    let value = ""
    const previousRawMode = inputStream.isRaw
    const onData = (chunk) => {
      for (const character of chunk.toString()) {
        const code = character.charCodeAt(0)
        if (code === 3) {
          cleanup()
          reject(new CancelledError())
          return
        }
        if (character === "\r" || character === "\n") {
          outputStream.write("\n")
          cleanup()
          resolveValue(value)
          return
        }
        if (code === 8 || code === 127) {
          value = value.slice(0, -1)
          continue
        }
        if (code >= 32) value += character
      }
    }
    const cleanup = () => {
      inputStream.off("data", onData)
      inputStream.setRawMode?.(Boolean(previousRawMode))
      inputStream.pause()
    }

    outputStream.write(`? ${label}: `)
    inputStream.setRawMode(true)
    inputStream.resume()
    inputStream.on("data", onData)
  })
}

async function promptAnswers(options, templateNames) {
  const generated = generatedCredentials()
  const projectDefault = options.projectName ?? DEFAULT_PROJECT_NAME
  const templateDefault = options.templateName ?? (templateNames.includes(DEFAULT_TEMPLATE) ? DEFAULT_TEMPLATE : templateNames[0])
  const projectDirectory = projectDirectoryFromInput(projectDefault)
  const packageManagerDefault = options.packageManager ?? detectPackageManager(projectDirectory)

  const useDefaults = options.yes || options.nonInteractive || !stdin.isTTY || !stdout.isTTY
  if (useDefaults) {
    if (!options.yes && !options.nonInteractive && (!stdin.isTTY || !stdout.isTTY)) {
      throw new Error("Interactive terminal required. Use --yes for non-interactive installation.")
    }
    return {
      projectName: projectDefault,
      templateName: templateDefault,
      packageManager: packageManagerDefault,
      adminName: options.adminName ?? DEFAULT_ADMIN_NAME,
      adminEmail: options.adminEmail ?? generated.email,
      adminPassword: options.adminPassword ?? generated.password,
      generatedPassword: !options.adminPassword,
    }
  }

  const readline = createInterface({ input: stdin, output: stdout })
  try {
    const projectName = options.projectName ?? await askRequiredText(readline, "Project name / folder", projectDefault, (value) => value ? null : "Project name is required.")
    const templateName = options.templateName ?? await askChoice(readline, "Choose a starter template", templateNames, templateDefault)
    const packageManager = options.packageManager ?? await askChoice(readline, "Which package manager do you want to use?", PACKAGE_MANAGERS, packageManagerDefault)
    const adminName = options.adminName ?? await askRequiredText(readline, "Admin name", DEFAULT_ADMIN_NAME, (value) => value.length <= 100 ? null : "Admin name must be at most 100 characters.")
    const adminEmail = options.adminEmail ?? await askRequiredText(readline, "Admin email", generated.email, (value) => isValidAdminEmail(value) ? null : "Enter a valid email address.")
    readline.close()
    const enteredPassword = options.adminPassword ?? await promptSecret("Admin password", stdin, stdout)
    const adminPassword = enteredPassword || generated.password
    return {
      projectName,
      templateName,
      packageManager,
      adminName,
      adminEmail,
      adminPassword,
      generatedPassword: !enteredPassword,
    }
  } finally {
    readline.close()
  }
}

function installDependencies(projectDirectory, packageManager) {
  const installCommand = packageManager === "npm" ? "install" : "add"
  const beaverInstalled = existsSync(resolve(projectDirectory, "node_modules", "@zbeaver", "beaver", "package.json"))
  const dependencies = beaverInstalled ? INSTALL_DEPENDENCIES : [BEAVER_PACKAGE, ...INSTALL_DEPENDENCIES]
  console.log(`\n${colorize("cyan", "◇")} Installing dependencies with ${packageManager}...`)
  execFileSync(packageManager, [installCommand, ...dependencies], { cwd: projectDirectory, stdio: "inherit" })
  ensureScripts(projectDirectory)
  console.log(colorize("green", "✔ Dependencies installed"))
}

function printSummary(projectDirectory, currentDirectory, answers, envResult) {
  const port = process.env.PORT?.trim() || "4321"
  const adminPath = stripBoundarySlashes(process.env.ADMIN_PATH) || "admin"
  const projectLabelValue = projectLabel(projectDirectory, currentDirectory)
  const packageManagerRun = answers.packageManager === "npm" ? "npm" : answers.packageManager

  console.log(`\n${colorize("green", "◆ Beaver project created")}`)
  console.log(`\nProject: ${projectLabelValue}`)
  console.log(`Template: ${answers.templateName}`)
  console.log(`Package manager: ${answers.packageManager}`)
  console.log("\nAccess your site:")
  console.log(`  Website:     http://localhost:${port}/`)
  console.log(`  Admin panel: http://localhost:${port}/${adminPath}`)
  console.log("\nAdmin account:")
  console.log(`  Name:  ${answers.adminName}`)
  console.log(`  Email: ${answers.adminEmail}`)
  if (envResult.credentialsShown && answers.generatedPassword) {
    console.log("  Password: generated and saved in .env")
    console.log(colorize("yellow", "  Read the password from .env before logging in."))
  } else {
    console.log("  Password: saved in .env")
  }
  console.log("\nNext steps:")
  if (projectLabelValue !== ".") console.log(`  cd ${projectLabelValue}`)
  console.log(`  ${packageManagerRun} run dev`)
}

export async function resolveBeaverTemplatesDirectory() {
  const entry = import.meta.resolve(BEAVER_PACKAGE)
  return resolve(dirname(fileURLToPath(entry)), "templates")
}

export async function main(argv = process.argv.slice(2)) {
  let options
  try {
    options = parseArgs(argv)
    if (options.help) {
      console.log("Usage: npm create @zbeaver/beaver [-- project-name]")
      console.log("\nOptions:")
      console.log("  --yes, -y                 Use defaults without prompts")
      console.log("  --template <name>         Select a starter template")
      console.log("  --package-manager <name>  Select npm, pnpm, yarn, or bun")
      console.log("  --admin-name <name>       Set the initial admin name")
      console.log("  --admin-email <email>     Set the initial admin email")
      console.log("  --admin-password <value>  Set the initial admin password")
      return
    }

    const currentDirectory = process.cwd()
    const templatesDirectory = await resolveBeaverTemplatesDirectory()
    const templateNames = listTemplates(templatesDirectory)
    if (!templateNames.length) throw new Error("No Beaver starter templates are available.")

    console.log(`\n${colorize("cyan", "◆ Create a new Beaver project")}`)
    const answers = await promptAnswers(options, templateNames)
    validateAnswers(answers, templateNames)
    const projectDirectory = projectDirectoryFromInput(answers.projectName, currentDirectory)
    ensureProjectDirectory(projectDirectory)
    const existingEntries = readdirSync(projectDirectory)
    if (existingEntries.length) {
      console.log(colorize("yellow", "\nExisting files will be preserved; missing Beaver files will be added."))
    }

    const configDirectory = resolve(templatesDirectory, "config")
    const templateDirectory = templateSource(templatesDirectory, answers.templateName)
    ensureProjectPackage(projectDirectory, answers.projectName)
    const envResult = createInitialEnv(resolve(configDirectory, ".env"), resolve(projectDirectory, ".env"), answers)
    copyFileIfMissing(resolve(configDirectory, "astro.config.mjs"), resolve(projectDirectory, "astro.config.mjs"))
    copyFileIfMissing(resolve(configDirectory, "tsconfig.json"), resolve(projectDirectory, "tsconfig.json"))
    copyDirectory(resolve(templateDirectory, "src"), resolve(projectDirectory, "src"))
    copyDirectory(resolve(templateDirectory, "skills"), resolve(projectDirectory, "skills"))
    console.log(colorize("green", "✔ Configuration generated"))

    installDependencies(projectDirectory, answers.packageManager)
    process.chdir(projectDirectory)
    loadDotEnv(projectDirectory)

    const { migrate, seed, seedTemplate } = await import(`${BEAVER_PACKAGE}/server`)
    console.log(`\n${colorize("cyan", "◇")} Running database migration...`)
    await migrate()
    console.log(colorize("green", "✔ Database migrated"))
    console.log(`\n${colorize("cyan", "◇")} Creating Super Admin and seeding Beaver...`)
    await seed()
    await seedTemplate(answers.templateName)
    console.log(colorize("green", "✔ Flowstack demo content seeded"))

    printSummary(projectDirectory, currentDirectory, answers, envResult)
  } catch (error) {
    if (error instanceof CancelledError) {
      console.log(`\n${colorize("yellow", "Installation cancelled.")}`)
      return
    }
    console.error(`\n${colorize("yellow", "Installation failed.")}`)
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
