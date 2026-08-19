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
export declare const onRequest: unknown
export declare const ADMIN_PATH: string
export declare const getPublishedPostByType: (...args: any[]) => any
export declare const getPublishedArchiveFilterOptions: (...args: any[]) => any
export declare const getPublicCustomFieldFiltersFromSearchParams: (...args: any[]) => any
export declare const listPublishedPostsByType: (...args: any[]) => any
export declare const listPublishedPostsByTag: (...args: any[]) => any
export declare const searchPublishedPosts: (...args: any[]) => any
export declare const getMenuTree: (...args: any[]) => any
export declare const getSiteSettings: (...args: any[]) => any
export declare const seed: () => Promise<void>
export type MenuTree = any
export declare const migrate: () => void
export declare const seedTemplate: (name: string) => Promise<void>
export declare const resetSuperAdminPassword: () => { email: string }
