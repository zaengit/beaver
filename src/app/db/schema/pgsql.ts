import { relations } from "drizzle-orm"
import { bigint, integer, pgTable, text, varchar, type AnyPgColumn } from "drizzle-orm/pg-core"

const id = (name: string) => varchar(name, { length: 26 })
const timestamp = (name: string) => bigint(name, { mode: "number" })

export const users = pgTable("users", {
  id: id("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  roleId: id("role_id").references(() => roles.id),
  emailVerified: integer("email_verified").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const adminRefreshSessions = pgTable("admin_refresh_sessions", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
})

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
})

export const posts = pgTable("posts", {
  id: id("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 64 }).notNull().default("post"),
  status: varchar("status", { length: 32 }).notNull().default("draft"),
  excerpt: text("excerpt"),
  description: text("description"),
  tags: text("tags"),
  sections: text("sections"),
  customFieldValues: text("custom_field_values"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  featuredImage: text("featured_image"),
  gallery: text("gallery"),
  authorId: id("author_id").notNull().references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const menus = pgTable("menus", {
  id: id("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  position: integer("position").notNull().default(0),
  parentId: id("parent_id").references((): AnyPgColumn => menus.id),
  cssClass: varchar("css_class", { length: 255 }),
  target: varchar("target", { length: 32 }),
  image: text("image"),
  status: varchar("status", { length: 32 }).notNull().default("published"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const categories = pgTable("categories", {
  id: id("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 64 }).notNull().default("post"),
  description: text("description"),
  image: text("image"),
  status: varchar("status", { length: 32 }).notNull().default("published"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const postCategories = pgTable("post_categories", {
  id: id("id").primaryKey(),
  postId: id("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  categoryId: id("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
})

export const roles = pgTable("roles", {
  id: id("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  isSystem: integer("is_system").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const permissions = pgTable("permissions", {
  id: id("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  group: varchar("group", { length: 64 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const rolePermissions = pgTable("role_permissions", {
  id: id("id").primaryKey(),
  roleId: id("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: id("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
})

export const media = pgTable("media", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  alt: text("alt"),
  caption: text("caption"),
  width: integer("width"),
  height: integer("height"),
  folder: varchar("folder", { length: 255 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const settings = pgTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  posts: many(posts),
  media: many(media),
}))
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  postCategories: many(postCategories),
}))
export const categoriesRelations = relations(categories, ({ many }) => ({ postCategories: many(postCategories) }))
export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, { fields: [postCategories.postId], references: [posts.id] }),
  category: one(categories, { fields: [postCategories.categoryId], references: [categories.id] }),
}))
export const rolesRelations = relations(roles, ({ many }) => ({ users: many(users), rolePermissions: many(rolePermissions) }))
export const permissionsRelations = relations(permissions, ({ many }) => ({ rolePermissions: many(rolePermissions) }))
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}))
export const mediaRelations = relations(media, ({ one }) => ({ user: one(users, { fields: [media.userId], references: [users.id] }) }))
export const menusRelations = relations(menus, ({ one, many }) => ({
  parent: one(menus, { fields: [menus.parentId], references: [menus.id], relationName: "menuParentChild" }),
  children: many(menus, { relationName: "menuParentChild" }),
}))

