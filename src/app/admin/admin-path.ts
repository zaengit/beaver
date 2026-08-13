declare const __ADMIN_PATH__: string | undefined

declare global {
  var __CMS_ADMIN_PATH__: string | undefined
}

/**
 * Public URL for the admin application. It is injected at build time from
 * ADMIN_PATH, so it is also safe to use in client-side React components.
 */
export const ADMIN_PATH = typeof globalThis.__CMS_ADMIN_PATH__ === "string"
  ? globalThis.__CMS_ADMIN_PATH__
  : typeof __ADMIN_PATH__ === "string"
    ? __ADMIN_PATH__
    : "/admin"
