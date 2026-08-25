import { relations } from "drizzle-orm"
import { bigint, index, int, mysqlTable, text, varchar, type AnyMySqlColumn } from "drizzle-orm/mysql-core"

const id = (name: string) => varchar(name, { length: 26 })
const timestamp = (name: string) => bigint(name, { mode: "number" })

export const users = mysqlTable("users", {
  id: id("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("author"),
  emailVerified: int("email_verified").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

// user_id intentionally has no foreign key because the environment-managed
// Super Admin is represented by the virtual `env-super-admin` id.
export const adminTwoFactor = mysqlTable("admin_two_factor", {
  userId: id("user_id").primaryKey(),
  secret: text("secret").notNull(),
  enabled: int("enabled").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const adminRefreshSessions = mysqlTable("admin_refresh_sessions", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
})

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
})

export const posts = mysqlTable("posts", {
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
  authorId: id("author_id").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  deletedAtIdx: index("posts_deleted_at_idx").on(table.deletedAt, table.type, table.updatedAt),
}))

export const menus = mysqlTable("menus", {
  id: id("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  position: int("position").notNull().default(0),
  parentId: id("parent_id").references((): AnyMySqlColumn => menus.id),
  cssClass: varchar("css_class", { length: 255 }),
  target: varchar("target", { length: 32 }),
  image: text("image"),
  status: varchar("status", { length: 32 }).notNull().default("published"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const categories = mysqlTable("categories", {
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

export const postCategories = mysqlTable("post_categories", {
  id: id("id").primaryKey(),
  postId: id("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  categoryId: id("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
})

export const media = mysqlTable("media", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  alt: text("alt"),
  caption: text("caption"),
  width: int("width"),
  height: int("height"),
  folder: varchar("folder", { length: 255 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

// Activity logs intentionally keep an actor snapshot and do not reference
// users because the environment-managed Super Admin is virtual and database
// users can be deleted without invalidating historical audit records.
export const activityLogs = mysqlTable("activity_logs", {
  id: id("id").primaryKey(),
  actorId: id("actor_id"),
  actorName: varchar("actor_name", { length: 255 }),
  actorEmail: varchar("actor_email", { length: 255 }),
  action: varchar("action", { length: 64 }).notNull(),
  resource: varchar("resource", { length: 64 }).notNull(),
  resourceId: id("resource_id"),
  metadata: text("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  success: int("success").notNull().default(1),
  statusCode: int("status_code").notNull().default(200),
  createdAt: timestamp("created_at").notNull(),
}, (table) => ({
  createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
  actorCreatedAtIdx: index("activity_logs_actor_created_at_idx").on(table.actorId, table.createdAt),
  resourceCreatedAtIdx: index("activity_logs_resource_created_at_idx").on(table.resource, table.resourceId, table.createdAt),
}))

export const usersRelations = relations(users, ({ many }) => ({
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
export const mediaRelations = relations(media, ({ one }) => ({ user: one(users, { fields: [media.userId], references: [users.id] }) }))
export const menusRelations = relations(menus, ({ one, many }) => ({
  parent: one(menus, { fields: [menus.parentId], references: [menus.id], relationName: "menuParentChild" }),
  children: many(menus, { relationName: "menuParentChild" }),
}))
