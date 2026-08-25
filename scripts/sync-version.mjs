import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const checkOnly = process.argv[2] === "--check"
const rawVersion = checkOnly ? process.argv[3] : process.argv[2]
const version = rawVersion?.trim().replace(/^v/, "")
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/

if (!version || !semverPattern.test(version)) {
  console.error(`Invalid version: ${rawVersion ?? "<missing>"}`)
  console.error("Expected a semantic version such as 0.1.15 or v0.1.15.")
  process.exit(2)
}

const packageFiles = [
  resolve("package.json"),
  resolve("create-beaver/package.json"),
]

const packageData = await Promise.all(
  packageFiles.map(async (filePath) => ({
    filePath,
    data: JSON.parse(await readFile(filePath, "utf8")),
  })),
)

const [beaver, initializer] = packageData
const expectedDependency = `^${version}`
const errors = []

if (beaver.data.version !== version) {
  errors.push(`package.json version is ${beaver.data.version}, expected ${version}`)
}

if (initializer.data.version !== version) {
  errors.push(`create-beaver/package.json version is ${initializer.data.version}, expected ${version}`)
}

if (initializer.data.dependencies?.["@zbeaver/beaver"] !== expectedDependency) {
  errors.push(`create-beaver dependency is ${initializer.data.dependencies?.["@zbeaver/beaver"] ?? "missing"}, expected ${expectedDependency}`)
}

if (checkOnly) {
  if (errors.length > 0) {
    console.error(errors.join("\n"))
    process.exit(1)
  }

  console.log(`Release metadata is synchronized at ${version}.`)
  process.exit(0)
}

beaver.data.version = version
initializer.data.version = version
initializer.data.dependencies ??= {}
initializer.data.dependencies["@zbeaver/beaver"] = expectedDependency

await Promise.all(
  packageData.map(({ filePath, data }) =>
    writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`),
  ),
)

console.log(`Synchronized Beaver packages at ${version}.`)
