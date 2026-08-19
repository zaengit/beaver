import type { menus } from "@zaenpm/beaver/app/db/schema"

export const MENU_TABLE = "menus"

export type MenuRecord = typeof menus.$inferSelect
export type MenuInsert = typeof menus.$inferInsert
