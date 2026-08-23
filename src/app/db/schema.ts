import { databaseConfig } from "@zbeaver/beaver/app/config/database"
import * as sqliteSchema from "./schema/sqlite"
import * as mysqlSchema from "./schema/mysql"
import * as pgsqlSchema from "./schema/pgsql"

const activeSchema = databaseConfig.connection === "mysql"
  ? mysqlSchema
  : databaseConfig.connection === "pgsql"
    ? pgsqlSchema
    : sqliteSchema

// The table objects are selected once at server startup. The public type is
// intentionally based on the SQLite schema because all three dialects expose
// the same application-level values; db/index.ts supplies the dialect-specific
// Drizzle client at runtime.
export const users = activeSchema.users as typeof sqliteSchema.users
export const adminRefreshSessions = activeSchema.adminRefreshSessions as typeof sqliteSchema.adminRefreshSessions
export const passwordResetTokens = activeSchema.passwordResetTokens as typeof sqliteSchema.passwordResetTokens
export const posts = activeSchema.posts as typeof sqliteSchema.posts
export const menus = activeSchema.menus as typeof sqliteSchema.menus
export const categories = activeSchema.categories as typeof sqliteSchema.categories
export const postCategories = activeSchema.postCategories as typeof sqliteSchema.postCategories
export const roles = activeSchema.roles as typeof sqliteSchema.roles
export const permissions = activeSchema.permissions as typeof sqliteSchema.permissions
export const rolePermissions = activeSchema.rolePermissions as typeof sqliteSchema.rolePermissions
export const media = activeSchema.media as typeof sqliteSchema.media
export const settings = activeSchema.settings as typeof sqliteSchema.settings

export const usersRelations = activeSchema.usersRelations
export const postsRelations = activeSchema.postsRelations
export const categoriesRelations = activeSchema.categoriesRelations
export const postCategoriesRelations = activeSchema.postCategoriesRelations
export const rolesRelations = activeSchema.rolesRelations
export const permissionsRelations = activeSchema.permissionsRelations
export const rolePermissionsRelations = activeSchema.rolePermissionsRelations
export const mediaRelations = activeSchema.mediaRelations
export const menusRelations = activeSchema.menusRelations

export const schema = {
  users,
  adminRefreshSessions,
  passwordResetTokens,
  posts,
  menus,
  categories,
  postCategories,
  roles,
  permissions,
  rolePermissions,
  media,
  settings,
  usersRelations,
  postsRelations,
  categoriesRelations,
  postCategoriesRelations,
  rolesRelations,
  permissionsRelations,
  rolePermissionsRelations,
  mediaRelations,
  menusRelations,
}

export const databaseDialect = databaseConfig.connection

