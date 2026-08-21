import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { db } from "./index"
import { users } from "./schema"
import { findPostBySlugRecord } from "@zbeaver/beaver/app/repositories/posts"
import { findCategoryBySlugRecord } from "@zbeaver/beaver/app/repositories/categories"
import { listMenus } from "@zbeaver/beaver/app/repositories/menus"
import { createCategoryAsync } from "@zbeaver/beaver/app/services/categories"
import { createMenu } from "@zbeaver/beaver/app/services/menus"
import { createPost } from "@zbeaver/beaver/app/services/posts"
import { getSiteSettings, updateSiteSettings } from "@zbeaver/beaver/app/services/settings"

interface TemplateSeed {
  settings?: { title: string; description: string; meta_title: string; meta_description: string; timezone?: string }
  categories?: Array<{ name: string; description?: string }>
  posts?: Array<Record<string, unknown> & { title: string; slug: string }>
  pages?: Array<Record<string, unknown> & { title: string; slug: string }>
  menus?: Array<{ title: string; url: string; type: "navbar" | "footer" | "sidebar" }>
}

function templatePath(name: string) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error("Invalid template name.")
  const moduleDir = dirname(fileURLToPath(import.meta.url))
  const packaged = resolve(moduleDir, "templates", name, "data", "seed.json")
  return existsSync(packaged) ? packaged : resolve(moduleDir, "..", "..", "..", "templates", name, "data", "seed.json")
}

export async function seedTemplate(name: string) {
  const template = JSON.parse(await readFile(templatePath(name), "utf8")) as TemplateSeed
  const user = db.select({ id: users.id }).from(users).get()
  if (!user) throw new Error("Run the base seed before importing template data.")

  const settings = getSiteSettings()
  if (template.settings && settings.title === "My CMS") {
    const result = updateSiteSettings(template.settings)
    if (!result.success) throw new Error(result.error.message)
  }

  const categories = new Map<string, string>()
  for (const category of template.categories ?? []) {
    const slug = category.name.toLowerCase().replace(/\s+/g, "-")
    const existing = findCategoryBySlugRecord(slug)
    if (existing) {
      categories.set(slug, existing.id)
      continue
    }
    const result = await createCategoryAsync({ name: category.name, type: "post", description: category.description, status: "published" })
    if (!result.success) throw new Error(result.error.message)
    categories.set(slug, result.data.id)
  }

  for (const post of template.posts ?? []) {
    if (findPostBySlugRecord(post.slug)) continue
    const categorySlugs = Array.isArray(post.categorySlugs) ? post.categorySlugs.filter((value): value is string => typeof value === "string") : []
    const data = Object.fromEntries(Object.entries(post).filter(([key]) => key !== "categorySlugs"))
    const result = createPost({ ...data, type: "post", status: "published", categoryIds: categorySlugs.map((slug) => categories.get(slug)).filter((id): id is string => Boolean(id)) } as Parameters<typeof createPost>[0], user.id)
    if (!result.success) throw new Error(result.error.message)
  }

  for (const page of template.pages ?? []) {
    if (findPostBySlugRecord(page.slug)) continue
    const result = createPost({ ...page, type: "page", status: "published" } as Parameters<typeof createPost>[0], user.id)
    if (!result.success) throw new Error(result.error.message)
  }

  const existingMenus = listMenus()
  for (const [position, menu] of (template.menus ?? []).entries()) {
    if (existingMenus.some((item) => item.type === menu.type && item.url === menu.url)) continue
    const result = createMenu({ ...menu, position, status: "published" })
    if (!result.success) throw new Error(result.error.message)
  }

  console.log(`Template data ready: ${name}`)
}
