import { appendFile, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, sep } from "node:path";
import { build } from "vite";
import tailwindcss from "@tailwindcss/vite";
import packageJson from "../package.json" with { type: "json" };

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(packageRoot, "src");
const distRoot = resolve(packageRoot, "dist");
const externalPackages = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.peerDependencies),
];
const external = (id) =>
  id.startsWith("node:") ||
  id.startsWith("astro:") ||
  externalPackages.some(
    (dependency) => id === dependency || id.startsWith(`${dependency}/`),
  );

const templateBuildArtifacts = new Set(["node_modules", ".astro", ".vite"]);
const templateCopyFilter = (source) =>
  !source.split(sep).some((segment) => templateBuildArtifacts.has(segment));

const sharedConfig = {
  configFile: false,
  root: packageRoot,
  define: { __ADMIN_PATH__: "undefined" },
  resolve: {
    alias: {
      "@zbeaver/beaver": sourceRoot,
      "@content-type-registry": resolve(
        sourceRoot,
        "registry/content-types.json",
      ),
      "@menu-group-registry": resolve(sourceRoot, "registry/menu-groups.json"),
      "@section-registry": resolve(sourceRoot, "registry/sections.json"),
    },
  },
};

async function bundle(name, emptyOutDir) {
  const entry = resolve(sourceRoot, `${name}.ts`);
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
  });
}

async function bundleAdminCss() {
  const cssBuildRoot = resolve(distRoot, ".admin-css-build");
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
  });
  await cp(
    resolve(cssBuildRoot, "admin.css"),
    resolve(distRoot, "ui/admin.css"),
  );
  await rm(cssBuildRoot, { recursive: true, force: true });
}

await rm(distRoot, { recursive: true, force: true });
await bundle("server", true);
await bundle("ui", false);

await Promise.all([
  mkdir(resolve(distRoot, "astro"), { recursive: true }),
  mkdir(resolve(distRoot, "ui"), { recursive: true }),
  mkdir(resolve(distRoot, "compat"), { recursive: true }),
]);
await Promise.all([
  cp(
    resolve(sourceRoot, "astro/admin.astro"),
    resolve(distRoot, "astro/admin.astro"),
  ),
  cp(resolve(sourceRoot, "astro/http.js"), resolve(distRoot, "astro/http.js")),
  cp(resolve(sourceRoot, "astro/storage.js"), resolve(distRoot, "astro/storage.js")),
  cp(
    resolve(sourceRoot, "astro/middleware.js"),
    resolve(distRoot, "astro/middleware.js"),
  ),
  cp(
    resolve(sourceRoot, "ui/admin-layout.astro"),
    resolve(distRoot, "ui/admin-layout.astro"),
  ),
  cp(resolve(sourceRoot, "registry"), resolve(distRoot, "registry"), {
    recursive: true,
  }),
  cp(resolve(packageRoot, "templates"), resolve(distRoot, "templates"), {
    recursive: true,
    filter: templateCopyFilter,
  }),
]);
// Ship ESM compat shim so the integration can alias use-sync-external-store → react
await cp(resolve(sourceRoot, "compat"), resolve(distRoot, "compat"), {
  recursive: true,
});

await bundleAdminCss();

await Promise.all(
  ["sqlite", "mysql", "pgsql"].map((dialect) =>
    cp(
      resolve(packageRoot, "migrations", dialect),
      resolve(distRoot, "migrations", dialect),
      { recursive: true },
    ),
  ),
);

const serverDeclaration = [
  'import type { AstroIntegration } from "astro"',
  "",
  "export interface BeaverOptions {",
  "  adminPath?: string",
  "  contentTypeRegistry?: string | URL",
  "  sectionRegistry?: string | URL",
  "  menuGroupRegistry?: string | URL",
  "}",
  "",
  "declare function beaver(options?: BeaverOptions): AstroIntegration",
  "export default beaver",
  'export declare const apiApp: import("hono").Hono',
  "export declare const ADMIN_PATH: string",
  "type BeaverServiceResult<T> =",
  "  | { success: true; data: T; message: string }",
  "  | { success: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }",
  "interface BeaverPaginationMeta {",
  "  currentPage: number",
  "  perPage: number",
  "  total: number",
  "  lastPage: number",
  "  from: number",
  "  to: number",
  "}",
  "interface BeaverPaginatedResult<T> {",
  "  data: T[]",
  "  meta: BeaverPaginationMeta",
  "}",
  "interface BeaverPost {",
  "  id: string",
  "  title: string",
  "  slug: string",
  "  type: string",
  "  status: string",
  "  excerpt: string | null",
  "  description: string | null",
  "  tags: string | null",
  "  sections: string | null",
  "  customFieldValues: string | null",
  "  metaTitle: string | null",
  "  metaDescription: string | null",
  "  featuredImage: string | null",
  "  gallery: string | null",
  "  authorId: string",
  "  publishedAt: number | null",
  "  createdAt: number",
  "  updatedAt: number",
  "}",
  "interface BeaverPublicPost {",
  "  id: string",
  "  title: string",
  "  slug: string",
  "  type: string",
  "  excerpt: string | null",
  "  featuredImage: string | null",
  "  gallery: string[] | null",
  "  publishedAt: number | null",
  "  authorName: string | null",
  "}",
  "interface BeaverArchiveFilters {",
  "  search?: string",
  "  category?: string",
  "  tag?: string",
  "  customFields?: Record<string, string>",
  '  sortBy?: "title" | "created_at"',
  '  sortOrder?: "asc" | "desc"',
  "}",
  "interface BeaverArchiveFilterOptions {",
  "  categories: { name: string; slug: string }[]",
  "  tags: string[]",
  '  customFields: { name: string; label: string; type: "text" | "number" | "boolean" | "select" | "date"; options: string[] }[]',
  "}",
  "export declare const getPublishedPostByType: (type: string, slug: string) => Promise<BeaverServiceResult<BeaverPost & { authorName: string | null }>>",
  "export declare const getPublishedArchiveFilterOptions: (type: string) => Promise<BeaverServiceResult<BeaverArchiveFilterOptions>>",
  "export declare const getPublicCustomFieldFiltersFromSearchParams: (type: string, searchParams: URLSearchParams) => Record<string, string>",
  "export declare const listPublishedPostsByType: (type: string, page?: number, perPage?: number, filters?: BeaverArchiveFilters) => Promise<BeaverServiceResult<BeaverPaginatedResult<BeaverPublicPost>>>",
  "export declare const listPublishedPostsByTag: (tag: string, page?: number, perPage?: number) => Promise<BeaverServiceResult<BeaverPaginatedResult<BeaverPublicPost>>>",
  "export declare const searchPublishedPosts: (query: string, page?: number, perPage?: number) => Promise<BeaverServiceResult<BeaverPaginatedResult<BeaverPublicPost>>>",
  "export declare const getMenuTree: (type?: string) => Promise<BeaverServiceResult<MenuTree[]>>",
  "interface BeaverSocialLink { platform: string; url: string; icon?: string }",
  "interface BeaverOpenHours { day: string; open: string; close: string }",
  "interface BeaverSiteSettings {",
  "  title: string",
  "  description: string",
  "  meta_title: string",
  "  meta_description: string",
  "  maintenance_mode: boolean",
  "  timezone: string",
  "  logo: string",
  "  favicon: string",
  "  links: BeaverSocialLink[]",
  "  open_hours: BeaverOpenHours[]",
  "  custom_css: string",
  "  custom_javascript: string",
  "  translate_countries: string[]",
  "  email_notifications: string[]",
  "}",
  "export declare const getSiteSettings: () => Promise<BeaverSiteSettings>",
  "export declare const seed: () => Promise<void>",
  "export interface SeedDataOptions { filePath?: string; template?: string; dryRun?: boolean; overwrite?: boolean }",
  "export interface SeedEntitySummary { created: number; updated: number; skipped: number }",
  "export interface SeedDataSummary {",
  "  source: string",
  "  dryRun: boolean",
  "  settings: SeedEntitySummary",
  "  categories: SeedEntitySummary",
  "  posts: SeedEntitySummary",
  "  pages: SeedEntitySummary",
  "  menus: SeedEntitySummary",
  "}",
  "export declare const migrateData: (options: SeedDataOptions) => Promise<SeedDataSummary>",
  "export declare const formatSeedDataSummary: (result: SeedDataSummary) => string",
  "export declare const parseSeedData: (input: unknown, source?: string) => unknown",
  "export declare const closeDatabase: () => Promise<void>",
  "export declare const resetDatabase: () => Promise<void>",
  "export declare const getStorageDir: () => string",
  "export declare const getStorageType: () => \"local\" | \"s3\"",
  "export declare const writeStorageFile: (filePath: string, data: Uint8Array | string) => Promise<void>",
  "export declare const readStorageFile: (filePath: string) => Promise<Uint8Array | null>",
  "export declare const deleteStorageFile: (filePath: string) => Promise<boolean>",
  "export type StorageType = \"local\" | \"s3\"",
  "export interface MenuTree {",
  "  id: string",
  "  title: string",
  "  url: string",
  "  position: number",
  "  cssClass: string | null",
  "  target: string | null",
  "  image: string | null",
  "  parentId: string | null",
  "  children: MenuTree[]",
  "}",
].join(String.fromCharCode(10));
await writeFile(
  resolve(distRoot, "server.d.ts"),
  serverDeclaration + String.fromCharCode(10),
);
await appendFile(
  resolve(distRoot, "server.d.ts"),
  "export declare const migrate: () => Promise<void>\n",
);
await appendFile(
  resolve(distRoot, "server.d.ts"),
  "export declare const seedTemplate: (name: string) => Promise<void>\n",
);
await appendFile(
  resolve(distRoot, "server.d.ts"),
  "export declare const resetSuperAdminPassword: () => Promise<{ email: string }>\n",
);
await writeFile(
  resolve(distRoot, "ui.d.ts"),
  `import type { ReactElement } from "react"\nexport declare function AdminApp(): ReactElement\n`,
);
