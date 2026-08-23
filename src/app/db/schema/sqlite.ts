import { relations } from "drizzle-orm"
import { integer, sqliteTable, text, type AnySQLiteColumn } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  roleId: text("role_id").references(() => roles.id),
  emailVerified: integer("email_verified").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const adminRefreshSessions = sqliteTable("admin_refresh_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
})

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
})

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull().default("post"),
  status: text("status").notNull().default("draft"),
  excerpt: text("excerpt"),
  description: text("description"),
  tags: text("tags"),
  sections: text("sections"),
  customFieldValues: text("custom_field_values"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  featuredImage: text("featured_image"),
  gallery: text("gallery"),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  publishedAt: integer("published_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const menus = sqliteTable("menus", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  position: integer("position").notNull().default(0),
  parentId: text("parent_id").references((): AnySQLiteColumn => menus.id),
  cssClass: text("css_class"),
  target: text("target"),
  image: text("image"),
  status: text("status").notNull().default("published"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull().default("post"),
  description: text("description"),
  image: text("image"),
  status: text("status").notNull().default("published"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const postCategories = sqliteTable("post_categories", {
  id: text("id").primaryKey(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
})

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isSystem: integer("is_system").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  group: text("group").notNull(),
  description: text("description"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const rolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey(),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull(),
})

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  alt: text("alt"),
  caption: text("caption"),
  width: integer("width"),
  height: integer("height"),
  folder: text("folder"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
})

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
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

