// Framework-neutral server entrypoint. Framework adapters should call apiApp
// with the host Request/Response objects and mount their own routes.
export { apiApp } from "./router/app"

// Public host APIs retained in the server bundle.
export { getPublishedPostByType, getPublishedArchiveFilterOptions, getPublicCustomFieldFiltersFromSearchParams, listPublishedPostsByType, listPublishedPostsByTag, searchPublishedPosts } from "./app/public/posts"
export { getMenuTree, getSiteSettings } from "./app/public/site"
export { sanitizeHtml } from "./pkg/security/sanitize"
export { deleteStorageFile, getStorageDir, getStorageType, readStorageFile, writeStorageFile } from "./pkg/storage/storage"
export type { StorageType } from "./pkg/storage/storage"
export type { MenuTree } from "./app/repositories/menus"
export * from "./app/db/schema"
export { migrate } from "./app/db/migrate"
export { closeDatabase, resetDatabase } from "./app/db"
export { purgeExpiredActivityLogs } from "./app/services/activity-logs"
export { runSchedulingWorker, runSchedulingWorkerCycle } from "./app/workers/scheduling"
export { seed } from "./app/db/seed"
export {
  formatSeedDataSummary,
  parseSeedData,
} from "./app/db/seed-data"
export { resetSuperAdminPassword } from "./app/db/reset-super-admin"
export { generateSuperAdminTwoFactorSetup } from "./app/admin/super-admin-two-factor"
