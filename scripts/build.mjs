import { appendFile, cp, mkdir, rm, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { build } from "vite"
import tailwindcss from "@tailwindcss/vite"
import packageJson from "../package.json" with { type: "json" }

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const sourceRoot = resolve(packageRoot, "src")
const distRoot = resolve(packageRoot, "dist")
const externalPackages = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.peerDependencies)]
const external = (id) => id.startsWith("node:") || id.startsWith("astro:") || externalPackages.some((dependency) => id === dependency || id.startsWith(`${dependency}/`))

const sharedConfig = {
  configFile: false,
  root: packageRoot,
  define: { __ADMIN_PATH__: "undefined" },
  resolve: {
    alias: {
      "@zaenpm/beaver": sourceRoot,
      "@content-type-registry": resolve(sourceRoot, "registry/content-types.json"),
      "@menu-group-registry": resolve(sourceRoot, "registry/menu-groups.json"),
      "@section-registry": resolve(sourceRoot, "registry/sections.json"),
    },
  },
}

async function bundle(name, emptyOutDir) {
  const entry = resolve(sourceRoot, `${name}.ts`)
  await build({
    ...sharedConfig,
    build: {
      emptyOutDir,
      outDir: distRoot,
      ...(name === "server"
        ? { ssr: entry }
        : { lib: { entry, formats: ["es"], fileName: () => `${name}.js` } }),
      rollupOptions: {
        external,
        output: { entryFileNames: `${name}.js`, inlineDynamicImports: true },
      },
    },
  })
}

async function bundleAdminCss() {
  const cssBuildRoot = resolve(distRoot, ".admin-css-build")
  await build({
    ...sharedConfig,
    plugins: [tailwindcss()],
    build: {
      outDir: cssBuildRoot,
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(sourceRoot, "ui/admin.css"),
        output: { assetFileNames: "admin.css" },
      },
    },
  })
  await cp(resolve(cssBuildRoot, "admin.css"), resolve(distRoot, "ui/admin.css"))
  await rm(cssBuildRoot, { recursive: true, force: true })
}

await rm(distRoot, { recursive: true, force: true })
await bundle("server", true)
await bundle("ui", false)

await Promise.all([
  mkdir(resolve(distRoot, "astro"), { recursive: true }),
  mkdir(resolve(distRoot, "ui"), { recursive: true }),
  mkdir(resolve(distRoot, "compat"), { recursive: true }),
])
await Promise.all([
  cp(resolve(sourceRoot, "astro/admin.astro"), resolve(distRoot, "astro/admin.astro")),
  cp(resolve(sourceRoot, "astro/http.js"), resolve(distRoot, "astro/http.js")),
  cp(resolve(sourceRoot, "astro/middleware.js"), resolve(distRoot, "astro/middleware.js")),
  cp(resolve(sourceRoot, "ui/admin-layout.astro"), resolve(distRoot, "ui/admin-layout.astro")),
  cp(resolve(sourceRoot, "registry"), resolve(distRoot, "registry"), { recursive: true }),
  cp(resolve(packageRoot, "templates"), resolve(distRoot, "templates"), { recursive: true }),
])
// Ship ESM compat shim so the integration can alias use-sync-external-store → react
await cp(resolve(sourceRoot, "compat"), resolve(distRoot, "compat"), { recursive: true })

await bundleAdminCss()

const migrations = [
  { tag: "0000_db", when: 1770000000000 },
]
const migrationJournal = {
  version: "7",
  dialect: "sqlite",
  entries: migrations.map(({ tag, when }, idx) => ({ idx, version: "7", when, tag, breakpoints: false })),
}
await mkdir(resolve(distRoot, "migrations/meta"), { recursive: true })
await writeFile(resolve(distRoot, "migrations/meta/_journal.json"), `${JSON.stringify(migrationJournal, null, 2)}\n`)
await Promise.all(migrations.map(({ tag }) => cp(resolve(packageRoot, "migrations", `${tag}.sql`), resolve(distRoot, "migrations", `${tag}.sql`))))

await writeFile(resolve(distRoot, "server.d.ts"), `import type { AstroIntegration } from "astro"\n\nexport interface BeaverOptions {\n  adminPath?: string\n  contentTypeRegistry?: string | URL\n  sectionRegistry?: string | URL\n  menuGroupRegistry?: string | URL\n}\n\ndeclare function beaver(options?: BeaverOptions): AstroIntegration\nexport default beaver\nexport declare const apiApp: import("hono").Hono\nexport declare const onRequest: unknown\nexport declare const ADMIN_PATH: string\nexport declare const getPublishedPostByType: (...args: any[]) => any\nexport declare const getPublishedArchiveFilterOptions: (...args: any[]) => any\nexport declare const getPublicCustomFieldFiltersFromSearchParams: (...args: any[]) => any\nexport declare const listPublishedPostsByType: (...args: any[]) => any\nexport declare const listPublishedPostsByTag: (...args: any[]) => any\nexport declare const searchPublishedPosts: (...args: any[]) => any\nexport declare const getMenuTree: (...args: any[]) => any\nexport declare const getSiteSettings: (...args: any[]) => any\nexport declare const seed: () => Promise<void>\nexport type MenuTree = any\n`)
await appendFile(resolve(distRoot, "server.d.ts"), "export declare const migrate: () => void\n")
await appendFile(resolve(distRoot, "server.d.ts"), "export declare const seedTemplate: (name: string) => Promise<void>\n")
await appendFile(resolve(distRoot, "server.d.ts"), "export declare const resetSuperAdminPassword: () => { email: string }\n")
await writeFile(resolve(distRoot, "ui.d.ts"), `import type { ReactElement } from "react"\nexport declare function AdminApp(props: { pathname: string }): ReactElement\n`)
