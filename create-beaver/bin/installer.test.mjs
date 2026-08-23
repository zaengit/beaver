import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import test from "node:test"

import {
  detectPackageManager,
  listTemplates,
  parseArgs,
  sanitizePackageName,
  validateAnswers,
} from "./installer.mjs"

test("parseArgs supports project and wizard options", () => {
  assert.deepEqual(parseArgs([
    "--project", "demo-site",
    "--template=flowstack",
    "--pm", "pnpm",
    "--admin-name", "Ada",
    "--admin-email=ada@example.com",
    "--admin-password", "a-secure-password",
  ]), {
    help: false,
    yes: false,
    nonInteractive: false,
    projectName: "demo-site",
    templateName: "flowstack",
    packageManager: "pnpm",
    adminName: "Ada",
    adminEmail: "ada@example.com",
    adminPassword: "a-secure-password",
  })
})

test("--yes enables non-interactive defaults", () => {
  const options = parseArgs(["--yes", "demo-site"])
  assert.equal(options.yes, true)
  assert.equal(options.projectName, "demo-site")
})

test("detectPackageManager prefers an existing lockfile", () => {
  const directory = mkdtempSync(resolve(tmpdir(), "create-beaver-pm-"))
  writeFileSync(resolve(directory, "pnpm-lock.yaml"), "")
  assert.equal(detectPackageManager(directory), "pnpm")
})

test("listTemplates excludes the internal config directory", () => {
  const directory = mkdtempSync(resolve(tmpdir(), "create-beaver-templates-"))
  mkdirSync(resolve(directory, "config"))
  mkdirSync(resolve(directory, "flowstack"))

  assert.deepEqual(listTemplates(directory), ["flowstack"])
})

test("sanitizePackageName creates a valid package name", () => {
  assert.equal(sanitizePackageName("My Marketing Site"), "my-marketing-site")
  assert.equal(sanitizePackageName("---My Marketing Site---"), "my-marketing-site")
  assert.equal(sanitizePackageName("..."), "beaver-site")
})

test("validateAnswers rejects weak admin passwords", () => {
  assert.throws(() => validateAnswers({
    projectName: "demo-site",
    templateName: "flowstack",
    packageManager: "npm",
    adminName: "Super Admin",
    adminEmail: "admin@example.com",
    adminPassword: "short",
  }), /between 12 and 128/)
})

test("validateAnswers accepts the installer contract", () => {
  assert.doesNotThrow(() => validateAnswers({
    projectName: "demo-site",
    templateName: "flowstack",
    packageManager: "npm",
    adminName: "Super Admin",
    adminEmail: "admin@example.com",
    adminPassword: "a-secure-admin-password",
  }))
})

test("validateAnswers rejects oversized admin emails", () => {
  assert.throws(() => validateAnswers({
    projectName: "demo-site",
    templateName: "flowstack",
    packageManager: "npm",
    adminName: "Super Admin",
    adminEmail: `${"a".repeat(250)}@example.com`,
    adminPassword: "a-secure-admin-password",
  }), /valid email address/)
})
