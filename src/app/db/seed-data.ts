import { existsSync, lstatSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, isAbsolute, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@zbeaver/beaver/app/db"
import {
  categories,
  menus,
  postCategories,
  posts,
  settings,
  users,
} from "@zbeaver/beaver/app/db/schema"
import { createCategorySchema } from "@zbeaver/beaver/app/validations/categories"
import { createMenuSchema } from "@zbeaver/beaver/app/validations/menus"
import { createPostSchema } from "@zbeaver/beaver/app/validations/posts"
import { safeHrefSchema, slugRegex } from "@zbeaver/beaver/app/validations/shared"
import { invalidatePublicDataCache } from "@zbeaver/beaver/app/cache/public-data-cache"
import { sanitizeHtml, sanitizeText } from "@zbeaver/beaver/pkg/security/sanitize"
import { generateId, getCurrentTimestamp, slugify } from "@zbeaver/beaver/pkg/utils/index"

const settingsSeedSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(10_000).optional(),
  meta_title: z.string().max(200).optional(),
  meta_description: z.string().max(10_000).optional(),
  maintenance_mode: z.boolean().optional(),
  timezone: z.string().max(100).optional(),
  logo: z.string().max(2_048).optional(),
  favicon: z.string().max(2_048).optional(),
  links: z.array(z.object({
    platform: z.string().min(1).max(100),
    url: safeHrefSchema,
    icon: z.string().max(100).optional(),
  }).strict()).max(100).optional(),
  open_hours: z.array(z.object({
    day: z.string().min(1).max(100),
    open: z.string().min(1).max(20),
    close: z.string().min(1).max(20),
  }).strict()).max(100).optional(),
  custom_css: z.string().max(100_000).optional(),
  custom_javascript: z.string().max(100_000).optional(),
  translate_countries: z.array(z.string().min(1).max(20)).max(100).optional(),
  email_notifications: z.array(z.string().email()).max(100).optional(),
}).strict()

const categorySeedSchema = createCategorySchema.extend({
  slug: z.string().regex(slugRegex, "Slug must contain only lowercase alphanumeric characters and hyphens").optional(),
}).strict()

const contentSeedSchema = createPostSchema
  .omit({ categoryIds: true })
  .extend({
    status: z.enum(["draft", "published"]).default("published"),
    categorySlugs: z.array(z.string().trim().min(1).max(200)).max(100).optional(),
  })
  .strict()

const menuSeedSchema = createMenuSchema
  .omit({ parentId: true })
  .extend({
    position: z.number().int().min(0).optional(),
    parentUrl: safeHrefSchema.optional(),
  })
  .strict()

const seedDataSchema = z.object({
  settings: settingsSeedSchema.default({}),
  categories: z.array(categorySeedSchema).max(5_000).default([]),
  posts: z.array(contentSeedSchema).max(5_000).default([]),
  pages: z.array(contentSeedSchema).max(5_000).default([]),
  menus: z.array(menuSeedSchema).max(5_000).default([]),
}).strict()

export type SeedData = z.infer<typeof seedDataSchema>

export interface SeedDataOptions {
  filePath?: string
  template?: string
  dryRun?: boolean
  overwrite?: boolean
}

export interface SeedEntitySummary {
  created: number
  updated: number
  skipped: number
}

export interface SeedDataSummary {
  source: string
  dryRun: boolean
  settings: SeedEntitySummary
  categories: SeedEntitySummary
  posts: SeedEntitySummary
  pages: SeedEntitySummary
  menus: SeedEntitySummary
}

type SeedTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
type ContentSeed = SeedData["posts"][number]

function emptyEntitySummary(): SeedEntitySummary {
  return { created: 0, updated: 0, skipped: 0 }
}

function emptySummary(source: string, dryRun: boolean): SeedDataSummary {
  return {
    source,
    dryRun,
    settings: emptyEntitySummary(),
    categories: emptyEntitySummary(),
    posts: emptyEntitySummary(),
    pages: emptyEntitySummary(),
    menus: emptyEntitySummary(),
  }
}

function seedError(message: string): Error {
  return new Error(`Seed data error: ${message}`)
}

function assertUnique(label: string, values: string[]) {
  const seen = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) throw seedError(`Duplicate ${label}: "${value}".`)
    seen.add(value)
  }
}

function contentSlug(item: ContentSeed): string {
  const slug = item.slug ?? slugify(item.title)
  if (!slug) throw seedError(`Unable to generate a slug for content "${item.title}".`)
  return slug
}

function categorySlug(item: SeedData["categories"][number]): string {
  const slug = item.slug ?? slugify(item.name)
  if (!slug) throw seedError(`Unable to generate a slug for category "${item.name}".`)
  return slug
}

function menuKey(type: string, url: string): string {
  return `${type}:${url}`
}

function validateSeedData(data: SeedData): SeedData {
  const categorySlugs = data.categories.map(categorySlug)
  assertUnique("category slug", categorySlugs)

  const contentSlugs = [...data.posts, ...data.pages].map(contentSlug)
  assertUnique("content slug", contentSlugs)

  const menuKeys = data.menus.map((menu) => menuKey(menu.type, menu.url))
  assertUnique("menu item", menuKeys)
  validateMenuParentGraph(data.menus)

  return data
}

export function parseSeedData(input: unknown, source = "<seed data>"): SeedData {
  const result = seedDataSchema.safeParse(input)
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.length ? issue.path.join(".") : "<root>"}: ${issue.message}`)
      .join("; ")
    throw seedError(`Invalid data in ${source}: ${details}`)
  }

  return validateSeedData(result.data)
}

function assertRegularFile(filePath: string) {
  let stats
  try {
    stats = lstatSync(filePath)
  } catch {
    throw seedError(`Seed file was not found: ${filePath}`)
  }
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw seedError(`Seed path must be a regular file: ${filePath}`)
  }
}

function packagedTemplateSeedPath(name: string): string {
  if (!/^[a-z0-9-]+$/.test(name)) throw seedError("Invalid template name.")

  const moduleDir = dirname(fileURLToPath(import.meta.url))
  const packaged = resolve(moduleDir, "templates", name, "data", "seed.json")
  const source = resolve(moduleDir, "..", "..", "..", "templates", name, "data", "seed.json")
  const filePath = existsSync(packaged) ? packaged : source
  assertRegularFile(filePath)
  return filePath
}

function resolveSeedPath(options: SeedDataOptions): { filePath: string; source: string } {
  if (options.filePath && options.template) {
    throw seedError("Choose either a seed file or a template, not both.")
  }
  if (!options.filePath && !options.template) {
    throw seedError("A seed file or template is required.")
  }

  if (options.template) {
    return {
      filePath: packagedTemplateSeedPath(options.template),
      source: `template:${options.template}`,
    }
  }

  const filePath = isAbsolute(options.filePath!)
    ? options.filePath!
    : resolve(process.cwd(), options.filePath!)
  assertRegularFile(filePath)
  return { filePath, source: filePath }
}

async function loadSeedData(options: SeedDataOptions): Promise<{ data: SeedData; source: string }> {
  const { filePath, source } = resolveSeedPath(options)
  let raw: string
  try {
    raw = await readFile(filePath, "utf8")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw seedError(`Unable to read ${source}: ${message}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw seedError(`Invalid JSON in ${source}: ${message}`)
  }

  return { data: parseSeedData(parsed, source), source }
}

function serializeSettingValue(value: unknown): string {
  if (typeof value === "string") return value
  const serialized = JSON.stringify(value)
  if (serialized === undefined) throw seedError("A setting value could not be serialized.")
  return serialized
}

function jsonOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (Array.isArray(value) && value.length === 0) return null
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return null
  return JSON.stringify(value) ?? null
}

async function importSettings(
  tx: SeedTransaction,
  data: SeedData["settings"],
  summary: SeedEntitySummary,
  overwrite: boolean,
  now: number,
) {
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    const serialized = serializeSettingValue(value)
    const rows = await tx
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1)
      .execute()
    const existing = rows[0]

    if (!existing) {
      await tx.insert(settings).values({ key, value: serialized, createdAt: now, updatedAt: now }).execute()
      summary.created++
      continue
    }

    if (!overwrite || existing.value === serialized) {
      summary.skipped++
      continue
    }

    await tx
      .update(settings)
      .set({ value: serialized, updatedAt: now })
      .where(eq(settings.key, key))
      .execute()
    summary.updated++
  }
}

async function importCategories(
  tx: SeedTransaction,
  data: SeedData["categories"],
  summary: SeedEntitySummary,
  overwrite: boolean,
  now: number,
): Promise<Map<string, string>> {
  const categoryIds = new Map<string, string>()

  for (const category of data) {
    const slug = categorySlug(category)
    const rows = await tx
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)
      .execute()
    const existing = rows[0]

    if (!existing) {
      const id = generateId()
      await tx.insert(categories).values({
        id,
        name: sanitizeText(category.name),
        slug,
        type: category.type ?? "post",
        description: category.description ?? null,
        image: category.image ?? null,
        status: category.status ?? "published",
        createdAt: now,
        updatedAt: now,
      }).execute()
      categoryIds.set(slug, id)
      summary.created++
      continue
    }

    categoryIds.set(slug, existing.id)
    if (!overwrite) {
      summary.skipped++
      continue
    }

    const next = {
      name: sanitizeText(category.name),
      type: category.type ?? "post",
      description: category.description ?? null,
      image: category.image ?? null,
      status: category.status ?? "published",
    }
    const changed = existing.name !== next.name
      || existing.type !== next.type
      || existing.description !== next.description
      || existing.image !== next.image
      || existing.status !== next.status

    if (!changed) {
      summary.skipped++
      continue
    }

    await tx.update(categories).set({ ...next, updatedAt: now }).where(eq(categories.id, existing.id)).execute()
    summary.updated++
  }

  return categoryIds
}

async function resolveCategoryIds(
  tx: SeedTransaction,
  slugs: string[] | undefined,
  categoryIds: Map<string, string>,
  contentLabel: string,
): Promise<string[]> {
  const resolved: string[] = []
  for (const slug of slugs ?? []) {
    let categoryId = categoryIds.get(slug)
    if (!categoryId) {
      const rows = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1)
        .execute()
      categoryId = rows[0]?.id
    }
    if (!categoryId) {
      throw seedError(`Content "${contentLabel}" references unknown category slug "${slug}".`)
    }
    if (!resolved.includes(categoryId)) resolved.push(categoryId)
  }
  return resolved
}

function buildContentFields(
  item: ContentSeed,
  type: string,
  now: number,
  existingPublishedAt?: number | null,
) {
  const status = item.status ?? "published"
  return {
    title: sanitizeText(item.title),
    slug: contentSlug(item),
    type,
    status,
    excerpt: item.excerpt ?? null,
    description: item.description ? sanitizeHtml(item.description) : null,
    tags: jsonOrNull(item.tags),
    sections: jsonOrNull(item.sections),
    customFieldValues: jsonOrNull(item.customFieldValues),
    metaTitle: item.metaTitle ?? null,
    metaDescription: item.metaDescription ?? null,
    featuredImage: item.featuredImage ?? null,
    gallery: jsonOrNull(item.gallery),
    publishedAt: status === "published"
      ? (item.publishedAt ?? existingPublishedAt ?? now)
      : null,
  }
}

async function syncContentCategories(
  tx: SeedTransaction,
  postId: string,
  categoryIds: string[],
  now: number,
) {
  await tx.delete(postCategories).where(eq(postCategories.postId, postId)).execute()
  for (const categoryId of categoryIds) {
    await tx.insert(postCategories).values({
      id: generateId(),
      postId,
      categoryId,
      createdAt: now,
    }).execute()
  }
}

async function importContent(
  tx: SeedTransaction,
  data: SeedData["posts"],
  kind: "post" | "page",
  authorId: string,
  categoryIds: Map<string, string>,
  summary: SeedEntitySummary,
  overwrite: boolean,
  now: number,
) {
  for (const item of data) {
    const slug = contentSlug(item)
    const type = kind === "page" ? "page" : item.type ?? "post"
    const rows = await tx
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1)
      .execute()
    const existing = rows[0]

    if (existing && existing.type !== type) {
      throw seedError(`Content slug "${slug}" already belongs to type "${existing.type}"; expected "${type}".`)
    }

    const resolvedCategoryIds = await resolveCategoryIds(tx, item.categorySlugs, categoryIds, item.title)

    if (existing && !overwrite) {
      summary.skipped++
      continue
    }
    const fields = buildContentFields(item, type, now, existing?.publishedAt)

    if (existing) {
      const changed = existing.title !== fields.title
        || existing.type !== fields.type
        || existing.status !== fields.status
        || existing.excerpt !== fields.excerpt
        || existing.description !== fields.description
        || existing.tags !== fields.tags
        || existing.sections !== fields.sections
        || existing.customFieldValues !== fields.customFieldValues
        || existing.metaTitle !== fields.metaTitle
        || existing.metaDescription !== fields.metaDescription
        || existing.featuredImage !== fields.featuredImage
        || existing.gallery !== fields.gallery
        || existing.publishedAt !== fields.publishedAt
      const existingCategoryRows = await tx
        .select({ categoryId: postCategories.categoryId })
        .from(postCategories)
        .where(eq(postCategories.postId, existing.id))
        .execute()
      const existingCategoryIds = existingCategoryRows.map((row) => row.categoryId).sort()
      const nextCategoryIds = [...resolvedCategoryIds].sort()
      const categoriesChanged = existingCategoryIds.length !== nextCategoryIds.length
        || existingCategoryIds.some((categoryId, index) => categoryId !== nextCategoryIds[index])

      if (!changed && !categoriesChanged) {
        summary.skipped++
        continue
      }

      await tx.update(posts).set({ ...fields, updatedAt: now }).where(eq(posts.id, existing.id)).execute()
      await syncContentCategories(tx, existing.id, resolvedCategoryIds, now)
      summary.updated++
      continue
    }

    const id = generateId()
    await tx.insert(posts).values({
      id,
      ...fields,
      authorId,
      createdAt: now,
      updatedAt: now,
    }).execute()
    await syncContentCategories(tx, id, resolvedCategoryIds, now)
    summary.created++
  }
}

async function findMenuByKey(tx: SeedTransaction, type: string, url: string) {
  const rows = await tx
    .select()
    .from(menus)
    .where(and(eq(menus.type, type), eq(menus.url, url)))
    .limit(1)
    .execute()
  return rows[0]
}

function validateMenuParentGraph(data: SeedData["menus"]) {
  const keys = new Set(data.map((menu) => menuKey(menu.type, menu.url)))
  const parents = new Map(
    data
      .filter((menu) => menu.parentUrl)
      .map((menu) => [menuKey(menu.type, menu.url), menuKey(menu.type, menu.parentUrl!)]),
  )

  for (const [key, parent] of parents) {
    if (key === parent) throw seedError(`Menu item "${key}" cannot be its own parent.`)
    if (!keys.has(parent)) continue

    const visited = new Set<string>([key])
    let cursor: string | undefined = parent
    while (cursor && keys.has(cursor)) {
      if (visited.has(cursor)) throw seedError(`Menu hierarchy contains a cycle at "${cursor}".`)
      visited.add(cursor)
      cursor = parents.get(cursor)
    }
  }
}

async function validateMenuParentReferences(tx: SeedTransaction, data: SeedData["menus"]) {
  validateMenuParentGraph(data)
  const sourceKeys = new Set(data.map((menu) => menuKey(menu.type, menu.url)))
  for (const menu of data) {
    if (!menu.parentUrl) continue
    const parentKey = menuKey(menu.type, menu.parentUrl)
    if (sourceKeys.has(parentKey)) continue
    const existing = await findMenuByKey(tx, menu.type, menu.parentUrl)
    if (!existing) throw seedError(`Menu "${menuKey(menu.type, menu.url)}" references unknown parent "${parentKey}".`)
  }
}

async function resolveMenuParentId(
  tx: SeedTransaction,
  menu: SeedData["menus"][number],
  menuIds: Map<string, string>,
): Promise<string | null> {
  if (!menu.parentUrl) return null
  const key = menuKey(menu.type, menu.parentUrl)
  const fromSeed = menuIds.get(key)
  if (fromSeed) return fromSeed
  const existing = await findMenuByKey(tx, menu.type, menu.parentUrl)
  if (!existing) throw seedError(`Menu "${menuKey(menu.type, menu.url)}" references unknown parent "${key}".`)
  return existing.id
}

async function importMenus(
  tx: SeedTransaction,
  data: SeedData["menus"],
  summary: SeedEntitySummary,
  overwrite: boolean,
  now: number,
) {
  await validateMenuParentReferences(tx, data)
  const menuIds = new Map<string, string>()
  const parentUpdates = new Set<string>()

  for (const [index, menu] of data.entries()) {
    const key = menuKey(menu.type, menu.url)
    const existing = await findMenuByKey(tx, menu.type, menu.url)

    if (!existing) {
      const id = generateId()
      await tx.insert(menus).values({
        id,
        title: sanitizeText(menu.title),
        url: menu.url,
        type: menu.type,
        position: menu.position ?? index,
        cssClass: menu.cssClass ? sanitizeText(menu.cssClass) : null,
        target: menu.target ?? null,
        image: menu.image ?? null,
        status: menu.status ?? "published",
        parentId: null,
        createdAt: now,
        updatedAt: now,
      }).execute()
      menuIds.set(key, id)
      parentUpdates.add(id)
      summary.created++
      continue
    }

    menuIds.set(key, existing.id)
    if (!overwrite) {
      summary.skipped++
      continue
    }

    const next = {
      title: sanitizeText(menu.title),
      url: menu.url,
      type: menu.type,
      position: menu.position ?? index,
      cssClass: menu.cssClass ? sanitizeText(menu.cssClass) : null,
      target: menu.target ?? null,
      image: menu.image ?? null,
      status: menu.status ?? "published",
      parentId: null,
    }
    const changed = existing.title !== next.title
      || existing.url !== next.url
      || existing.type !== next.type
      || existing.position !== next.position
      || existing.cssClass !== next.cssClass
      || existing.target !== next.target
      || existing.image !== next.image
      || existing.status !== next.status
      || existing.parentId !== next.parentId

    if (!changed) {
      summary.skipped++
      continue
    }

    await tx.update(menus).set({ ...next, updatedAt: now }).where(eq(menus.id, existing.id)).execute()
    parentUpdates.add(existing.id)
    summary.updated++
  }

  for (const menu of data) {
    const id = menuIds.get(menuKey(menu.type, menu.url))
    if (!id || !parentUpdates.has(id)) continue
    const parentId = await resolveMenuParentId(tx, menu, menuIds)
    if (parentId === id) throw seedError(`Menu item "${menuKey(menu.type, menu.url)}" cannot be its own parent.`)
    await tx.update(menus).set({ parentId, updatedAt: now }).where(eq(menus.id, id)).execute()
  }
}

function plannedSummary(data: SeedData, source: string): SeedDataSummary {
  const result = emptySummary(source, true)
  result.settings.created = Object.keys(data.settings).length
  result.categories.created = data.categories.length
  result.posts.created = data.posts.length
  result.pages.created = data.pages.length
  result.menus.created = data.menus.length
  return result
}

export function formatSeedDataSummary(result: SeedDataSummary): string {
  const prefix = result.dryRun ? "Seed data dry-run" : "Seed data migration"
  const lines = [
    `${prefix} complete: ${result.source}`,
    `  settings: ${result.settings.created} created, ${result.settings.updated} updated, ${result.settings.skipped} skipped`,
    `  categories: ${result.categories.created} created, ${result.categories.updated} updated, ${result.categories.skipped} skipped`,
    `  posts: ${result.posts.created} created, ${result.posts.updated} updated, ${result.posts.skipped} skipped`,
    `  pages: ${result.pages.created} created, ${result.pages.updated} updated, ${result.pages.skipped} skipped`,
    `  menus: ${result.menus.created} created, ${result.menus.updated} updated, ${result.menus.skipped} skipped`,
  ]
  return lines.join("\n")
}

export async function migrateData(options: SeedDataOptions): Promise<SeedDataSummary> {
  const { data, source } = await loadSeedData(options)
  const dryRun = options.dryRun === true
  if (dryRun) return plannedSummary(data, source)

  const userRows = await db.select({ id: users.id }).from(users).limit(1).execute()
  const author = userRows[0]
  if (!author) throw seedError("Run the base seed before importing content data.")

  const result = emptySummary(source, false)
  const overwrite = options.overwrite === true
  const now = getCurrentTimestamp()

  await db.transaction(async (tx) => {
    await importSettings(tx, data.settings, result.settings, overwrite, now)
    const categoryIds = await importCategories(tx, data.categories, result.categories, overwrite, now)
    await importContent(tx, data.posts, "post", author.id, categoryIds, result.posts, overwrite, now)
    await importContent(tx, data.pages, "page", author.id, categoryIds, result.pages, overwrite, now)
    await importMenus(tx, data.menus, result.menus, overwrite, now)
  })

  const changed = Object.values(result).some((value) => {
    if (typeof value !== "object" || value === null || !("created" in value)) return false
    const summary = value as SeedEntitySummary
    return summary.created > 0 || summary.updated > 0
  })
  if (changed) invalidatePublicDataCache()
  return result
}

export async function seedTemplate(name: string): Promise<void> {
  const result = await migrateData({ template: name })
  console.log(formatSeedDataSummary(result))
}
