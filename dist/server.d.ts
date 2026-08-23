import type { AstroIntegration } from "astro"

export interface BeaverOptions {
  adminPath?: string
  contentTypeRegistry?: string | URL
  sectionRegistry?: string | URL
  menuGroupRegistry?: string | URL
}

declare function beaver(options?: BeaverOptions): AstroIntegration
export default beaver
export declare const apiApp: import("hono").Hono
export declare const ADMIN_PATH: string
type BeaverServiceResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }
interface BeaverPaginationMeta {
  currentPage: number
  perPage: number
  total: number
  lastPage: number
  from: number
  to: number
}
interface BeaverPaginatedResult<T> {
  data: T[]
  meta: BeaverPaginationMeta
}
interface BeaverPost {
  id: string
  title: string
  slug: string
  type: string
  status: string
  excerpt: string | null
  description: string | null
  tags: string | null
  sections: string | null
  customFieldValues: string | null
  metaTitle: string | null
  metaDescription: string | null
  featuredImage: string | null
  gallery: string | null
  authorId: string
  publishedAt: number | null
  createdAt: number
  updatedAt: number
}
interface BeaverPublicPost {
  id: string
  title: string
  slug: string
  type: string
  excerpt: string | null
  featuredImage: string | null
  gallery: string[] | null
  publishedAt: number | null
  authorName: string | null
}
interface BeaverArchiveFilters {
  search?: string
  category?: string
  tag?: string
  customFields?: Record<string, string>
  sortBy?: "title" | "created_at"
  sortOrder?: "asc" | "desc"
}
interface BeaverArchiveFilterOptions {
  categories: { name: string; slug: string }[]
  tags: string[]
  customFields: { name: string; label: string; type: "text" | "number" | "boolean" | "select" | "date"; options: string[] }[]
}
export declare const getPublishedPostByType: (type: string, slug: string) => Promise<BeaverServiceResult<BeaverPost & { authorName: string | null }>>
export declare const getPublishedArchiveFilterOptions: (type: string) => Promise<BeaverServiceResult<BeaverArchiveFilterOptions>>
export declare const getPublicCustomFieldFiltersFromSearchParams: (type: string, searchParams: URLSearchParams) => Record<string, string>
export declare const listPublishedPostsByType: (type: string, page?: number, perPage?: number, filters?: BeaverArchiveFilters) => Promise<BeaverServiceResult<BeaverPaginatedResult<BeaverPublicPost>>>
export declare const listPublishedPostsByTag: (tag: string, page?: number, perPage?: number) => Promise<BeaverServiceResult<BeaverPaginatedResult<BeaverPublicPost>>>
export declare const searchPublishedPosts: (query: string, page?: number, perPage?: number) => Promise<BeaverServiceResult<BeaverPaginatedResult<BeaverPublicPost>>>
export declare const getMenuTree: (type?: string) => Promise<BeaverServiceResult<MenuTree[]>>
interface BeaverSocialLink { platform: string; url: string; icon?: string }
interface BeaverOpenHours { day: string; open: string; close: string }
interface BeaverSiteSettings {
  title: string
  description: string
  meta_title: string
  meta_description: string
  maintenance_mode: boolean
  timezone: string
  logo: string
  favicon: string
  links: BeaverSocialLink[]
  open_hours: BeaverOpenHours[]
  custom_css: string
  custom_javascript: string
  translate_countries: string[]
  email_notifications: string[]
}
export declare const getSiteSettings: () => Promise<BeaverSiteSettings>
export declare const seed: () => Promise<void>
export interface SeedDataOptions { filePath?: string; template?: string; dryRun?: boolean; overwrite?: boolean }
export interface SeedEntitySummary { created: number; updated: number; skipped: number }
export interface SeedDataSummary {
  source: string
  dryRun: boolean
  settings: SeedEntitySummary
  categories: SeedEntitySummary
  posts: SeedEntitySummary
  pages: SeedEntitySummary
  menus: SeedEntitySummary
}
export declare const migrateData: (options: SeedDataOptions) => Promise<SeedDataSummary>
export declare const formatSeedDataSummary: (result: SeedDataSummary) => string
export declare const parseSeedData: (input: unknown, source?: string) => unknown
export declare const closeDatabase: () => Promise<void>
export declare const resetDatabase: () => Promise<void>
export declare const getStorageDir: () => string
export declare const getStorageType: () => "local" | "s3"
export declare const writeStorageFile: (filePath: string, data: Uint8Array | string) => Promise<void>
export declare const readStorageFile: (filePath: string) => Promise<Uint8Array | null>
export declare const deleteStorageFile: (filePath: string) => Promise<boolean>
export type StorageType = "local" | "s3"
export interface MenuTree {
  id: string
  title: string
  url: string
  position: number
  cssClass: string | null
  target: string | null
  image: string | null
  parentId: string | null
  children: MenuTree[]
}
export declare const migrate: () => Promise<void>
export declare const seedTemplate: (name: string) => Promise<void>
export declare const resetSuperAdminPassword: () => Promise<{ email: string }>
