import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { existsSync, mkdirSync, chmodSync, lstatSync, statSync, readFileSync, writeFileSync, renameSync, unlinkSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, relative, sep, isAbsolute } from "node:path";
import { migrate as migrate$1 } from "drizzle-orm/sqlite-proxy/migrator";
import { migrate as migrate$2 } from "drizzle-orm/mysql2/migrator";
import { migrate as migrate$3 } from "drizzle-orm/node-postgres/migrator";
import { unlink, mkdir, writeFile, readFile } from "node:fs/promises";
import { relations, eq, like, desc, asc, and, count, isNull, or, lte, inArray, sql, isNotNull, gt, gte, lt } from "drizzle-orm";
import { z } from "zod";
import { verify as verify$1, generateSecret, generateURI } from "otplib";
import bcrypt from "bcrypt";
import { ulid } from "ulidx";
import sanitizeHtmlLibrary from "sanitize-html";
import { randomUUID, createHash, createDecipheriv, randomBytes, createCipheriv } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { jwtVerify, SignJWT } from "jose";
import nodemailer from "nodemailer";
import { isIP } from "node:net";
import Database from "better-sqlite3";
import mysql from "mysql2/promise";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { drizzle as drizzle$1 } from "drizzle-orm/mysql2";
import { drizzle as drizzle$2 } from "drizzle-orm/node-postgres";
import { sqliteTable, integer, text, index as index$5 } from "drizzle-orm/sqlite-core";
import { mysqlTable, int, varchar, text as text$1, index as index$6, bigint } from "drizzle-orm/mysql-core";
import { pgTable, integer as integer$1, varchar as varchar$1, text as text$2, index as index$7, bigint as bigint$1 } from "drizzle-orm/pg-core";
function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1e3);
}
function toDateMilliseconds(value) {
  if (value === null || value === void 0 || !Number.isFinite(value)) return null;
  return Math.abs(value) < 1e10 ? value * 1e3 : value;
}
const DEFAULT_ACTIVITY_LOG_RETENTION_DAYS = 90;
const MIN_ACTIVITY_LOG_RETENTION_DAYS = 1;
const MAX_ACTIVITY_LOG_RETENTION_DAYS = 3650;
const ACTIVITY_LOG_RETENTION_ENV = "BEAVER_ACTIVITY_LOG_RETENTION_DAYS";
function parseRetentionDays(value) {
  if (value === void 0 || value.trim() === "") return DEFAULT_ACTIVITY_LOG_RETENTION_DAYS;
  if (!/^\d+$/.test(value.trim())) {
    throw new Error(`${ACTIVITY_LOG_RETENTION_ENV} must be a whole number between ${MIN_ACTIVITY_LOG_RETENTION_DAYS} and ${MAX_ACTIVITY_LOG_RETENTION_DAYS}.`);
  }
  const days = Number(value.trim());
  if (!Number.isSafeInteger(days) || days < MIN_ACTIVITY_LOG_RETENTION_DAYS || days > MAX_ACTIVITY_LOG_RETENTION_DAYS) {
    throw new Error(`${ACTIVITY_LOG_RETENTION_ENV} must be a whole number between ${MIN_ACTIVITY_LOG_RETENTION_DAYS} and ${MAX_ACTIVITY_LOG_RETENTION_DAYS}.`);
  }
  return days;
}
function getActivityLogRetentionDays() {
  return parseRetentionDays(process.env[ACTIVITY_LOG_RETENTION_ENV]);
}
function getActivityLogRetentionCutoff(now = getCurrentTimestamp()) {
  return now - getActivityLogRetentionDays() * 24 * 60 * 60;
}
function env(name) {
  const value = process.env[name]?.trim();
  return value ? value : void 0;
}
function parsePort(value, fallback) {
  if (!value) return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${value} is not a valid database port.`);
  }
  return port;
}
function parseBoolean$1(value) {
  return value === "1" || value?.toLowerCase() === "true";
}
function legacyDatabaseUrl() {
  const value = env("DATABASE_URL");
  if (!value) return {};
  if (value === ":memory:" || value.startsWith("file:") || !/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    return { connection: "sqlite", database: value };
  }
  try {
    const url = new URL(value);
    const protocol = url.protocol.toLowerCase();
    const connection = protocol === "mysql:" || protocol === "mysql2:" ? "mysql" : protocol === "postgres:" || protocol === "postgresql:" ? "pgsql" : void 0;
    if (!connection) throw new Error("DATABASE_URL must be a SQLite path, mysql:// URL, or postgres:// URL.");
    const database = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (!database) throw new Error("DATABASE_URL must include a database name.");
    const defaultPort = connection === "mysql" ? 3306 : 5432;
    const sslMode = url.searchParams.get("sslmode");
    return {
      connection,
      database,
      host: url.hostname || "127.0.0.1",
      port: parsePort(url.port, defaultPort),
      username: url.username ? decodeURIComponent(url.username) : connection === "mysql" ? "root" : "postgres",
      password: url.password ? decodeURIComponent(url.password) : "",
      ssl: url.searchParams.get("ssl") === "true" || sslMode !== null && sslMode !== "disable"
    };
  } catch {
    throw new Error("DATABASE_URL is not a valid database URL.");
  }
}
function normalizeConnection(value) {
  if (!value) return void 0;
  const normalized = value.toLowerCase();
  if (normalized === "sqlite") return "sqlite";
  if (normalized === "mysql" || normalized === "mysql2") return "mysql";
  if (normalized === "pgsql" || normalized === "postgres" || normalized === "postgresql") return "pgsql";
  throw new Error(`Unsupported DB_CONNECTION "${value}". Use sqlite, mysql, or pgsql.`);
}
function getDatabaseConfig() {
  const legacy = legacyDatabaseUrl();
  const connection = normalizeConnection(env("DB_CONNECTION")) ?? legacy.connection ?? "sqlite";
  if (connection === "sqlite") {
    return {
      connection,
      database: env("DB_DATABASE") ?? (legacy.connection === "sqlite" ? legacy.database : void 0) ?? "./db/sqlite.db",
      ssl: false
    };
  }
  const defaultPort = connection === "mysql" ? 3306 : 5432;
  const database = env("DB_DATABASE") ?? (legacy.connection === connection ? legacy.database : void 0);
  if (!database) {
    throw new Error(`DB_DATABASE is required when DB_CONNECTION=${connection}.`);
  }
  return {
    connection,
    database,
    host: env("DB_HOST") ?? (legacy.connection === connection ? legacy.host : void 0) ?? "127.0.0.1",
    port: parsePort(env("DB_PORT"), legacy.connection === connection ? legacy.port ?? defaultPort : defaultPort),
    username: env("DB_USERNAME") ?? (legacy.connection === connection ? legacy.username : void 0) ?? (connection === "mysql" ? "root" : "postgres"),
    password: process.env.DB_PASSWORD ?? (legacy.connection === connection ? legacy.password : void 0) ?? "",
    ssl: env("DB_SSL") !== void 0 ? parseBoolean$1(env("DB_SSL")) : legacy.connection === connection ? legacy.ssl ?? false : false
  };
}
const databaseConfig = getDatabaseConfig();
const users$3 = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("author"),
  emailVerified: integer("email_verified").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const adminTwoFactor$3 = sqliteTable("admin_two_factor", {
  userId: text("user_id").primaryKey(),
  secret: text("secret").notNull(),
  enabled: integer("enabled").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const adminRefreshSessions$3 = sqliteTable("admin_refresh_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users$3.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull()
});
const passwordResetTokens$3 = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users$3.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull()
});
const posts$3 = sqliteTable("posts", {
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
  authorId: text("author_id").notNull(),
  publishedAt: integer("published_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at")
}, (table) => ({
  deletedAtIdx: index$5("posts_deleted_at_idx").on(table.deletedAt, table.type, table.updatedAt)
}));
const menus$3 = sqliteTable("menus", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  position: integer("position").notNull().default(0),
  parentId: text("parent_id").references(() => menus$3.id),
  cssClass: text("css_class"),
  target: text("target"),
  image: text("image"),
  status: text("status").notNull().default("published"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const categories$3 = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull().default("post"),
  description: text("description"),
  image: text("image"),
  status: text("status").notNull().default("published"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const postCategories$3 = sqliteTable("post_categories", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts$3.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories$3.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull()
});
const media$3 = sqliteTable("media", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
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
  updatedAt: integer("updated_at").notNull()
});
const settings$4 = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const activityLogs$4 = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  actorName: text("actor_name"),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  metadata: text("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: integer("success").notNull().default(1),
  statusCode: integer("status_code").notNull().default(200),
  createdAt: integer("created_at").notNull()
}, (table) => ({
  createdAtIdx: index$5("activity_logs_created_at_idx").on(table.createdAt),
  actorCreatedAtIdx: index$5("activity_logs_actor_created_at_idx").on(table.actorId, table.createdAt),
  resourceCreatedAtIdx: index$5("activity_logs_resource_created_at_idx").on(table.resource, table.resourceId, table.createdAt)
}));
const usersRelations$3 = relations(users$3, ({ many }) => ({
  posts: many(posts$3),
  media: many(media$3)
}));
const postsRelations$3 = relations(posts$3, ({ one, many }) => ({
  author: one(users$3, { fields: [posts$3.authorId], references: [users$3.id] }),
  postCategories: many(postCategories$3)
}));
const categoriesRelations$3 = relations(categories$3, ({ many }) => ({ postCategories: many(postCategories$3) }));
const postCategoriesRelations$3 = relations(postCategories$3, ({ one }) => ({
  post: one(posts$3, { fields: [postCategories$3.postId], references: [posts$3.id] }),
  category: one(categories$3, { fields: [postCategories$3.categoryId], references: [categories$3.id] })
}));
const mediaRelations$3 = relations(media$3, ({ one }) => ({ user: one(users$3, { fields: [media$3.userId], references: [users$3.id] }) }));
const menusRelations$3 = relations(menus$3, ({ one, many }) => ({
  parent: one(menus$3, { fields: [menus$3.parentId], references: [menus$3.id], relationName: "menuParentChild" }),
  children: many(menus$3, { relationName: "menuParentChild" })
}));
const sqliteSchema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activityLogs: activityLogs$4,
  adminRefreshSessions: adminRefreshSessions$3,
  adminTwoFactor: adminTwoFactor$3,
  categories: categories$3,
  categoriesRelations: categoriesRelations$3,
  media: media$3,
  mediaRelations: mediaRelations$3,
  menus: menus$3,
  menusRelations: menusRelations$3,
  passwordResetTokens: passwordResetTokens$3,
  postCategories: postCategories$3,
  postCategoriesRelations: postCategoriesRelations$3,
  posts: posts$3,
  postsRelations: postsRelations$3,
  settings: settings$4,
  users: users$3,
  usersRelations: usersRelations$3
}, Symbol.toStringTag, { value: "Module" }));
const id$1 = (name) => varchar(name, { length: 26 });
const timestamp$1 = (name) => bigint(name, { mode: "number" });
const users$2 = mysqlTable("users", {
  id: id$1("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("author"),
  emailVerified: int("email_verified").notNull().default(0),
  createdAt: timestamp$1("created_at").notNull(),
  updatedAt: timestamp$1("updated_at").notNull()
});
const adminTwoFactor$2 = mysqlTable("admin_two_factor", {
  userId: id$1("user_id").primaryKey(),
  secret: text$1("secret").notNull(),
  enabled: int("enabled").notNull().default(0),
  createdAt: timestamp$1("created_at").notNull(),
  updatedAt: timestamp$1("updated_at").notNull()
});
const adminRefreshSessions$2 = mysqlTable("admin_refresh_sessions", {
  id: id$1("id").primaryKey(),
  userId: id$1("user_id").notNull().references(() => users$2.id, { onDelete: "cascade" }),
  expiresAt: timestamp$1("expires_at").notNull(),
  createdAt: timestamp$1("created_at").notNull()
});
const passwordResetTokens$2 = mysqlTable("password_reset_tokens", {
  id: id$1("id").primaryKey(),
  userId: id$1("user_id").notNull().references(() => users$2.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp$1("expires_at").notNull(),
  createdAt: timestamp$1("created_at").notNull()
});
const posts$2 = mysqlTable("posts", {
  id: id$1("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 64 }).notNull().default("post"),
  status: varchar("status", { length: 32 }).notNull().default("draft"),
  excerpt: text$1("excerpt"),
  description: text$1("description"),
  tags: text$1("tags"),
  sections: text$1("sections"),
  customFieldValues: text$1("custom_field_values"),
  metaTitle: text$1("meta_title"),
  metaDescription: text$1("meta_description"),
  featuredImage: text$1("featured_image"),
  gallery: text$1("gallery"),
  authorId: id$1("author_id").notNull(),
  publishedAt: timestamp$1("published_at"),
  createdAt: timestamp$1("created_at").notNull(),
  updatedAt: timestamp$1("updated_at").notNull(),
  deletedAt: timestamp$1("deleted_at")
}, (table) => ({
  deletedAtIdx: index$6("posts_deleted_at_idx").on(table.deletedAt, table.type, table.updatedAt)
}));
const menus$2 = mysqlTable("menus", {
  id: id$1("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text$1("url").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  position: int("position").notNull().default(0),
  parentId: id$1("parent_id").references(() => menus$2.id),
  cssClass: varchar("css_class", { length: 255 }),
  target: varchar("target", { length: 32 }),
  image: text$1("image"),
  status: varchar("status", { length: 32 }).notNull().default("published"),
  createdAt: timestamp$1("created_at").notNull(),
  updatedAt: timestamp$1("updated_at").notNull()
});
const categories$2 = mysqlTable("categories", {
  id: id$1("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 64 }).notNull().default("post"),
  description: text$1("description"),
  image: text$1("image"),
  status: varchar("status", { length: 32 }).notNull().default("published"),
  createdAt: timestamp$1("created_at").notNull(),
  updatedAt: timestamp$1("updated_at").notNull()
});
const postCategories$2 = mysqlTable("post_categories", {
  id: id$1("id").primaryKey(),
  postId: id$1("post_id").notNull().references(() => posts$2.id, { onDelete: "cascade" }),
  categoryId: id$1("category_id").notNull().references(() => categories$2.id, { onDelete: "cascade" }),
  createdAt: timestamp$1("created_at").notNull()
});
const media$2 = mysqlTable("media", {
  id: id$1("id").primaryKey(),
  userId: id$1("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  url: text$1("url").notNull(),
  thumbnailUrl: text$1("thumbnail_url"),
  alt: text$1("alt"),
  caption: text$1("caption"),
  width: int("width"),
  height: int("height"),
  folder: varchar("folder", { length: 255 }),
  createdAt: timestamp$1("created_at").notNull(),
  updatedAt: timestamp$1("updated_at").notNull()
});
const settings$3 = mysqlTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text$1("value").notNull(),
  createdAt: timestamp$1("created_at").notNull(),
  updatedAt: timestamp$1("updated_at").notNull()
});
const activityLogs$3 = mysqlTable("activity_logs", {
  id: id$1("id").primaryKey(),
  actorId: id$1("actor_id"),
  actorName: varchar("actor_name", { length: 255 }),
  actorEmail: varchar("actor_email", { length: 255 }),
  action: varchar("action", { length: 64 }).notNull(),
  resource: varchar("resource", { length: 64 }).notNull(),
  resourceId: id$1("resource_id"),
  metadata: text$1("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text$1("user_agent"),
  success: int("success").notNull().default(1),
  statusCode: int("status_code").notNull().default(200),
  createdAt: timestamp$1("created_at").notNull()
}, (table) => ({
  createdAtIdx: index$6("activity_logs_created_at_idx").on(table.createdAt),
  actorCreatedAtIdx: index$6("activity_logs_actor_created_at_idx").on(table.actorId, table.createdAt),
  resourceCreatedAtIdx: index$6("activity_logs_resource_created_at_idx").on(table.resource, table.resourceId, table.createdAt)
}));
const usersRelations$2 = relations(users$2, ({ many }) => ({
  posts: many(posts$2),
  media: many(media$2)
}));
const postsRelations$2 = relations(posts$2, ({ one, many }) => ({
  author: one(users$2, { fields: [posts$2.authorId], references: [users$2.id] }),
  postCategories: many(postCategories$2)
}));
const categoriesRelations$2 = relations(categories$2, ({ many }) => ({ postCategories: many(postCategories$2) }));
const postCategoriesRelations$2 = relations(postCategories$2, ({ one }) => ({
  post: one(posts$2, { fields: [postCategories$2.postId], references: [posts$2.id] }),
  category: one(categories$2, { fields: [postCategories$2.categoryId], references: [categories$2.id] })
}));
const mediaRelations$2 = relations(media$2, ({ one }) => ({ user: one(users$2, { fields: [media$2.userId], references: [users$2.id] }) }));
const menusRelations$2 = relations(menus$2, ({ one, many }) => ({
  parent: one(menus$2, { fields: [menus$2.parentId], references: [menus$2.id], relationName: "menuParentChild" }),
  children: many(menus$2, { relationName: "menuParentChild" })
}));
const mysqlSchema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activityLogs: activityLogs$3,
  adminRefreshSessions: adminRefreshSessions$2,
  adminTwoFactor: adminTwoFactor$2,
  categories: categories$2,
  categoriesRelations: categoriesRelations$2,
  media: media$2,
  mediaRelations: mediaRelations$2,
  menus: menus$2,
  menusRelations: menusRelations$2,
  passwordResetTokens: passwordResetTokens$2,
  postCategories: postCategories$2,
  postCategoriesRelations: postCategoriesRelations$2,
  posts: posts$2,
  postsRelations: postsRelations$2,
  settings: settings$3,
  users: users$2,
  usersRelations: usersRelations$2
}, Symbol.toStringTag, { value: "Module" }));
const id = (name) => varchar$1(name, { length: 26 });
const timestamp = (name) => bigint$1(name, { mode: "number" });
const users$1 = pgTable("users", {
  id: id("id").primaryKey(),
  name: varchar$1("name", { length: 255 }).notNull(),
  email: varchar$1("email", { length: 255 }).notNull().unique(),
  password: varchar$1("password", { length: 255 }).notNull(),
  role: varchar$1("role", { length: 32 }).notNull().default("author"),
  emailVerified: integer$1("email_verified").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
const adminTwoFactor$1 = pgTable("admin_two_factor", {
  userId: id("user_id").primaryKey(),
  secret: text$2("secret").notNull(),
  enabled: integer$1("enabled").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
const adminRefreshSessions$1 = pgTable("admin_refresh_sessions", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => users$1.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull()
});
const passwordResetTokens$1 = pgTable("password_reset_tokens", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull().references(() => users$1.id, { onDelete: "cascade" }),
  token: varchar$1("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull()
});
const posts$1 = pgTable("posts", {
  id: id("id").primaryKey(),
  title: varchar$1("title", { length: 255 }).notNull(),
  slug: varchar$1("slug", { length: 255 }).notNull().unique(),
  type: varchar$1("type", { length: 64 }).notNull().default("post"),
  status: varchar$1("status", { length: 32 }).notNull().default("draft"),
  excerpt: text$2("excerpt"),
  description: text$2("description"),
  tags: text$2("tags"),
  sections: text$2("sections"),
  customFieldValues: text$2("custom_field_values"),
  metaTitle: text$2("meta_title"),
  metaDescription: text$2("meta_description"),
  featuredImage: text$2("featured_image"),
  gallery: text$2("gallery"),
  authorId: id("author_id").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  deletedAt: timestamp("deleted_at")
}, (table) => ({
  deletedAtIdx: index$7("posts_deleted_at_idx").on(table.deletedAt, table.type, table.updatedAt)
}));
const menus$1 = pgTable("menus", {
  id: id("id").primaryKey(),
  title: varchar$1("title", { length: 255 }).notNull(),
  url: text$2("url").notNull(),
  type: varchar$1("type", { length: 32 }).notNull(),
  position: integer$1("position").notNull().default(0),
  parentId: id("parent_id").references(() => menus$1.id),
  cssClass: varchar$1("css_class", { length: 255 }),
  target: varchar$1("target", { length: 32 }),
  image: text$2("image"),
  status: varchar$1("status", { length: 32 }).notNull().default("published"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
const categories$1 = pgTable("categories", {
  id: id("id").primaryKey(),
  name: varchar$1("name", { length: 255 }).notNull(),
  slug: varchar$1("slug", { length: 255 }).notNull().unique(),
  type: varchar$1("type", { length: 64 }).notNull().default("post"),
  description: text$2("description"),
  image: text$2("image"),
  status: varchar$1("status", { length: 32 }).notNull().default("published"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
const postCategories$1 = pgTable("post_categories", {
  id: id("id").primaryKey(),
  postId: id("post_id").notNull().references(() => posts$1.id, { onDelete: "cascade" }),
  categoryId: id("category_id").notNull().references(() => categories$1.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull()
});
const media$1 = pgTable("media", {
  id: id("id").primaryKey(),
  userId: id("user_id").notNull(),
  name: varchar$1("name", { length: 255 }).notNull(),
  fileName: varchar$1("file_name", { length: 255 }).notNull(),
  mimeType: varchar$1("mime_type", { length: 255 }).notNull(),
  size: bigint$1("size", { mode: "number" }).notNull(),
  url: text$2("url").notNull(),
  thumbnailUrl: text$2("thumbnail_url"),
  alt: text$2("alt"),
  caption: text$2("caption"),
  width: integer$1("width"),
  height: integer$1("height"),
  folder: varchar$1("folder", { length: 255 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
const settings$2 = pgTable("settings", {
  key: varchar$1("key", { length: 255 }).primaryKey(),
  value: text$2("value").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull()
});
const activityLogs$2 = pgTable("activity_logs", {
  id: id("id").primaryKey(),
  actorId: id("actor_id"),
  actorName: varchar$1("actor_name", { length: 255 }),
  actorEmail: varchar$1("actor_email", { length: 255 }),
  action: varchar$1("action", { length: 64 }).notNull(),
  resource: varchar$1("resource", { length: 64 }).notNull(),
  resourceId: id("resource_id"),
  metadata: text$2("metadata"),
  ipAddress: varchar$1("ip_address", { length: 45 }),
  userAgent: text$2("user_agent"),
  success: integer$1("success").notNull().default(1),
  statusCode: integer$1("status_code").notNull().default(200),
  createdAt: timestamp("created_at").notNull()
}, (table) => ({
  createdAtIdx: index$7("activity_logs_created_at_idx").on(table.createdAt),
  actorCreatedAtIdx: index$7("activity_logs_actor_created_at_idx").on(table.actorId, table.createdAt),
  resourceCreatedAtIdx: index$7("activity_logs_resource_created_at_idx").on(table.resource, table.resourceId, table.createdAt)
}));
const usersRelations$1 = relations(users$1, ({ many }) => ({
  posts: many(posts$1),
  media: many(media$1)
}));
const postsRelations$1 = relations(posts$1, ({ one, many }) => ({
  author: one(users$1, { fields: [posts$1.authorId], references: [users$1.id] }),
  postCategories: many(postCategories$1)
}));
const categoriesRelations$1 = relations(categories$1, ({ many }) => ({ postCategories: many(postCategories$1) }));
const postCategoriesRelations$1 = relations(postCategories$1, ({ one }) => ({
  post: one(posts$1, { fields: [postCategories$1.postId], references: [posts$1.id] }),
  category: one(categories$1, { fields: [postCategories$1.categoryId], references: [categories$1.id] })
}));
const mediaRelations$1 = relations(media$1, ({ one }) => ({ user: one(users$1, { fields: [media$1.userId], references: [users$1.id] }) }));
const menusRelations$1 = relations(menus$1, ({ one, many }) => ({
  parent: one(menus$1, { fields: [menus$1.parentId], references: [menus$1.id], relationName: "menuParentChild" }),
  children: many(menus$1, { relationName: "menuParentChild" })
}));
const pgsqlSchema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activityLogs: activityLogs$2,
  adminRefreshSessions: adminRefreshSessions$1,
  adminTwoFactor: adminTwoFactor$1,
  categories: categories$1,
  categoriesRelations: categoriesRelations$1,
  media: media$1,
  mediaRelations: mediaRelations$1,
  menus: menus$1,
  menusRelations: menusRelations$1,
  passwordResetTokens: passwordResetTokens$1,
  postCategories: postCategories$1,
  postCategoriesRelations: postCategoriesRelations$1,
  posts: posts$1,
  postsRelations: postsRelations$1,
  settings: settings$2,
  users: users$1,
  usersRelations: usersRelations$1
}, Symbol.toStringTag, { value: "Module" }));
const activeSchema = databaseConfig.connection === "mysql" ? mysqlSchema : databaseConfig.connection === "pgsql" ? pgsqlSchema : sqliteSchema;
const users = activeSchema.users;
const adminTwoFactor = activeSchema.adminTwoFactor;
const adminRefreshSessions = activeSchema.adminRefreshSessions;
const passwordResetTokens = activeSchema.passwordResetTokens;
const posts = activeSchema.posts;
const menus = activeSchema.menus;
const categories = activeSchema.categories;
const postCategories = activeSchema.postCategories;
const media = activeSchema.media;
const settings$1 = activeSchema.settings;
const activityLogs$1 = activeSchema.activityLogs;
const usersRelations = activeSchema.usersRelations;
const postsRelations = activeSchema.postsRelations;
const categoriesRelations = activeSchema.categoriesRelations;
const postCategoriesRelations = activeSchema.postCategoriesRelations;
const mediaRelations = activeSchema.mediaRelations;
const menusRelations = activeSchema.menusRelations;
const schema = {
  users,
  adminTwoFactor,
  adminRefreshSessions,
  passwordResetTokens,
  posts,
  menus,
  categories,
  postCategories,
  media,
  settings: settings$1,
  activityLogs: activityLogs$1,
  usersRelations,
  postsRelations,
  categoriesRelations,
  postCategoriesRelations,
  mediaRelations,
  menusRelations
};
const databaseDialect = databaseConfig.connection;
const sqliteClient = databaseConfig.connection === "sqlite" ? createSqliteClient(databaseConfig.database) : null;
const mysqlClient = databaseConfig.connection === "mysql" ? mysql.createPool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  user: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : void 0
}) : null;
const pgClient = databaseConfig.connection === "pgsql" ? new Pool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  user: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  max: 10,
  ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : void 0
}) : null;
const databaseTables = [
  "admin_two_factor",
  "admin_refresh_sessions",
  "password_reset_tokens",
  "post_categories",
  // Legacy tables retained so migrate:fresh can remove pre-static-role schemas.
  "role_permissions",
  "posts",
  "menus",
  "categories",
  "media",
  "settings",
  "activity_logs",
  "users",
  "permissions",
  "roles",
  "__drizzle_migrations"
];
async function closeDatabase() {
  if (sqliteClient) {
    sqliteClient.close();
    return;
  }
  if (mysqlClient) {
    await mysqlClient.end();
    return;
  }
  if (pgClient) await pgClient.end();
}
async function resetDatabase() {
  if (sqliteClient) {
    sqliteClient.pragma("foreign_keys = OFF");
    try {
      sqliteClient.exec(databaseTables.map((table) => `DROP TABLE IF EXISTS "${table}"`).join(";\n"));
    } finally {
      sqliteClient.pragma("foreign_keys = ON");
    }
    return;
  }
  if (mysqlClient) {
    const connection = await mysqlClient.getConnection();
    try {
      await connection.query("SET FOREIGN_KEY_CHECKS = 0");
      for (const table of databaseTables) {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      }
    } finally {
      try {
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
      } finally {
        connection.release();
      }
    }
    return;
  }
  if (pgClient) {
    const quotedTables = databaseTables.map((table) => `"${table}"`).join(", ");
    await pgClient.query(`DROP TABLE IF EXISTS ${quotedTables} CASCADE`);
    await pgClient.query('DROP SCHEMA IF EXISTS "drizzle" CASCADE');
  }
}
function createSqliteClient(dbPath) {
  const isFileDatabase = dbPath !== ":memory:" && !dbPath.startsWith("file:");
  const dbDir = isFileDatabase ? dirname(dbPath) : null;
  if (dbDir && dbDir !== "." && dbDir !== "") {
    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true, mode: 448 });
    chmodSync(dbDir, 448);
  }
  const sqlite = new Database(dbPath);
  if (isFileDatabase) chmodSync(dbPath, 384);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  if (isFileDatabase) {
    for (const suffix of ["-wal", "-shm"]) {
      const journalPath = `${dbPath}${suffix}`;
      if (existsSync(journalPath)) chmodSync(journalPath, 384);
    }
  }
  return sqlite;
}
const executeSqlite = async (sql2, params, method) => {
  const statement = sqliteClient.prepare(sql2);
  if (method === "run") {
    const result = statement.run(...params);
    return { rows: [{ changes: result.changes, lastInsertRowid: result.lastInsertRowid }] };
  }
  if (method === "get") {
    const row = statement.raw().get(...params);
    return { rows: row };
  }
  if (method === "values") return { rows: statement.raw().all(...params) };
  return { rows: statement.raw().all(...params) };
};
async function executeSqliteMigrations(queries) {
  for (const query of queries) {
    if (query.trim()) sqliteClient.exec(query);
  }
}
const sqliteDb = drizzle(executeSqlite, { schema });
const db = databaseConfig.connection === "sqlite" ? sqliteDb : databaseConfig.connection === "mysql" ? drizzle$1({ client: mysqlClient, schema, mode: "default" }) : drizzle$2({ client: pgClient, schema });
const allowedTags = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "blockquote",
  "pre",
  "code",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "hr",
  "a",
  "button",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "iframe"
];
const MAX_HTML_LENGTH = 1e5;
const MAX_TEXT_LENGTH = 1e4;
function sanitizeHtml(html) {
  if (!html) return "";
  return sanitizeHtmlLibrary(html.slice(0, MAX_HTML_LENGTH), {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
      "*": ["class"]
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    transformTags: {
      a(tagName, attribs) {
        const target = attribs.target?.trim().toLowerCase();
        const nextAttribs = { ...attribs };
        if (!["_self", "_blank", "_parent", "_top"].includes(target ?? "")) {
          delete nextAttribs.target;
          delete nextAttribs.rel;
          return { tagName, attribs: nextAttribs };
        }
        nextAttribs.target = target;
        if (target === "_blank") {
          nextAttribs.rel = "noopener noreferrer";
        } else {
          delete nextAttribs.rel;
        }
        return { tagName, attribs: nextAttribs };
      }
    },
    exclusiveFilter(frame) {
      return frame.tag === "iframe" && !frame.attribs.src;
    },
    enforceHtmlBoundary: true,
    disallowedTagsMode: "discard"
  });
}
function sanitizeText(text2) {
  if (!text2) return "";
  return sanitizeHtmlLibrary(text2.slice(0, MAX_TEXT_LENGTH), { allowedTags: [], allowedAttributes: {} }).trim();
}
function affectedRows(result) {
  if (Array.isArray(result)) return affectedRows(result[0]);
  if (!result || typeof result !== "object") return 0;
  const record = result;
  for (const key of ["changes", "affectedRows", "rowCount"]) {
    const value = record[key];
    if (typeof value === "number") return value;
  }
  if (record.rows !== result) return affectedRows(record.rows);
  return 0;
}
const MAX_CATEGORY_ROWS = 5e3;
async function findCategoryByIdRecord(id2) {
  const rows = await db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    type: categories.type,
    description: categories.description,
    image: categories.image,
    status: categories.status,
    createdAt: categories.createdAt,
    updatedAt: categories.updatedAt
  }).from(categories).where(eq(categories.id, id2)).limit(1).execute();
  return rows[0];
}
async function listCategoryRecords(filters) {
  const conditions = [];
  const type = filters?.type?.slice(0, 64);
  const search2 = filters?.search?.slice(0, 100);
  if (type) {
    conditions.push(eq(categories.type, type));
  }
  if (search2) {
    conditions.push(like(categories.name, `%${search2}%`));
  }
  if (filters?.status) {
    conditions.push(eq(categories.status, filters.status));
  }
  let orderColumn = desc(categories.updatedAt);
  if (filters?.sortBy) {
    const column = filters.sortBy === "name" ? categories.name : filters.sortBy === "createdAt" ? categories.createdAt : null;
    if (column) {
      orderColumn = filters.sortOrder === "asc" ? asc(column) : desc(column);
    }
  }
  const query = db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    type: categories.type,
    description: categories.description,
    image: categories.image,
    status: categories.status,
    createdAt: categories.createdAt,
    updatedAt: categories.updatedAt
  }).from(categories).orderBy(orderColumn);
  return await (conditions.length > 0 ? query.where(and(...conditions)) : query).limit(MAX_CATEGORY_ROWS).execute();
}
async function categorySlugExistsRecord(slug, excludeId) {
  const rows = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1).execute();
  return excludeId ? rows.some((row) => row.id !== excludeId) : rows.length > 0;
}
async function createCategoryRecord(input) {
  await db.insert(categories).values({
    ...input,
    name: sanitizeText(input.name),
    description: input.description ? sanitizeText(input.description) : null
  }).execute();
  return {
    id: input.id,
    name: sanitizeText(input.name),
    slug: input.slug,
    type: input.type,
    description: input.description ? sanitizeText(input.description) : null,
    image: input.image,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
  };
}
async function updateCategoryRecord(id2, input) {
  const updates = { updatedAt: input.updatedAt };
  if (input.name !== void 0) updates.name = sanitizeText(input.name);
  if (input.slug !== void 0) updates.slug = input.slug;
  if (input.type !== void 0) updates.type = input.type;
  if (input.description !== void 0) updates.description = input.description ? sanitizeText(input.description) : null;
  if (input.image !== void 0) updates.image = input.image;
  if (input.status !== void 0) updates.status = input.status;
  await db.update(categories).set(updates).where(eq(categories.id, id2)).execute();
  return await findCategoryByIdRecord(id2) ?? null;
}
async function deleteCategoryRecord(id2) {
  const result = await db.delete(categories).where(eq(categories.id, id2)).execute();
  return affectedRows(result) > 0;
}
const MAX_PAGE = 1e4;
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 10;
function clampPage(value, fallback = 1) {
  return typeof value === "number" && Number.isSafeInteger(value) ? Math.min(MAX_PAGE, Math.max(1, value)) : fallback;
}
function clampPerPage(value, fallback = DEFAULT_PER_PAGE) {
  const safeFallback = Math.min(MAX_PER_PAGE, Math.max(1, fallback));
  return typeof value === "number" && Number.isSafeInteger(value) ? Math.min(MAX_PER_PAGE, Math.max(1, value)) : safeFallback;
}
function clampPagination(filters) {
  const page = clampPage(filters.page);
  const perPage = clampPerPage(filters.perPage);
  return { page, perPage, offset: (page - 1) * perPage };
}
const MAX_FILTER_TEXT_LENGTH$3 = 100;
async function findMediaByIdRecord(id2) {
  const rows = await db.select().from(media).where(eq(media.id, id2)).limit(1).execute();
  return rows[0];
}
async function listMediaRecords(filters) {
  const { page, perPage, offset } = clampPagination(filters);
  const conditions = [];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH$3);
  const folder = filters.folder === null ? null : filters.folder?.slice(0, 255);
  const mimeType = filters.mimeType?.slice(0, 100);
  if (search2) {
    conditions.push(like(media.name, `%${search2}%`));
  }
  if (filters.folder !== void 0) {
    if (folder === null) conditions.push(eq(media.folder, null));
    else if (folder !== void 0) conditions.push(eq(media.folder, folder));
  }
  if (mimeType && mimeType !== "all") {
    conditions.push(
      mimeType.endsWith("/*") ? like(media.mimeType, `${mimeType.slice(0, -1)}%`) : eq(media.mimeType, mimeType)
    );
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  let query = db.select().from(media);
  if (whereClause) query = query.where(whereClause);
  const totalQuery = db.select({ value: count() }).from(media);
  const totalRows = whereClause ? await totalQuery.where(whereClause).execute() : await totalQuery.execute();
  const total = totalRows[0]?.value ?? 0;
  const data = await query.orderBy(desc(media.createdAt)).limit(perPage).offset(offset).execute();
  return {
    data,
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage: Math.max(1, Math.ceil(total / perPage)),
      from: total === 0 ? 0 : offset + 1,
      to: Math.min(offset + perPage, total)
    }
  };
}
async function createMediaRecord$1(input) {
  await db.insert(media).values(input).execute();
  return await findMediaByIdRecord(input.id);
}
async function updateMediaRecord(id2, input) {
  await db.update(media).set(input).where(eq(media.id, id2)).execute();
  return await findMediaByIdRecord(id2) ?? null;
}
async function deleteMediaRecord(id2) {
  const result = await db.delete(media).where(eq(media.id, id2)).execute();
  return affectedRows(result) > 0;
}
const MAX_MENU_ROWS = 5e3;
async function findMenuById(id2) {
  const rows = await db.select().from(menus).where(eq(menus.id, id2)).limit(1).execute();
  return rows[0];
}
async function listMenus$1(type, publishedOnly = false) {
  const query = db.select().from(menus);
  const condition = type ? eq(menus.type, type) : void 0;
  const where = publishedOnly ? condition ? and(condition, eq(menus.status, "published")) : eq(menus.status, "published") : condition;
  return await (where ? query.where(where) : query).limit(MAX_MENU_ROWS).execute();
}
async function getMenuTreeRecords(items, type) {
  const rows = await listMenus$1(type, true);
  const map = /* @__PURE__ */ new Map();
  const roots = [];
  for (const row of rows) {
    map.set(row.id, {
      id: row.id,
      title: row.title,
      url: row.url,
      position: row.position,
      cssClass: row.cssClass,
      target: row.target,
      image: row.image,
      parentId: row.parentId,
      children: []
    });
  }
  for (const row of rows) {
    const node = map.get(row.id);
    if (row.parentId && map.has(row.parentId)) {
      map.get(row.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  const visited = /* @__PURE__ */ new Set();
  const MAX_RENDER_DEPTH = 50;
  const sortTree = (tree, depth = 0) => {
    const result = [];
    for (const node of [...tree].sort((a, b) => a.position - b.position)) {
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      result.push({
        ...node,
        children: depth < MAX_RENDER_DEPTH ? sortTree(node.children, depth + 1) : []
      });
    }
    return result;
  };
  const sortedRoots = sortTree(roots);
  for (const node of map.values()) {
    if (!visited.has(node.id)) {
      node.parentId = null;
      sortedRoots.push(...sortTree([node]));
    }
  }
  return sortedRoots;
}
async function createMenuRecord(input) {
  await db.insert(menus).values({
    id: input.id,
    title: sanitizeText(input.title),
    url: input.url,
    type: input.type,
    position: input.position,
    cssClass: input.cssClass ? sanitizeText(input.cssClass) : null,
    target: input.target ?? null,
    image: input.image ?? null,
    status: input.status ?? "published",
    parentId: input.parentId ?? null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
  }).execute();
  return await findMenuById(input.id);
}
async function updateMenuRecord(id2, input) {
  const updateData = { updatedAt: input.updatedAt };
  if (input.title !== void 0) updateData.title = sanitizeText(input.title);
  if (input.url !== void 0) updateData.url = input.url;
  if (input.type !== void 0) updateData.type = input.type;
  if (input.position !== void 0) updateData.position = input.position;
  if (input.cssClass !== void 0) updateData.cssClass = input.cssClass ? sanitizeText(input.cssClass) : null;
  if (input.target !== void 0) updateData.target = input.target ?? null;
  if (input.image !== void 0) updateData.image = input.image ?? null;
  if (input.status !== void 0) updateData.status = input.status;
  if (input.parentId !== void 0) updateData.parentId = input.parentId ?? null;
  await db.update(menus).set(updateData).where(eq(menus.id, id2)).execute();
  return await findMenuById(id2) ?? null;
}
async function deleteMenuRecord(id2) {
  await db.update(menus).set({ parentId: null }).where(eq(menus.parentId, id2)).execute();
  const result = await db.delete(menus).where(eq(menus.id, id2)).execute();
  return affectedRows(result) > 0;
}
async function reorderMenuTree(items) {
  for (const item of items) {
    await db.update(menus).set({ position: item.position, parentId: item.parentId, updatedAt: Date.now() }).where(eq(menus.id, item.id)).execute();
  }
}
function generateId() {
  return ulid();
}
const SECRET_NAMES = ["SESSION_SECRET", "ADMIN_JWT_ACCESS_SECRET", "ADMIN_JWT_REFRESH_SECRET"];
const PLACEHOLDER_VALUES = /* @__PURE__ */ new Set([
  "change-me",
  "change-this-password",
  "admin@example.com",
  "password123"
]);
const BASE32_TOTP_SECRET_PATTERN = /^[A-Z2-7]+=*$/;
const MIN_TOTP_SECRET_LENGTH = 26;
function isTestEnvironment() {
  return process.env.NODE_ENV === "test" || process.env.NODE_ENV !== "production" && process.env.BEAVER_TEST_MODE === "true";
}
function assertSecureSecrets() {
  if (isTestEnvironment()) return;
  for (const name of SECRET_NAMES) {
    const value = process.env[name];
    if (!value || value.length < 32 || value.length > 4096 || PLACEHOLDER_VALUES.has(value)) {
      throw new Error(`${name} must be set to a random value of at least 32 characters.`);
    }
  }
}
function assertSecureAdminEnvironment() {
  if (isTestEnvironment()) return;
  assertSecureSecrets();
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim();
  if (!email || email.length > 254 || !/^.+@.+\..+$/.test(email) || !password || password.length < 12 || password.length > 128 || !name || name.length > 100) {
    throw new Error("Super Admin requires ADMIN_EMAIL, ADMIN_NAME, and an ADMIN_PASSWORD of at least 12 characters.");
  }
  if (PLACEHOLDER_VALUES.has(email) || PLACEHOLDER_VALUES.has(password)) {
    throw new Error("Super Admin does not allow placeholder administrator credentials.");
  }
  getSuperAdminTwoFactorConfig();
}
function getAdminCredentials() {
  if (isTestEnvironment()) {
    return {
      email: process.env.ADMIN_EMAIL?.trim() || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "password123",
      name: process.env.ADMIN_NAME?.trim() || "Super Admin"
    };
  }
  assertSecureAdminEnvironment();
  return {
    email: process.env.ADMIN_EMAIL.trim(),
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME.trim()
  };
}
function getSuperAdminTwoFactorConfig() {
  const rawEnabled = process.env.ADMIN_2FA_ENABLED?.trim().toLowerCase();
  if (rawEnabled && rawEnabled !== "true" && rawEnabled !== "false") {
    throw new Error("ADMIN_2FA_ENABLED must be either true or false.");
  }
  const enabled = rawEnabled === "true";
  if (!enabled) return { enabled: false, secret: null };
  const secret = process.env.ADMIN_2FA_SECRET?.replace(/\s+/g, "").toUpperCase();
  if (!secret || secret.length < MIN_TOTP_SECRET_LENGTH || !BASE32_TOTP_SECRET_PATTERN.test(secret)) {
    throw new Error("ADMIN_2FA_SECRET must be a valid Base32 TOTP secret of at least 26 characters when ADMIN_2FA_ENABLED=true.");
  }
  return { enabled: true, secret };
}
const BCRYPT_COST = 12;
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
const SUPER_ADMIN_USER_ID = "env-super-admin";
function isSuperAdminUserId(userId) {
  return userId === SUPER_ADMIN_USER_ID;
}
function isConfiguredSuperAdminEmail(email) {
  return email.trim().toLowerCase() === getAdminCredentials().email.toLowerCase();
}
function getSuperAdminUser() {
  const credentials = getAdminCredentials();
  return {
    id: SUPER_ADMIN_USER_ID,
    name: credentials.name,
    email: credentials.email,
    password: "",
    role: "super-admin",
    emailVerified: 1,
    createdAt: 0,
    updatedAt: 0
  };
}
function getSafeSuperAdminUser() {
  const user = getSuperAdminUser();
  Reflect.deleteProperty(user, "password");
  return user;
}
let configuredPasswordHash;
async function getConfiguredPasswordHash(password) {
  return configuredPasswordHash ??= bcrypt.hash(password, 12);
}
async function authenticateSuperAdmin(email, password) {
  const credentials = getAdminCredentials();
  if (email.trim().toLowerCase() !== credentials.email.toLowerCase()) return null;
  const hash = await getConfiguredPasswordHash(credentials.password);
  if (!await verifyPassword(password, hash)) return null;
  return getSafeSuperAdminUser();
}
const MAX_FILTER_TEXT_LENGTH$2 = 100;
function publicPublishedCondition(now = Date.now()) {
  return and(
    isNull(posts.deletedAt),
    eq(posts.status, "published"),
    or(isNull(posts.publishedAt), lte(posts.publishedAt, now))
  );
}
function activePostCondition() {
  return isNull(posts.deletedAt);
}
function trashedPostCondition() {
  return isNotNull(posts.deletedAt);
}
function authorNameExpression() {
  return sql`CASE WHEN ${posts.authorId} = ${SUPER_ADMIN_USER_ID} THEN ${getSuperAdminUser().name} ELSE ${users.name} END`;
}
function buildPaginationMeta(page, perPage, total, offset) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total > 0 ? offset + 1 : 0;
  const to = Math.min(offset + perPage, total);
  return { currentPage: page, perPage, total, lastPage, from, to };
}
function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
function hasTag(value, tag) {
  const parsed = parseJson(value);
  return Array.isArray(parsed) && parsed.some((item) => typeof item === "string" && item.toLowerCase() === tag.toLowerCase());
}
function matchesCustomFields(value, fields) {
  if (Object.keys(fields).length === 0) return true;
  const parsed = parseJson(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
  const record = parsed;
  return Object.entries(fields).every(([key, expected]) => String(record[key] ?? "") === expected);
}
function stripFilterFields(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => key !== "tags" && key !== "customFieldValues" && key !== "createdAt")
  );
}
async function findPostByIdRecord(id2) {
  const rows = await db.select().from(posts).where(eq(posts.id, id2)).limit(1).execute();
  const row = rows[0];
  if (!row) return void 0;
  const [authorRows, postCategoriesRows] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, row.authorId)).limit(1).execute(),
    db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(postCategories).innerJoin(categories, eq(postCategories.categoryId, categories.id)).where(eq(postCategories.postId, id2)).execute()
  ]);
  return {
    ...row,
    author: authorRows[0] ?? (row.authorId === SUPER_ADMIN_USER_ID ? (() => {
      const user = getSuperAdminUser();
      return { id: user.id, name: user.name, email: user.email };
    })() : null),
    categories: postCategoriesRows
  };
}
async function findPostBySlugRecord(slug) {
  const rows = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1).execute();
  return rows[0];
}
async function findPublishedByTypeAndSlugRecord(type, slug) {
  const rows = await db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    status: posts.status,
    excerpt: posts.excerpt,
    description: posts.description,
    tags: posts.tags,
    sections: posts.sections,
    customFieldValues: posts.customFieldValues,
    metaTitle: posts.metaTitle,
    metaDescription: posts.metaDescription,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    authorId: posts.authorId,
    publishedAt: posts.publishedAt,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    authorName: authorNameExpression()
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(and(eq(posts.type, type), eq(posts.slug, slug), publicPublishedCondition())).limit(1).execute();
  return rows[0];
}
async function listPostRecords(filters = {}) {
  const { page, perPage, offset } = clampPagination(filters);
  const conditions = [];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH$2);
  const type = filters.type?.slice(0, 64);
  const status2 = filters.status?.slice(0, 32);
  const authorId = filters.authorId?.slice(0, 128);
  const categoryId = filters.categoryId?.slice(0, 128);
  conditions.push(filters.trash ? trashedPostCondition() : activePostCondition());
  if (search2) conditions.push(like(posts.title, `%${search2}%`));
  if (type) conditions.push(eq(posts.type, type));
  if (filters.types) {
    if (filters.types.length === 0) {
      return { data: [], meta: buildPaginationMeta(page, perPage, 0, offset) };
    }
    conditions.push(inArray(posts.type, filters.types.slice(0, 100)));
  }
  if (status2) conditions.push(eq(posts.status, status2));
  if (authorId) conditions.push(eq(posts.authorId, authorId));
  if (categoryId) {
    conditions.push(sql`exists (
      select 1 from ${postCategories}
      where ${postCategories.postId} = ${posts.id}
        and ${postCategories.categoryId} = ${categoryId}
    )`);
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const totalQuery = db.select({ value: count() }).from(posts);
  const totalRows = whereClause ? await totalQuery.where(whereClause).execute() : await totalQuery.execute();
  const total = Number(totalRows[0]?.value ?? 0);
  const dataQuery = db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    status: posts.status,
    excerpt: posts.excerpt,
    description: posts.description,
    tags: posts.tags,
    sections: posts.sections,
    customFieldValues: posts.customFieldValues,
    metaTitle: posts.metaTitle,
    metaDescription: posts.metaDescription,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    authorId: posts.authorId,
    publishedAt: posts.publishedAt,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    deletedAt: posts.deletedAt,
    authorName: authorNameExpression()
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id));
  const orderColumn = filters.sortBy === "title" ? filters.sortOrder === "asc" ? posts.title : desc(posts.title) : filters.sortBy === "updatedAt" && filters.sortOrder === "asc" ? posts.updatedAt : desc(posts.updatedAt);
  const data = await (whereClause ? dataQuery.where(whereClause) : dataQuery).orderBy(orderColumn).limit(perPage).offset(offset).execute();
  return { data, meta: buildPaginationMeta(page, perPage, total, offset) };
}
async function listPublishedPostRecordsByType(type, page = 1, perPage = 10, filters = {}) {
  const clampedPage = clampPage(page);
  const clampedPerPage = clampPerPage(perPage, 10);
  const offset = (clampedPage - 1) * clampedPerPage;
  const conditions = [eq(posts.type, type), publicPublishedCondition()];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH$2);
  if (search2) {
    const pattern = `%${search2}%`;
    conditions.push(or(like(posts.title, pattern), like(posts.excerpt, pattern), like(posts.description, pattern)));
  }
  if (filters.category) {
    const categoryRows = await db.select({ id: categories.id }).from(categories).where(and(or(eq(categories.slug, filters.category), eq(categories.id, filters.category)), eq(categories.status, "published"))).limit(1).execute();
    const category = categoryRows[0];
    if (!category) return { data: [], meta: buildPaginationMeta(clampedPage, clampedPerPage, 0, offset) };
    conditions.push(sql`exists (
      select 1 from ${postCategories}
      where ${postCategories.postId} = ${posts.id}
        and ${postCategories.categoryId} = ${category.id}
    )`);
  }
  const condition = and(...conditions);
  const rows = await db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    excerpt: posts.excerpt,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    publishedAt: posts.publishedAt,
    authorName: authorNameExpression(),
    tags: posts.tags,
    customFieldValues: posts.customFieldValues,
    createdAt: posts.createdAt
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(condition).orderBy(filters.sortBy === "title" ? filters.sortOrder === "desc" ? desc(posts.title) : posts.title : filters.sortOrder === "asc" ? posts.createdAt : desc(posts.createdAt)).execute();
  const filtered = rows.filter((row) => !filters.tag || hasTag(row.tags, filters.tag)).filter((row) => matchesCustomFields(row.customFieldValues, filters.customFields ?? {}));
  const data = filtered.slice(offset, offset + clampedPerPage).map(stripFilterFields);
  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, filtered.length, offset)
  };
}
async function listPublishedArchiveFilterOptionsByType(type) {
  const categoryOptions = await db.selectDistinct({ name: categories.name, slug: categories.slug }).from(categories).innerJoin(postCategories, eq(categories.id, postCategories.categoryId)).innerJoin(posts, eq(postCategories.postId, posts.id)).where(and(eq(posts.type, type), publicPublishedCondition(), eq(categories.status, "published"))).orderBy(asc(categories.name)).limit(5e3).execute();
  const tagRows = await db.select({ tags: posts.tags }).from(posts).where(and(eq(posts.type, type), publicPublishedCondition())).limit(5e3).execute();
  const tags = [...new Set(tagRows.flatMap(({ tags: tags2 }) => {
    const value = parseJson(tags2);
    return Array.isArray(value) ? value.filter((tag) => typeof tag === "string").map((tag) => tag.trim().slice(0, 100)).filter(Boolean) : [];
  }))].sort((a, b) => a.localeCompare(b)).slice(0, 5e3);
  return { categories: categoryOptions, tags, customFields: [] };
}
async function searchPublishedPostRecords(query, page = 1, perPage = 10) {
  const clampedPage = clampPage(page);
  const clampedPerPage = clampPerPage(perPage, 10);
  const offset = (clampedPage - 1) * clampedPerPage;
  const pattern = `%${query}%`;
  const condition = and(
    publicPublishedCondition(),
    or(like(posts.title, pattern), like(posts.excerpt, pattern), like(posts.description, pattern))
  );
  const data = await db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    excerpt: posts.excerpt,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    publishedAt: posts.publishedAt,
    authorName: authorNameExpression()
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(condition).orderBy(desc(posts.publishedAt)).limit(clampedPerPage).offset(offset).execute();
  const totalRows = await db.select({ value: count() }).from(posts).where(condition).execute();
  return { data, meta: buildPaginationMeta(clampedPage, clampedPerPage, Number(totalRows[0]?.value ?? 0), offset) };
}
async function listPublishedPostRecordsByTag(tag, page = 1, perPage = 10) {
  const clampedPage = clampPage(page);
  const clampedPerPage = clampPerPage(perPage, 10);
  const offset = (clampedPage - 1) * clampedPerPage;
  const rows = await db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    excerpt: posts.excerpt,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    publishedAt: posts.publishedAt,
    authorName: authorNameExpression(),
    tags: posts.tags,
    customFieldValues: posts.customFieldValues,
    createdAt: posts.createdAt
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(publicPublishedCondition()).orderBy(desc(posts.publishedAt)).execute();
  const filtered = rows.filter((row) => hasTag(row.tags, tag));
  return {
    data: filtered.slice(offset, offset + clampedPerPage).map(stripFilterFields),
    meta: buildPaginationMeta(clampedPage, clampedPerPage, filtered.length, offset)
  };
}
async function getDashboardStatsRecord(authorId) {
  const postOwner = authorId ? eq(posts.authorId, authorId) : void 0;
  const postScope = authorId ? and(postOwner, activePostCondition()) : activePostCondition();
  const publishedCondition = authorId ? and(postOwner, publicPublishedCondition()) : publicPublishedCondition();
  const draftCondition = authorId ? and(postOwner, activePostCondition(), eq(posts.status, "draft")) : and(activePostCondition(), eq(posts.status, "draft"));
  const [totalPosts, publishedPosts, draftPosts, totalMedia, totalUsers, totalCategories] = await Promise.all([
    db.select({ value: count() }).from(posts).where(postScope).execute(),
    db.select({ value: count() }).from(posts).where(publishedCondition).execute(),
    db.select({ value: count() }).from(posts).where(draftCondition).execute(),
    authorId ? db.select({ value: count() }).from(media).where(eq(media.userId, authorId)).execute() : db.select({ value: count() }).from(media).execute(),
    authorId ? Promise.resolve([{ value: 0 }]) : db.select({ value: count() }).from(users).execute(),
    authorId ? Promise.resolve([{ value: 0 }]) : db.select({ value: count() }).from(categories).execute()
  ]);
  return {
    totalPosts: Number(totalPosts[0]?.value ?? 0),
    publishedPosts: Number(publishedPosts[0]?.value ?? 0),
    draftPosts: Number(draftPosts[0]?.value ?? 0),
    totalMedia: Number(totalMedia[0]?.value ?? 0),
    totalUsers: Number(totalUsers[0]?.value ?? 0),
    totalCategories: Number(totalCategories[0]?.value ?? 0)
  };
}
async function createPostRecord(input) {
  await db.insert(posts).values(input).execute();
  const rows = await db.select().from(posts).where(eq(posts.id, input.id)).limit(1).execute();
  return rows[0];
}
async function updatePostRecord(id2, input) {
  await db.update(posts).set(input).where(eq(posts.id, id2)).execute();
  const rows = await db.select().from(posts).where(eq(posts.id, id2)).limit(1).execute();
  return rows[0];
}
async function normalizeLegacyScheduledPostRecords(now) {
  const result = await db.update(posts).set({ status: "scheduled" }).where(and(activePostCondition(), eq(posts.status, "published"), gt(posts.publishedAt, now))).execute();
  return affectedRows(result);
}
async function listDueScheduledPostRecords(now, limit = 100) {
  return await db.select({ id: posts.id, publishedAt: posts.publishedAt }).from(posts).where(and(activePostCondition(), eq(posts.status, "scheduled"), lte(posts.publishedAt, now))).orderBy(asc(posts.publishedAt), asc(posts.id)).limit(limit).execute();
}
async function publishScheduledPostRecord(id2, now) {
  const result = await db.update(posts).set({ status: "published", updatedAt: now }).where(and(
    eq(posts.id, id2),
    activePostCondition(),
    eq(posts.status, "scheduled"),
    lte(posts.publishedAt, now)
  )).execute();
  return affectedRows(result) > 0;
}
async function trashPostRecord(id2, deletedAt) {
  const result = await db.update(posts).set({ deletedAt, updatedAt: deletedAt }).where(and(eq(posts.id, id2), activePostCondition())).execute();
  return affectedRows(result) > 0;
}
async function restorePostRecord(id2, updatedAt) {
  const result = await db.update(posts).set({ deletedAt: null, updatedAt }).where(and(eq(posts.id, id2), trashedPostCondition())).execute();
  return affectedRows(result) > 0;
}
async function permanentlyDeletePostRecord(id2) {
  const result = await db.delete(posts).where(and(eq(posts.id, id2), trashedPostCondition())).execute();
  return affectedRows(result) > 0;
}
async function syncPostCategoriesRecord(postId, categoryIds, now) {
  await db.delete(postCategories).where(eq(postCategories.postId, postId)).execute();
  for (const categoryId of categoryIds) {
    await db.insert(postCategories).values({ id: generateId(), postId, categoryId, createdAt: now }).execute();
  }
}
const STATIC_ROLE_SLUGS = [
  "super-admin",
  "admin",
  "editor",
  "author"
];
const STATIC_ROLES = [
  {
    slug: "super-admin",
    name: "Super Admin",
    description: "Full system access."
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Manages users, settings, media, menus, and all content."
  },
  {
    slug: "editor",
    name: "Editor",
    description: "Manages all content and publication."
  },
  {
    slug: "author",
    name: "Author",
    description: "Creates, edits, publishes, unpublishes, and deletes their own posts, but cannot access pages."
  }
];
const ROLE_NAMES = new Map(STATIC_ROLES.map((role) => [role.slug, role.name]));
function isStaticRole(value) {
  return typeof value === "string" && STATIC_ROLE_SLUGS.includes(value);
}
function getStaticRoleName(role) {
  if (!isStaticRole(role)) return null;
  return ROLE_NAMES.get(role) ?? null;
}
function getStaticRoleRank(role) {
  return STATIC_ROLE_SLUGS.length - STATIC_ROLE_SLUGS.indexOf(role);
}
const MAX_FILTER_TEXT_LENGTH$1 = 100;
function toSafe(user) {
  const safe = { ...user };
  Reflect.deleteProperty(safe, "password");
  return safe;
}
async function findUserByIdRecord(id2) {
  if (isSuperAdminUserId(id2)) return getSuperAdminUser();
  const rows = await db.select().from(users).where(eq(users.id, id2)).limit(1).execute();
  return rows[0];
}
async function findUserByEmailRecord(email) {
  if (isConfiguredSuperAdminEmail(email)) return getSuperAdminUser();
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1).execute();
  return rows[0];
}
async function listUsersPaginatedRecord(filters) {
  const { page, perPage, offset } = clampPagination(filters);
  const conditions = [];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH$1);
  const role = filters.role;
  if (search2) {
    conditions.push(
      or(like(users.name, `%${search2}%`), like(users.email, `%${search2}%`))
    );
  }
  if (role) {
    conditions.push(eq(users.role, role));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const totalQuery = db.select({ value: count() }).from(users);
  const totalRows = whereClause ? await totalQuery.where(whereClause).execute() : await totalQuery.execute();
  const total = totalRows[0]?.value ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  let orderColumn = desc(users.updatedAt);
  if (filters.sortBy) {
    const column = filters.sortBy === "name" ? users.name : filters.sortBy === "email" ? users.email : filters.sortBy === "createdAt" ? users.createdAt : filters.sortBy === "updatedAt" ? users.updatedAt : null;
    if (column) {
      orderColumn = filters.sortOrder === "asc" ? asc(column) : desc(column);
    }
  }
  const dataQuery = db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    emailVerified: users.emailVerified,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt
  }).from(users);
  const paged = await (whereClause ? dataQuery.where(whereClause) : dataQuery).orderBy(orderColumn).limit(perPage).offset(offset).execute();
  return {
    data: paged.map((user) => ({ ...user, roleName: getStaticRoleName(user.role) })),
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage,
      from: total > 0 ? offset + 1 : 0,
      to: Math.min(offset + perPage, total)
    }
  };
}
async function createUserRecord(input) {
  await db.insert(users).values({
    id: input.id,
    name: sanitizeText(input.name),
    email: input.email.toLowerCase().trim(),
    password: input.passwordHash,
    role: input.role,
    emailVerified: 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
  }).execute();
  return await findSafeUserByIdRecord(input.id);
}
async function updateUserRecord(id2, input) {
  const updates = { updatedAt: input.updatedAt };
  if (input.name !== void 0) updates.name = sanitizeText(input.name);
  if (input.email !== void 0) updates.email = input.email.toLowerCase().trim();
  if (input.passwordHash !== void 0) updates.password = input.passwordHash;
  if (input.role !== void 0) updates.role = input.role;
  await db.update(users).set(updates).where(eq(users.id, id2)).execute();
  return await findSafeUserByIdRecord(id2) ?? null;
}
async function deleteUserRecord(id2) {
  const result = await db.delete(users).where(eq(users.id, id2)).execute();
  return affectedRows(result) > 0;
}
async function findSafeUserByIdRecord(id2) {
  if (isSuperAdminUserId(id2)) return getSafeSuperAdminUser();
  const user = await findUserByIdRecord(id2);
  return user ? toSafe(user) : null;
}
function slugify(input) {
  let slug = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  if (slug.length > 200) {
    slug = slug.slice(0, 200).replace(/-+$/, "");
  }
  return slug;
}
async function getAllSettingsRecords() {
  return await db.select().from(settings$1).execute();
}
async function getSettingRecord(key) {
  const rows = await db.select().from(settings$1).where(eq(settings$1.key, key)).limit(1).execute();
  return rows[0];
}
async function upsertSettingRecord(key, value) {
  const now = getCurrentTimestamp();
  const existing = await getSettingRecord(key);
  if (existing) {
    await db.update(settings$1).set({ value, updatedAt: now }).where(eq(settings$1.key, key)).execute();
    return { key, value, createdAt: existing.createdAt, updatedAt: now };
  }
  await db.insert(settings$1).values({ key, value, createdAt: now, updatedAt: now }).execute();
  return { key, value, createdAt: now, updatedAt: now };
}
const SETTING_KEYS = {
  TITLE: "title",
  DESCRIPTION: "description",
  META_TITLE: "meta_title",
  META_DESCRIPTION: "meta_description",
  MAINTENANCE_MODE: "maintenance_mode",
  TIMEZONE: "timezone",
  LOGO: "logo",
  FAVICON: "favicon",
  LINKS: "links",
  OPEN_HOURS: "open_hours",
  CUSTOM_CSS: "custom_css",
  CUSTOM_JAVASCRIPT: "custom_javascript",
  TRANSLATE_COUNTRIES: "translate_countries",
  EMAIL_NOTIFICATIONS: "email_notifications"
};
function serviceSuccess(data, message) {
  return { success: true, data, message };
}
function serviceForbidden(message = "Forbidden.") {
  return { success: false, error: { code: "forbidden", message } };
}
function serviceNotFound(resource = "Resource") {
  return { success: false, error: { code: "not_found", message: `${resource} not found.` } };
}
function serviceConflict(field, message = "Already exists.") {
  return { success: false, error: { code: "conflict", message, fieldErrors: { [field]: [message] } } };
}
function serviceValidation(message) {
  return { success: false, error: { code: "validation", message } };
}
const cacheDirectory = process.env.PUBLIC_CACHE_DIR || join(process.cwd(), ".cache", "public-data");
const configuredTtlSeconds = process.env.PUBLIC_CACHE_TTL_SECONDS === void 0 ? 300 : Number(process.env.PUBLIC_CACHE_TTL_SECONDS);
const defaultTtlMs = Number.isFinite(configuredTtlSeconds) && configuredTtlSeconds >= 0 && configuredTtlSeconds <= 7 * 24 * 60 * 60 ? configuredTtlSeconds * 1e3 : 3e5;
const MAX_CACHE_FILES = 2048;
const MAX_CACHE_BYTES = 64 * 1024 * 1024;
const MAX_CACHE_ENTRY_BYTES = 1 * 1024 * 1024;
const CACHE_FILE_PATTERN = /^[a-f0-9]{64}\.json$/;
let cacheGeneration = 0;
function cachePath(key) {
  const filename = createHash("sha256").update(key).digest("hex");
  return join(cacheDirectory, `${filename}.json`);
}
function pruneCacheDirectory(requiredBytes = 0) {
  const entries = readdirSync(cacheDirectory).filter((name) => CACHE_FILE_PATTERN.test(name)).flatMap((name) => {
    try {
      const stats = statSync(join(cacheDirectory, name));
      return stats.isFile() ? [{ name, size: stats.size, mtimeMs: stats.mtimeMs }] : [];
    } catch {
      return [];
    }
  }).sort((left, right) => left.mtimeMs - right.mtimeMs);
  let totalBytes = entries.reduce((total, entry) => total + entry.size, 0);
  while (entries.length >= MAX_CACHE_FILES || totalBytes + requiredBytes > MAX_CACHE_BYTES) {
    const oldest = entries.shift();
    if (!oldest) break;
    totalBytes -= oldest.size;
    try {
      unlinkSync(join(cacheDirectory, oldest.name));
    } catch {
    }
  }
}
async function getCachedPublicData(key, loader, ttlMs = defaultTtlMs) {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) return await loader();
  const generationAtStart = cacheGeneration;
  const path = cachePath(key);
  try {
    if (existsSync(path) && lstatSync(path).isFile() && statSync(path).size <= MAX_CACHE_ENTRY_BYTES) {
      const entry = JSON.parse(readFileSync(path, "utf8"));
      if (generationAtStart === cacheGeneration && Number.isFinite(entry.expiresAt) && entry.expiresAt > Date.now()) return entry.value;
    }
  } catch {
  }
  const value = await loader();
  if (value === null || value === void 0) return value;
  if (generationAtStart !== cacheGeneration) return value;
  let serialized;
  try {
    const encoded = JSON.stringify({ expiresAt: Date.now() + ttlMs, value });
    if (typeof encoded !== "string") return value;
    serialized = encoded;
  } catch {
    return value;
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_CACHE_ENTRY_BYTES) return value;
  let tempPath;
  try {
    if (generationAtStart !== cacheGeneration) return value;
    const directory = dirname(path);
    mkdirSync(directory, { recursive: true, mode: 448 });
    chmodSync(directory, 448);
    pruneCacheDirectory(Buffer.byteLength(serialized, "utf8"));
    tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
    writeFileSync(tempPath, serialized, { encoding: "utf8", mode: 384, flag: "wx" });
    renameSync(tempPath, path);
    tempPath = void 0;
  } catch {
    if (tempPath) {
      try {
        unlinkSync(tempPath);
      } catch {
      }
    }
  }
  return value;
}
function invalidatePublicDataCache() {
  cacheGeneration += 1;
  try {
    if (!existsSync(cacheDirectory)) return;
    for (const name of readdirSync(cacheDirectory)) {
      if (!CACHE_FILE_PATTERN.test(name)) continue;
      try {
        unlinkSync(join(cacheDirectory, name));
      } catch {
      }
    }
  } catch {
  }
}
const DEFAULT_SETTINGS = {
  title: "My CMS",
  description: "A content management system",
  meta_title: "My CMS - Home",
  meta_description: "Welcome to My CMS",
  maintenance_mode: false,
  timezone: "UTC",
  logo: "",
  favicon: "",
  links: [],
  open_hours: [],
  custom_css: "",
  custom_javascript: "",
  translate_countries: [],
  email_notifications: []
};
function parseSetting(record, fallback, parser) {
  if (!record || record.value === "" || record.value === null) return fallback;
  try {
    return parser(record.value);
  } catch {
    return fallback;
  }
}
function parseJsonSetting(record, fallback) {
  return parseSetting(record, fallback, (raw) => JSON.parse(raw));
}
function parseBooleanSetting(record, fallback) {
  return parseSetting(record, fallback, (raw) => raw === "true" || raw === "1");
}
function parseStringSetting(record, fallback) {
  return parseSetting(record, fallback, (raw) => raw);
}
function parseStringArraySetting(record, fallback) {
  return parseSetting(record, fallback, (raw) => {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((value) => typeof value === "string") ? parsed : fallback;
  });
}
async function getSiteSettings() {
  return await getCachedPublicData("site-settings", async () => {
    const records = await getAllSettingsRecords();
    const map = new Map(records.map((r) => [r.key, r]));
    return {
      title: parseStringSetting(map.get(SETTING_KEYS.TITLE), DEFAULT_SETTINGS.title),
      description: parseStringSetting(map.get(SETTING_KEYS.DESCRIPTION), DEFAULT_SETTINGS.description),
      meta_title: parseStringSetting(map.get(SETTING_KEYS.META_TITLE), DEFAULT_SETTINGS.meta_title),
      meta_description: parseStringSetting(map.get(SETTING_KEYS.META_DESCRIPTION), DEFAULT_SETTINGS.meta_description),
      maintenance_mode: parseBooleanSetting(map.get(SETTING_KEYS.MAINTENANCE_MODE), DEFAULT_SETTINGS.maintenance_mode),
      timezone: parseStringSetting(map.get(SETTING_KEYS.TIMEZONE), DEFAULT_SETTINGS.timezone),
      logo: parseStringSetting(map.get(SETTING_KEYS.LOGO), DEFAULT_SETTINGS.logo),
      favicon: parseStringSetting(map.get(SETTING_KEYS.FAVICON), DEFAULT_SETTINGS.favicon),
      links: parseJsonSetting(map.get(SETTING_KEYS.LINKS), DEFAULT_SETTINGS.links),
      open_hours: parseJsonSetting(map.get(SETTING_KEYS.OPEN_HOURS), DEFAULT_SETTINGS.open_hours),
      custom_css: parseStringSetting(map.get(SETTING_KEYS.CUSTOM_CSS), DEFAULT_SETTINGS.custom_css),
      custom_javascript: parseStringSetting(map.get(SETTING_KEYS.CUSTOM_JAVASCRIPT), DEFAULT_SETTINGS.custom_javascript),
      translate_countries: parseStringArraySetting(map.get(SETTING_KEYS.TRANSLATE_COUNTRIES), DEFAULT_SETTINGS.translate_countries),
      email_notifications: parseStringArraySetting(map.get(SETTING_KEYS.EMAIL_NOTIFICATIONS), DEFAULT_SETTINGS.email_notifications)
    };
  });
}
async function updateSiteSettings(data) {
  const upserts = [];
  if (data.title !== void 0) {
    upserts.push({ key: SETTING_KEYS.TITLE, value: data.title });
  }
  if (data.description !== void 0) {
    upserts.push({ key: SETTING_KEYS.DESCRIPTION, value: data.description });
  }
  if (data.meta_title !== void 0) {
    upserts.push({ key: SETTING_KEYS.META_TITLE, value: data.meta_title });
  }
  if (data.meta_description !== void 0) {
    upserts.push({ key: SETTING_KEYS.META_DESCRIPTION, value: data.meta_description });
  }
  if (data.maintenance_mode !== void 0) {
    upserts.push({ key: SETTING_KEYS.MAINTENANCE_MODE, value: String(data.maintenance_mode) });
  }
  if (data.timezone !== void 0) {
    upserts.push({ key: SETTING_KEYS.TIMEZONE, value: data.timezone });
  }
  if (data.logo !== void 0) {
    upserts.push({ key: SETTING_KEYS.LOGO, value: data.logo });
  }
  if (data.favicon !== void 0) {
    upserts.push({ key: SETTING_KEYS.FAVICON, value: data.favicon });
  }
  if (data.links !== void 0) {
    upserts.push({ key: SETTING_KEYS.LINKS, value: JSON.stringify(data.links) });
  }
  if (data.open_hours !== void 0) {
    upserts.push({ key: SETTING_KEYS.OPEN_HOURS, value: JSON.stringify(data.open_hours) });
  }
  if (data.custom_css !== void 0) {
    upserts.push({ key: SETTING_KEYS.CUSTOM_CSS, value: data.custom_css });
  }
  if (data.custom_javascript !== void 0) {
    upserts.push({ key: SETTING_KEYS.CUSTOM_JAVASCRIPT, value: data.custom_javascript });
  }
  if (data.translate_countries !== void 0) {
    upserts.push({
      key: SETTING_KEYS.TRANSLATE_COUNTRIES,
      value: JSON.stringify(data.translate_countries)
    });
  }
  if (data.email_notifications !== void 0) {
    const emails = data.email_notifications.split(",").map((s) => s.trim()).filter(Boolean);
    upserts.push({
      key: SETTING_KEYS.EMAIL_NOTIFICATIONS,
      value: JSON.stringify(emails)
    });
  }
  if (upserts.length === 0) {
    return serviceSuccess(await getSiteSettings(), "No settings to update.");
  }
  for (const { key, value } of upserts) {
    await upsertSettingRecord(key, value);
  }
  invalidatePublicDataCache();
  return serviceSuccess(await getSiteSettings(), "Settings updated successfully.");
}
const MAX_FILTER_TEXT_LENGTH = 100;
function parseMetadata(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
function toActivityLogItem(row) {
  return {
    ...row,
    metadata: parseMetadata(row.metadata)
  };
}
async function createActivityLogRecord(input) {
  const now = input.createdAt ?? getCurrentTimestamp();
  const row = {
    id: generateId(),
    actorId: input.actorId ?? null,
    actorName: input.actorName ?? null,
    actorEmail: input.actorEmail ?? null,
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    success: input.success ? 1 : 0,
    statusCode: input.statusCode,
    createdAt: now
  };
  await db.insert(activityLogs$1).values(row).execute();
  return toActivityLogItem({ ...row, metadata: row.metadata });
}
async function listActivityLogRecords(filters = {}) {
  const { page, perPage, offset } = clampPagination(filters);
  const conditions = [];
  const search2 = filters.search?.trim().slice(0, MAX_FILTER_TEXT_LENGTH);
  if (search2) {
    const pattern = `%${search2}%`;
    conditions.push(
      or(
        like(activityLogs$1.actorName, pattern),
        like(activityLogs$1.actorEmail, pattern),
        like(activityLogs$1.action, pattern),
        like(activityLogs$1.resource, pattern),
        like(activityLogs$1.resourceId, pattern)
      )
    );
  }
  if (filters.action) conditions.push(eq(activityLogs$1.action, filters.action));
  if (filters.resource) conditions.push(eq(activityLogs$1.resource, filters.resource));
  if (filters.success !== void 0) conditions.push(eq(activityLogs$1.success, filters.success ? 1 : 0));
  if (filters.from !== void 0) conditions.push(gte(activityLogs$1.createdAt, filters.from));
  if (filters.to !== void 0) conditions.push(lte(activityLogs$1.createdAt, filters.to));
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const totalQuery = db.select({ value: count() }).from(activityLogs$1);
  const totalRows = whereClause ? await totalQuery.where(whereClause).execute() : await totalQuery.execute();
  const total = Number(totalRows[0]?.value ?? 0);
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const dataQuery = db.select().from(activityLogs$1);
  const rows = await (whereClause ? dataQuery.where(whereClause) : dataQuery).orderBy(desc(activityLogs$1.createdAt), desc(activityLogs$1.id)).limit(perPage).offset(offset).execute();
  return {
    data: rows.map(toActivityLogItem),
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage,
      from: total > 0 ? offset + 1 : 0,
      to: Math.min(offset + perPage, total)
    }
  };
}
async function deleteActivityLogsBefore(timestamp2) {
  const result = await db.delete(activityLogs$1).where(lt(activityLogs$1.createdAt, timestamp2)).execute();
  return affectedRows(result);
}
function getPathSegments(pathname) {
  const prefix = pathname.startsWith("/api/admin/") ? "/api/admin/" : pathname.startsWith("/admin/") ? "/admin/" : null;
  if (!prefix) return null;
  return pathname.slice(prefix.length).split("/").filter(Boolean);
}
function collectionDescriptor(resource, segments, method) {
  const second = segments[1];
  const third = segments[2];
  if (second === "bulk") {
    if (!third || method !== "POST") return null;
    const action = third === "permanent-delete" ? "permanent_delete" : third;
    return { resource, action: `bulk_${action}`, resourceId: null, authenticationEvent: false };
  }
  if (resource === "media" && second === "upload" && method === "POST") {
    return { resource, action: "upload", resourceId: null, authenticationEvent: false };
  }
  if (resource === "menus" && second === "reorder" && method === "POST") {
    return { resource, action: "reorder", resourceId: null, authenticationEvent: false };
  }
  if (!second && method === "POST") {
    return { resource, action: "create", resourceId: null, authenticationEvent: false };
  }
  if (!second) return null;
  if (third === "duplicate" && method === "POST") {
    return { resource, action: "duplicate", resourceId: second, authenticationEvent: false };
  }
  if (third === "restore" && method === "POST") {
    return { resource, action: "restore", resourceId: second, authenticationEvent: false };
  }
  if (third === "permanent-delete" && method === "DELETE") {
    return { resource, action: "permanent_delete", resourceId: second, authenticationEvent: false };
  }
  if (resource === "users" && third === "2fa" && segments[3] === "disable" && method === "POST") {
    return { resource, action: "disable_2fa", resourceId: second, authenticationEvent: false };
  }
  if (method === "PUT") return { resource, action: "update", resourceId: second, authenticationEvent: false };
  if (method === "DELETE") return { resource, action: "delete", resourceId: second, authenticationEvent: false };
  return null;
}
function describeActivityRequest(pathname, method) {
  const segments = getPathSegments(pathname);
  if (!segments || segments.length === 0) return null;
  const [resource, second] = segments;
  if (resource === "auth") {
    if (second === "login" && method === "POST") return { resource, action: "login", resourceId: null, authenticationEvent: true };
    if (second === "logout" && method === "POST") return { resource, action: "logout", resourceId: null, authenticationEvent: true };
    if (second === "refresh" && method === "POST") return null;
    if (second === "profile" && method === "PUT") return { resource: "profile", action: "update", resourceId: null, authenticationEvent: false };
    if (second === "2fa" && segments[2] === "verify" && method === "POST") return { resource, action: "login_2fa", resourceId: null, authenticationEvent: true };
    if (second === "2fa" && (segments[2] === "setup" || segments[2] === "enable" || segments[2] === "disable") && method === "POST") {
      return { resource, action: `${segments[2]}_2fa`, resourceId: null, authenticationEvent: false };
    }
    return null;
  }
  if (resource === "settings" && !second && method === "PUT") {
    return { resource, action: "update", resourceId: null, authenticationEvent: false };
  }
  if (resource === "posts") return collectionDescriptor("post", segments, method);
  if (resource === "categories") return collectionDescriptor("category", segments, method);
  if (resource === "users") return collectionDescriptor("user", segments, method);
  if (resource === "media") return collectionDescriptor("media", segments, method);
  if (resource === "menus") return collectionDescriptor("menu", segments, method);
  return null;
}
const TECHNICAL_CHANGE_KEYS = /* @__PURE__ */ new Set(["id", "createdAt", "updatedAt", "authorId", "author", "categories"]);
const SENSITIVE_KEY_PATTERN = /(password|token|secret|authorization|cookie|otp|code)/i;
const CHANGE_ACTIONS = /* @__PURE__ */ new Set([
  "create",
  "update",
  "delete",
  "restore",
  "permanent_delete",
  "duplicate",
  "upload",
  "reorder",
  "publish",
  "unpublish",
  "bulk_create",
  "bulk_update",
  "bulk_delete",
  "bulk_restore",
  "bulk_permanent_delete",
  "bulk_duplicate",
  "bulk_publish",
  "bulk_unpublish",
  "bulk_status"
]);
const STATUS_ONLY_BULK_ACTIONS = /* @__PURE__ */ new Set(["bulk_status"]);
const MAX_ACTIVITY_STRING_LENGTH = 2e3;
const MAX_ACTIVITY_OBJECT_KEYS = 100;
const MAX_ACTIVITY_ARRAY_ITEMS = 50;
const MAX_ACTIVITY_VALUE_DEPTH = 4;
function isSensitiveActivityKey(key) {
  return SENSITIVE_KEY_PATTERN.test(key);
}
function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function toActivityValue(value, key = "", depth = 0) {
  if (isSensitiveActivityKey(key)) return "[redacted]";
  if (value === null || value === void 0) return null;
  if (typeof value === "string") return value.length > MAX_ACTIVITY_STRING_LENGTH ? `${value.slice(0, MAX_ACTIVITY_STRING_LENGTH)}…` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date) return value.toISOString();
  if (depth >= MAX_ACTIVITY_VALUE_DEPTH) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, MAX_ACTIVITY_ARRAY_ITEMS).map((item) => toActivityValue(item, key, depth + 1));
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).slice(0, MAX_ACTIVITY_OBJECT_KEYS).map(([entryKey, entryValue]) => [entryKey, toActivityValue(entryValue, entryKey, depth + 1)])
    );
  }
  return String(value);
}
function asActivitySnapshot(value) {
  return isObject(value) ? value : null;
}
function bulkActivityIds(value) {
  if (!isObject(value) || !Array.isArray(value.ids)) return [];
  return value.ids.filter((id2) => typeof id2 === "string").slice(0, MAX_ACTIVITY_ARRAY_ITEMS);
}
async function findActivityResourceSnapshot(resource, resourceId) {
  if (resource === "post") return asActivitySnapshot(await findPostByIdRecord(resourceId));
  if (resource === "category") return asActivitySnapshot(await findCategoryByIdRecord(resourceId));
  if (resource === "media") return asActivitySnapshot(await findMediaByIdRecord(resourceId));
  if (resource === "menu") return asActivitySnapshot(await findMenuById(resourceId));
  if (resource === "user" || resource === "profile") return asActivitySnapshot(await findSafeUserByIdRecord(resourceId));
  return null;
}
async function captureActivitySnapshot(input) {
  const descriptor = describeActivityRequest(input.pathname, input.method);
  if (!descriptor) return null;
  try {
    if (descriptor.resource === "settings") {
      return asActivitySnapshot(await getSiteSettings());
    }
    if (descriptor.action.startsWith("bulk_")) {
      const ids = bulkActivityIds(input.requestBody);
      if (ids.length === 0) return null;
      return await Promise.all(ids.map(async (id2) => ({
        id: id2,
        value: await findActivityResourceSnapshot(descriptor.resource, id2).catch(() => null)
      })));
    }
    const resourceId = descriptor.resourceId ?? (descriptor.resource === "profile" ? input.actorId ?? null : null);
    if (!resourceId) return null;
    return await findActivityResourceSnapshot(descriptor.resource, resourceId);
  } catch {
  }
  return null;
}
async function responseBody(response) {
  try {
    const body = await response.clone().json();
    return isObject(body) ? body : null;
  } catch {
    return null;
  }
}
function responseActorId(body) {
  if (!body || !isObject(body.data)) return null;
  const user = body.data.user;
  if (!isObject(user) || typeof user.id !== "string") return null;
  return user.id;
}
function valuesEqual(left, right) {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}
function isBulkActivitySnapshot(value) {
  return Array.isArray(value) && value.every((item) => isObject(item) && typeof item.id === "string" && Object.prototype.hasOwnProperty.call(item, "value"));
}
function bulkSnapshotRecords(value) {
  if (!isBulkActivitySnapshot(value)) return [];
  return value.map((item) => ({ id: item.id, data: item.value }));
}
function statusOnlyBulkRecords(records) {
  return records.flatMap((record) => {
    if (!isObject(record) || typeof record.id !== "string") return [];
    const data = isObject(record.data) ? record.data : null;
    return [{ id: record.id, data: { status: data?.status ?? null } }];
  });
}
function buildBulkActivityChanges(before, after, requestBody, action, responseBody2) {
  const changes = {};
  const ids = bulkActivityIds(requestBody);
  if (ids.length > 0) {
    changes.ids = { before: null, after: toActivityValue(ids, "ids") };
  }
  const rawBeforeRecords = bulkSnapshotRecords(before);
  const rawAfterRecords = action === "bulk_duplicate" && responseBody2 && Array.isArray(responseBody2.data) ? responseBody2.data : bulkSnapshotRecords(after);
  const beforeRecords = STATUS_ONLY_BULK_ACTIONS.has(action) ? statusOnlyBulkRecords(rawBeforeRecords) : rawBeforeRecords;
  const afterRecords = STATUS_ONLY_BULK_ACTIONS.has(action) && Array.isArray(rawAfterRecords) ? statusOnlyBulkRecords(rawAfterRecords) : rawAfterRecords;
  if (beforeRecords.length > 0 || afterRecords.length > 0) {
    const beforeValue = toActivityValue(beforeRecords, "records");
    const afterValue = toActivityValue(afterRecords, "records");
    if (!valuesEqual(beforeValue, afterValue)) {
      changes.records = { before: beforeValue, after: afterValue };
    }
  }
  return Object.keys(changes).length > 0 ? changes : void 0;
}
function buildActivityChanges(before, after, requestBody, action, responseBody2 = null) {
  if (!CHANGE_ACTIONS.has(action)) return void 0;
  if (action.startsWith("bulk_")) {
    return buildBulkActivityChanges(before, after, requestBody, action, responseBody2);
  }
  const beforeRecord = isObject(before) ? before : null;
  const afterRecord = asActivitySnapshot(after);
  const submittedRecord = asActivitySnapshot(requestBody);
  const keys = /* @__PURE__ */ new Set([
    ...Object.keys(beforeRecord ?? {}),
    ...Object.keys(afterRecord ?? {}),
    ...Object.keys(submittedRecord ?? {})
  ]);
  const changes = {};
  for (const key of keys) {
    if (TECHNICAL_CHANGE_KEYS.has(key)) continue;
    const hasBefore = Boolean(beforeRecord && Object.prototype.hasOwnProperty.call(beforeRecord, key));
    const hasAfter = Boolean(afterRecord && Object.prototype.hasOwnProperty.call(afterRecord, key));
    const hasSubmitted = Boolean(submittedRecord && Object.prototype.hasOwnProperty.call(submittedRecord, key));
    if (isSensitiveActivityKey(key) && hasSubmitted) {
      changes[key] = { before: "[redacted]", after: "[redacted]" };
      continue;
    }
    const beforeValue = toActivityValue(hasBefore ? beforeRecord[key] : null, key);
    const afterValue = toActivityValue(
      hasAfter ? afterRecord[key] : hasSubmitted ? submittedRecord[key] : null,
      key
    );
    if (valuesEqual(beforeValue, afterValue)) continue;
    changes[key] = { before: beforeValue, after: afterValue };
  }
  return Object.keys(changes).length > 0 ? changes : void 0;
}
function requestMetadata(pathname, method, descriptor, response, changes) {
  return {
    path: pathname,
    method,
    statusCode: response.status,
    ...descriptor.resourceId ? { resourceId: descriptor.resourceId } : {},
    ...changes ? { changes } : {}
  };
}
async function recordActivityRequest(input) {
  const descriptor = describeActivityRequest(input.pathname, input.method);
  if (!descriptor) return;
  const success = input.response.status >= 200 && input.response.status < 400;
  if (!descriptor.authenticationEvent && !success) return;
  const body = await responseBody(input.response);
  const actorId = input.actorId ?? responseActorId(body);
  const actor = actorId ? await findSafeUserByIdRecord(actorId).catch(() => null) : null;
  const userAgent = input.request.headers.get("user-agent")?.slice(0, 1024) ?? null;
  const responseData = body && "data" in body ? body.data : null;
  const after = descriptor.action.startsWith("bulk_") ? await captureActivitySnapshot({
    pathname: input.pathname,
    method: input.method,
    actorId,
    requestBody: input.requestBody
  }) : responseData;
  const changes = buildActivityChanges(
    input.before ?? null,
    after,
    input.requestBody,
    descriptor.action,
    body
  );
  await createActivityLogRecord({
    actorId,
    actorName: actor?.name ?? null,
    actorEmail: actor?.email ?? null,
    action: descriptor.action,
    resource: descriptor.resource,
    resourceId: descriptor.resourceId,
    metadata: requestMetadata(input.pathname, input.method, descriptor, input.response, changes),
    ipAddress: input.ipAddress ?? null,
    userAgent,
    success,
    statusCode: input.response.status
  }).catch((error) => {
    console.error("Activity log write failed", error);
  });
}
async function listActivityLogs(filters = {}) {
  return listActivityLogRecords(filters);
}
async function purgeExpiredActivityLogs() {
  return deleteActivityLogsBefore(getActivityLogRetentionCutoff());
}
const CONTENT_TYPE_REGISTRY_PATH = "src/components/web/content-type-templates/registry.json";
const BUILT_IN_CONTENT_TYPES = [
  { slug: "post", name: "post" },
  { slug: "page", name: "page" }
];
function getRegistryPath() {
  const configuredPath = process.env.CONTENT_TYPE_REGISTRY_PATH?.trim() || process.env.BEAVER_CONTENT_TYPE_REGISTRY_PATH?.trim();
  if (configuredPath) return resolve(process.cwd(), configuredPath);
  const hostRegistryPath = resolve(process.cwd(), CONTENT_TYPE_REGISTRY_PATH);
  return existsSync(hostRegistryPath) ? hostRegistryPath : void 0;
}
function loadRegistryContentTypes() {
  const filePath = getRegistryPath();
  if (!filePath || !existsSync(filePath)) return [];
  const registry = JSON.parse(readFileSync(filePath, "utf8"));
  if (!Array.isArray(registry.contentTypes)) return [];
  return registry.contentTypes.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry;
    const slug = typeof record.slug === "string" ? record.slug.trim() : "";
    if (!slug) return [];
    const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : slug;
    return [{ slug, name }];
  });
}
function getContentTypes() {
  const seen = /* @__PURE__ */ new Set();
  return [...BUILT_IN_CONTENT_TYPES, ...loadRegistryContentTypes()].filter((contentType) => {
    if (seen.has(contentType.slug)) return false;
    seen.add(contentType.slug);
    return true;
  });
}
function contentTypePermissions(contentType) {
  const { name, slug } = contentType;
  return [
    { slug: `content.${slug}.view`, name: `View ${name} content`, group: slug },
    { slug: `content.${slug}.create`, name: `Create ${name} content`, group: slug },
    { slug: `content.${slug}.edit`, name: `Edit any ${name} content`, group: slug },
    { slug: `content.${slug}.edit-own`, name: `Edit own ${name} content`, group: slug },
    { slug: `content.${slug}.delete`, name: `Delete ${name} content`, group: slug },
    { slug: `content.${slug}.delete-own`, name: `Delete own ${name} content`, group: slug },
    { slug: `content.${slug}.publish`, name: `Publish ${name} content`, group: slug },
    { slug: `content.${slug}.publish-own`, name: `Publish own ${name} content`, group: slug },
    { slug: `content.${slug}.unpublish`, name: `Unpublish ${name} content`, group: slug },
    { slug: `content.${slug}.unpublish-own`, name: `Unpublish own ${name} content`, group: slug },
    { slug: `category.${slug}.view`, name: `View ${name} categories`, group: slug },
    { slug: `category.${slug}.manage`, name: `Manage ${name} categories`, group: slug },
    { slug: `category.${slug}.publish`, name: `Publish ${name} categories`, group: slug },
    { slug: `category.${slug}.unpublish`, name: `Unpublish ${name} categories`, group: slug }
  ];
}
function getPermissionDefinitions() {
  return [
    ...getContentTypes().flatMap(contentTypePermissions),
    { slug: "dashboard.view", name: "View dashboard statistics", group: "dashboard" },
    { slug: "media.view", name: "View media library", group: "media" },
    { slug: "media.upload", name: "Upload new media", group: "media" },
    { slug: "media.edit", name: "Edit media metadata", group: "media" },
    { slug: "media.delete", name: "Delete media files", group: "media" },
    { slug: "menus.view", name: "View menus", group: "menus" },
    { slug: "menus.create", name: "Create menus", group: "menus" },
    { slug: "menus.edit", name: "Edit menus", group: "menus" },
    { slug: "menus.manage", name: "Manage menus", group: "menus" },
    { slug: "menus.delete", name: "Delete menus", group: "menus" },
    { slug: "menus.publish", name: "Publish menus", group: "menus" },
    { slug: "menus.unpublish", name: "Unpublish menus", group: "menus" },
    { slug: "users.view", name: "View users list", group: "users" },
    { slug: "users.create", name: "Create new users", group: "users" },
    { slug: "users.edit", name: "Edit user profiles", group: "users" },
    { slug: "users.delete", name: "Delete users", group: "users" },
    { slug: "users.manage", name: "Manage users and credentials", group: "users" },
    { slug: "activity-log.view", name: "View activity log", group: "activity-log" },
    { slug: "settings.manage", name: "Manage system settings", group: "settings" }
  ];
}
function isContentPermissionSlug(slug) {
  return slug.startsWith("content.") || slug.startsWith("category.");
}
function permissionSlugsForRole(role) {
  const definitions = getPermissionDefinitions();
  if (role === "super-admin" || role === "admin") {
    return definitions.map((permission) => permission.slug);
  }
  if (role === "editor") {
    return definitions.filter(
      (permission) => isContentPermissionSlug(permission.slug) || permission.slug === "dashboard.view" || permission.slug === "media.view" || permission.slug === "media.upload"
    ).map((permission) => permission.slug);
  }
  return definitions.filter((permission) => {
    if (permission.slug === "media.view" || permission.slug === "media.upload") return true;
    if (permission.slug === "dashboard.view") return true;
    if (permission.slug.startsWith("content.page.") || permission.slug.startsWith("category.page.")) return false;
    if (permission.slug.startsWith("category.")) {
      return permission.slug.endsWith(".view");
    }
    if (!permission.slug.startsWith("content.")) return false;
    const action = permission.slug.slice(permission.slug.lastIndexOf(".") + 1);
    return action === "view" || action === "create" || action === "edit-own" || action === "delete-own" || action === "publish-own" || action === "unpublish-own";
  }).map((permission) => permission.slug);
}
async function getUserRole(userId) {
  const user = await findUserByIdRecord(userId);
  return user && isStaticRole(user.role) ? user.role : null;
}
async function getUserPermissions(userId) {
  const role = await getUserRole(userId);
  return role ? permissionSlugsForRole(role) : [];
}
async function can(userId, permission) {
  const role = await getUserRole(userId);
  if (role === "super-admin") return true;
  return role ? permissionSlugsForRole(role).includes(permission) : false;
}
async function canAny(userId, permissions) {
  const role = await getUserRole(userId);
  if (role === "super-admin") return true;
  if (!role) return false;
  const userPermissions = permissionSlugsForRole(role);
  return permissions.some((permission) => userPermissions.includes(permission));
}
const ADMIN_ACCESS_COOKIE = "admin_access_token";
const ADMIN_REFRESH_COOKIE = "admin_refresh_token";
const ADMIN_2FA_CHALLENGE_COOKIE = "admin_2fa_challenge";
const secure = process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test";
function buildAdminAccessCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15
  };
}
function buildAdminRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}
function buildAdminTwoFactorChallengeCookieOptions() {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/admin/auth",
    maxAge: 5 * 60
  };
}
function readAdminAccessToken(cookies) {
  return cookies.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
}
function readAdminRefreshToken(cookies) {
  return cookies.get(ADMIN_REFRESH_COOKIE)?.value ?? null;
}
function readAdminTwoFactorChallenge(cookies) {
  return cookies.get(ADMIN_2FA_CHALLENGE_COOKIE)?.value ?? null;
}
function clearAdminSessionCookies(cookies) {
  cookies.set(ADMIN_ACCESS_COOKIE, "", { ...buildAdminAccessCookieOptions(), maxAge: 0 });
  cookies.set(ADMIN_REFRESH_COOKIE, "", { ...buildAdminRefreshCookieOptions(), maxAge: 0 });
}
function clearAdminTwoFactorChallengeCookie(cookies) {
  cookies.set(ADMIN_2FA_CHALLENGE_COOKIE, "", { ...buildAdminTwoFactorChallengeCookieOptions(), maxAge: 0 });
}
const encoder = new TextEncoder();
function getJwtSecret(name) {
  const value = process.env[name];
  if (!isTestEnvironment()) {
    assertSecureSecrets();
    return encoder.encode(value);
  }
  if (value && value.length >= 32) return encoder.encode(value);
  if (process.env.SESSION_SECRET) {
    return encoder.encode(
      createHash("sha256").update(`${name}:${process.env.SESSION_SECRET}`).digest("base64url")
    );
  }
  return crypto.getRandomValues(new Uint8Array(32));
}
let accessSecret;
let refreshSecret;
function getAccessSecret() {
  return accessSecret ??= getJwtSecret("ADMIN_JWT_ACCESS_SECRET");
}
function getRefreshSecret() {
  return refreshSecret ??= getJwtSecret("ADMIN_JWT_REFRESH_SECRET");
}
async function signAccessToken(claims) {
  return new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setSubject(claims.sub).setIssuedAt().setExpirationTime("15m").sign(getAccessSecret());
}
async function signRefreshToken(claims) {
  return new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setSubject(claims.sub).setIssuedAt().setExpirationTime("30d").sign(getRefreshSecret());
}
async function signTwoFactorChallengeToken(claims) {
  return new SignJWT({ ...claims, purpose: "admin-2fa" }).setProtectedHeader({ alg: "HS256" }).setSubject(claims.sub).setIssuedAt().setExpirationTime("5m").sign(getAccessSecret());
}
async function verifyAccessToken(token) {
  const result = await jwtVerify(token, getAccessSecret(), { algorithms: ["HS256"] });
  return result.payload;
}
async function verifyRefreshToken(token) {
  const result = await jwtVerify(token, getRefreshSecret(), { algorithms: ["HS256"] });
  return result.payload;
}
async function verifyTwoFactorChallengeToken(token) {
  const result = await jwtVerify(token, getAccessSecret(), { algorithms: ["HS256"] });
  if (result.payload.purpose !== "admin-2fa") throw new Error("Invalid two-factor challenge.");
  return result.payload;
}
const REFRESH_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const LEGACY_MILLISECONDS_THRESHOLD = 1e10;
function normalizeExpiry(expiresAt) {
  return expiresAt >= LEGACY_MILLISECONDS_THRESHOLD ? Math.floor(expiresAt / 1e3) : expiresAt;
}
function activeExpiryCondition(now) {
  return or(
    gt(adminRefreshSessions.expiresAt, now * 1e3),
    and(
      gt(adminRefreshSessions.expiresAt, now),
      lt(adminRefreshSessions.expiresAt, LEGACY_MILLISECONDS_THRESHOLD)
    )
  );
}
function getRefreshSessionExpiry() {
  return getCurrentTimestamp() + REFRESH_SESSION_TTL_SECONDS;
}
async function saveRefreshSession(sessionId, userId, expiresAt) {
  await db.insert(adminRefreshSessions).values({
    id: sessionId,
    userId,
    expiresAt: normalizeExpiry(expiresAt),
    createdAt: getCurrentTimestamp()
  }).execute();
}
async function deleteRefreshSession(sessionId) {
  await db.delete(adminRefreshSessions).where(eq(adminRefreshSessions.id, sessionId)).execute();
}
async function deleteRefreshSessionsForUser(userId) {
  await db.delete(adminRefreshSessions).where(eq(adminRefreshSessions.userId, userId)).execute();
}
async function findActiveRefreshSession(sessionId) {
  const now = getCurrentTimestamp();
  const rows = await db.select({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt }).from(adminRefreshSessions).where(and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now))).limit(1).execute();
  const row = rows[0];
  return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null;
}
async function consumeRefreshSession(sessionId) {
  const now = getCurrentTimestamp();
  const condition = and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now));
  if (databaseConfig.connection !== "mysql") {
    const rows = await db.delete(adminRefreshSessions).where(condition).returning({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt }).execute();
    const row = rows[0];
    return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null;
  }
  return await db.transaction(async (tx) => {
    const rows = await tx.select({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt }).from(adminRefreshSessions).where(condition).limit(1).execute();
    const row = rows[0];
    if (!row) return null;
    await tx.delete(adminRefreshSessions).where(condition).execute();
    return { ...row, expiresAt: normalizeExpiry(row.expiresAt) };
  });
}
async function findTwoFactorRecord(userId) {
  const rows = await db.select().from(adminTwoFactor).where(eq(adminTwoFactor.userId, userId)).limit(1).execute();
  return rows[0];
}
async function saveTwoFactorSetup(userId, secret, now) {
  const existing = await findTwoFactorRecord(userId);
  if (existing) {
    await db.update(adminTwoFactor).set({ secret, enabled: 0, updatedAt: now }).where(eq(adminTwoFactor.userId, userId)).execute();
    return;
  }
  await db.insert(adminTwoFactor).values({
    userId,
    secret,
    enabled: 0,
    createdAt: now,
    updatedAt: now
  }).execute();
}
async function enableTwoFactor(userId, now) {
  await db.update(adminTwoFactor).set({ enabled: 1, updatedAt: now }).where(eq(adminTwoFactor.userId, userId)).execute();
}
async function deleteTwoFactorRecord(userId) {
  await db.delete(adminTwoFactor).where(eq(adminTwoFactor.userId, userId)).execute();
}
const TWO_FACTOR_ISSUER$1 = "Beaver";
const ENCRYPTION_PREFIX = "v1";
const TOTP_EPOCH_TOLERANCE_SECONDS = 30;
function encryptionKey() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    if (isTestEnvironment()) {
      return createHash("sha256").update("beaver-test-two-factor").digest();
    }
    throw new Error("SESSION_SECRET must be configured before using two-factor authentication.");
  }
  if (!isTestEnvironment()) assertSecureSecrets();
  return createHash("sha256").update(`beaver-two-factor:${sessionSecret}`).digest();
}
function encryptSecret(secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [ENCRYPTION_PREFIX, iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}
function decryptSecret(value) {
  const [prefix, ivValue, tagValue, encryptedValue] = value.split(".");
  if (prefix !== ENCRYPTION_PREFIX || !ivValue || !tagValue || !encryptedValue) {
    throw new Error("Invalid two-factor secret format.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final()
  ]).toString("utf8");
}
function normalizeCode(code) {
  return code.trim();
}
async function verifyStoredCode(userId, code, requireEnabled = true) {
  const record = await findTwoFactorRecord(userId);
  if (!record || requireEnabled && record.enabled !== 1) return false;
  try {
    const result = await verify$1({
      secret: decryptSecret(record.secret),
      token: normalizeCode(code),
      epochTolerance: TOTP_EPOCH_TOLERANCE_SECONDS
    });
    return result.valid;
  } catch {
    return false;
  }
}
async function verifySuperAdminCode(code) {
  const config = getSuperAdminTwoFactorConfig();
  if (!config.enabled || !config.secret) return false;
  try {
    const result = await verify$1({
      secret: config.secret,
      token: normalizeCode(code),
      epochTolerance: TOTP_EPOCH_TOLERANCE_SECONDS
    });
    return result.valid;
  } catch {
    return false;
  }
}
async function isTwoFactorEnabled(userId) {
  if (isSuperAdminUserId(userId)) {
    return getSuperAdminTwoFactorConfig().enabled;
  }
  const record = await findTwoFactorRecord(userId);
  return record?.enabled === 1;
}
async function getTwoFactorStatus(userId) {
  return { enabled: await isTwoFactorEnabled(userId) };
}
async function beginTwoFactorSetup(userId) {
  if (isSuperAdminUserId(userId)) {
    const config = getSuperAdminTwoFactorConfig();
    if (config.enabled) {
      return serviceConflict("twoFactor", "Super Admin two-factor authentication is already enabled.");
    }
    return serviceValidation("Configure ADMIN_2FA_ENABLED=true and ADMIN_2FA_SECRET, then restart the application.");
  }
  const user = await findSafeUserByIdRecord(userId);
  if (!user) return serviceNotFound("User");
  const existing = await findTwoFactorRecord(userId);
  if (existing?.enabled === 1) {
    return serviceConflict("twoFactor", "Two-factor authentication is already enabled.");
  }
  const secret = generateSecret();
  await saveTwoFactorSetup(userId, encryptSecret(secret), getCurrentTimestamp());
  return serviceSuccess({
    secret,
    otpauthUrl: generateURI({
      issuer: TWO_FACTOR_ISSUER$1,
      label: user.email,
      secret
    })
  }, "Two-factor setup started.");
}
async function confirmTwoFactorSetup(userId, code) {
  if (isSuperAdminUserId(userId)) {
    return serviceValidation("Super Admin two-factor authentication is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET.");
  }
  const record = await findTwoFactorRecord(userId);
  if (!record) return serviceValidation("Start two-factor setup before enabling it.");
  if (record.enabled === 1) return serviceConflict("twoFactor", "Two-factor authentication is already enabled.");
  if (!await verifyStoredCode(userId, code, false)) {
    return serviceValidation("Invalid authenticator code.");
  }
  await enableTwoFactor(userId, getCurrentTimestamp());
  await deleteRefreshSessionsForUser(userId);
  return serviceSuccess({ enabled: true }, "Two-factor authentication enabled.");
}
async function verifyCurrentPassword(userId, password) {
  if (isSuperAdminUserId(userId)) {
    const credentials = getAdminCredentials();
    return Boolean(await authenticateSuperAdmin(credentials.email, password));
  }
  const user = await findUserByIdRecord(userId);
  return user ? verifyPassword(password, user.password) : false;
}
async function disableTwoFactor(userId, password, code) {
  if (isSuperAdminUserId(userId)) {
    return serviceValidation("Super Admin two-factor authentication is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET.");
  }
  const record = await findTwoFactorRecord(userId);
  if (!record || record.enabled !== 1) {
    return serviceValidation("Two-factor authentication is not enabled.");
  }
  if (!await verifyCurrentPassword(userId, password)) {
    return serviceValidation("Current password is invalid.");
  }
  if (!await verifyStoredCode(userId, code)) {
    return serviceValidation("Invalid authenticator code.");
  }
  await deleteTwoFactorRecord(userId);
  await deleteRefreshSessionsForUser(userId);
  return serviceSuccess({ enabled: false }, "Two-factor authentication disabled.");
}
async function verifyTwoFactorCode(userId, code) {
  if (isSuperAdminUserId(userId)) return verifySuperAdminCode(code);
  return verifyStoredCode(userId, code);
}
async function getAdminSession(cookies) {
  const access = readAdminAccessToken(cookies);
  if (!access) return null;
  try {
    const payload = await verifyAccessToken(access);
    if (typeof payload.sessionId !== "string") return null;
    if (isSuperAdminUserId(payload.sub)) {
      const user2 = getSafeSuperAdminUser();
      if (payload.email !== user2.email || payload.role !== "super-admin") return null;
      const twoFactorEnabled2 = await isTwoFactorEnabled(user2.id);
      if (twoFactorEnabled2 && payload.twoFactorVerified !== true) return null;
      return {
        user: user2,
        permissions: await getUserPermissions(user2.id),
        twoFactorEnabled: twoFactorEnabled2
      };
    }
    const stored = await findActiveRefreshSession(payload.sessionId);
    if (!stored || stored.userId !== payload.sub) return null;
    const user = await findSafeUserByIdRecord(payload.sub);
    if (!user) return null;
    const twoFactorEnabled = await isTwoFactorEnabled(user.id);
    if (twoFactorEnabled && payload.twoFactorVerified !== true) return null;
    return {
      user,
      permissions: await getUserPermissions(user.id),
      twoFactorEnabled
    };
  } catch {
    return null;
  }
}
async function refreshAdminSession(cookies) {
  const refresh2 = readAdminRefreshToken(cookies);
  if (!refresh2) return null;
  try {
    const payload = await verifyRefreshToken(refresh2);
    if (isSuperAdminUserId(payload.sub)) {
      const user2 = getSafeSuperAdminUser();
      if (payload.email !== void 0 && payload.email !== user2.email) return null;
      const twoFactorEnabled2 = await isTwoFactorEnabled(user2.id);
      if (twoFactorEnabled2 && payload.twoFactorVerified !== true) return null;
      const permissions2 = await getUserPermissions(user2.id);
      const nextSessionId2 = generateId();
      const nextAccess2 = await signAccessToken({
        sub: user2.id,
        sessionId: nextSessionId2,
        email: user2.email,
        role: user2.role,
        permissions: permissions2,
        twoFactorVerified: payload.twoFactorVerified === true
      });
      const nextRefresh2 = await signRefreshToken({
        sub: user2.id,
        sessionId: nextSessionId2,
        email: user2.email,
        twoFactorVerified: payload.twoFactorVerified === true
      });
      cookies.set(ADMIN_ACCESS_COOKIE, nextAccess2, buildAdminAccessCookieOptions());
      cookies.set(ADMIN_REFRESH_COOKIE, nextRefresh2, buildAdminRefreshCookieOptions());
      return { user: user2, permissions: permissions2, twoFactorEnabled: twoFactorEnabled2 };
    }
    const stored = await consumeRefreshSession(payload.sessionId);
    if (!stored || stored.userId !== payload.sub) return null;
    const user = await findSafeUserByIdRecord(payload.sub);
    if (!user) return null;
    const twoFactorEnabled = await isTwoFactorEnabled(user.id);
    if (twoFactorEnabled && payload.twoFactorVerified !== true) return null;
    const permissions = await getUserPermissions(user.id);
    const nextSessionId = generateId();
    const nextAccess = await signAccessToken({
      sub: user.id,
      sessionId: nextSessionId,
      email: user.email,
      role: user.role,
      permissions,
      twoFactorVerified: payload.twoFactorVerified === true
    });
    const nextRefresh = await signRefreshToken({
      sub: user.id,
      sessionId: nextSessionId,
      email: user.email,
      twoFactorVerified: payload.twoFactorVerified === true
    });
    await saveRefreshSession(nextSessionId, user.id, getRefreshSessionExpiry());
    cookies.set(ADMIN_ACCESS_COOKIE, nextAccess, buildAdminAccessCookieOptions());
    cookies.set(ADMIN_REFRESH_COOKIE, nextRefresh, buildAdminRefreshCookieOptions());
    return { user, permissions, twoFactorEnabled };
  } catch {
    return null;
  }
}
const RATE_LIMITS = /* @__PURE__ */ new Map();
const MAX_RATE_LIMIT_KEYS = 1e4;
function isRateLimitAvailable(key, limit) {
  const current = RATE_LIMITS.get(key);
  if (!current) return true;
  if (current.resetAt <= Date.now()) {
    RATE_LIMITS.delete(key);
    return true;
  }
  return current.count < limit;
}
function resetRateLimit(key) {
  RATE_LIMITS.delete(key);
}
function isWithinRateLimit(key, limit, windowMs) {
  const now = Date.now();
  if (RATE_LIMITS.size >= MAX_RATE_LIMIT_KEYS) {
    for (const [storedKey, value] of RATE_LIMITS) {
      if (value.resetAt <= now) RATE_LIMITS.delete(storedKey);
    }
    if (RATE_LIMITS.size >= MAX_RATE_LIMIT_KEYS && !RATE_LIMITS.has(key)) {
      const oldestKey = RATE_LIMITS.keys().next().value;
      if (oldestKey) RATE_LIMITS.delete(oldestKey);
    }
  }
  const current = RATE_LIMITS.get(key);
  if (!current || current.resetAt <= now) {
    RATE_LIMITS.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
function applySecurityHeaders(context) {
  context.header("X-Content-Type-Options", "nosniff");
  context.header("X-Frame-Options", "SAMEORIGIN");
  context.header("Referrer-Policy", "strict-origin-when-cross-origin");
  context.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  context.header("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com https://challenges.cloudflare.com; script-src 'self' 'unsafe-inline' blob: https://challenges.cloudflare.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'");
  if (process.env.NODE_ENV === "production") context.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}
function isReadRequest(method) {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}
async function enforceRequestBodyLimit(context, maximum) {
  const request = context.req.raw;
  if (!request.body) return null;
  const contentLength = request.headers.get("content-length");
  if (contentLength && !request.headers.has("transfer-encoding")) {
    const length = Number(contentLength);
    return !Number.isSafeInteger(length) || length < 0 || length > maximum ? "Request body is too large." : null;
  }
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximum) {
      await reader.cancel();
      return "Request body is too large.";
    }
    chunks.push(value);
  }
  context.req.raw = new Request(request, {
    body: new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      }
    }),
    duplex: "half"
  });
  return null;
}
function hasValidSameOrigin(request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
function clientAddress(request) {
  if (process.env.TRUST_PROXY === "true") {
    const forwarded = [
      request.headers.get("cf-connecting-ip"),
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      request.headers.get("x-real-ip")
    ];
    for (const candidate of forwarded) {
      if (candidate && isIP(candidate) !== 0) return candidate;
    }
  }
  const hostname = new URL(request.url).hostname.replace(/^\[|\]$/g, "");
  if (hostname === "localhost" || hostname === "127.0.0.1") return "127.0.0.1";
  if (hostname === "::1") return "::1";
  return "unknown";
}
const PUBLIC_PATHS = /* @__PURE__ */ new Set([
  "/api/admin/auth/login",
  "/api/admin/auth/refresh",
  "/api/admin/auth/session",
  "/api/admin/auth/logout",
  "/api/admin/auth/2fa/verify"
]);
function readCookie(request, name) {
  const value = request.headers.get("cookie")?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1);
  return value ? { value } : void 0;
}
function requiredPermissions(pathname, method) {
  const rest = pathname.slice("/api/admin".length);
  const read = method === "GET" || method === "HEAD";
  if (rest.startsWith("/users")) {
    if (read) return ["users.view"];
    if (rest.includes("/2fa/disable") && method === "POST") return ["users.manage"];
    if (rest.includes("/bulk/delete") || method === "DELETE") return ["users.delete", "users.manage"];
    if (rest.includes("duplicate") || method === "POST") return ["users.create", "users.manage"];
    return ["users.edit", "users.manage"];
  }
  if (rest === "/dashboard") return ["dashboard.view"];
  if (rest.startsWith("/activity-logs")) return ["activity-log.view"];
  if (rest.startsWith("/categories") || rest.startsWith("/posts")) return null;
  if (rest.startsWith("/menus")) {
    if (read) return ["menus.view"];
    if (method === "DELETE") return ["menus.delete"];
    if (method === "POST" && rest === "/menus") return ["menus.create"];
    return ["menus.edit", "menus.manage"];
  }
  if (rest.startsWith("/media")) return read ? ["media.view"] : null;
  if (rest === "/settings") return ["settings.manage"];
  return null;
}
const adminSecurity = async (context, next) => {
  const request = context.req.raw;
  const pathname = context.req.path;
  const method = request.method;
  if (pathname === "/api/admin/auth/2fa/verify" && method === "POST") {
    const client = clientAddress(request);
    const key = client === "unknown" ? `${pathname}:global` : `${pathname}:${client}`;
    const limit = client === "unknown" ? 60 : 10;
    if (!isWithinRateLimit(key, limit, 15 * 60 * 1e3)) return context.json({ success: false, message: "Too many requests. Please try again later." }, 429);
  }
  if ((pathname === "/api/admin/auth/2fa/enable" || pathname === "/api/admin/auth/2fa/disable") && method === "POST") {
    const client = clientAddress(request);
    const key = client === "unknown" ? `${pathname}:global` : `${pathname}:${client}`;
    const limit = client === "unknown" ? 60 : 10;
    if (!isWithinRateLimit(key, limit, 15 * 60 * 1e3)) return context.json({ success: false, message: "Too many requests. Please try again later." }, 429);
  }
  if (PUBLIC_PATHS.has(pathname)) {
    if (pathname === "/api/admin/auth/logout") {
      const session22 = await getAdminSession({ get: (name) => readCookie(request, name), set: () => void 0 });
      if (session22) context.set("session", { user: session22.user });
    }
    return next();
  }
  const session2 = await getAdminSession({ get: (name) => readCookie(request, name), set: () => void 0 });
  if (!session2) return context.json({ success: false, message: "Unauthorized." }, 401);
  const permissions = requiredPermissions(pathname, method);
  const allowed = permissions ? (await Promise.all(permissions.map((permission) => can(session2.user.id, permission)))).some(Boolean) : true;
  if (!allowed) {
    return context.json({ success: false, message: "Insufficient permissions." }, 403);
  }
  context.set("session", { user: session2.user });
  return next();
};
const middleware = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adminSecurity
}, Symbol.toStringTag, { value: "Module" }));
function createAdminRouteContext(context) {
  return {
    request: context.req.raw,
    params: context.req.param(),
    cookies: {
      get: (name) => {
        const value = getCookie(context, name);
        return value ? { value } : void 0;
      },
      set: (name, value, options) => {
        setCookie(context, name, value, options);
      }
    },
    locals: { session: context.get("session") ?? null }
  };
}
const routeModules = {
  .../* @__PURE__ */ Object.assign({ "./admin/activity-logs.ts": () => Promise.resolve().then(() => activityLogs), "./admin/auth/2fa/disable.ts": () => Promise.resolve().then(() => disable$1), "./admin/auth/2fa/enable.ts": () => Promise.resolve().then(() => enable), "./admin/auth/2fa/setup.ts": () => Promise.resolve().then(() => setup), "./admin/auth/2fa/status.ts": () => Promise.resolve().then(() => status$1), "./admin/auth/2fa/verify.ts": () => Promise.resolve().then(() => verify), "./admin/auth/login.ts": () => Promise.resolve().then(() => login), "./admin/auth/logout.ts": () => Promise.resolve().then(() => logout), "./admin/auth/profile.ts": () => Promise.resolve().then(() => profile), "./admin/auth/refresh.ts": () => Promise.resolve().then(() => refresh), "./admin/auth/session.ts": () => Promise.resolve().then(() => session), "./admin/categories/[id].ts": () => Promise.resolve().then(() => _id_$4), "./admin/categories/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$5), "./admin/categories/bulk/delete.ts": () => Promise.resolve().then(() => _delete$3), "./admin/categories/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$4), "./admin/categories/bulk/status.ts": () => Promise.resolve().then(() => status), "./admin/categories/index.ts": () => Promise.resolve().then(() => index$4), "./admin/dashboard.ts": () => Promise.resolve().then(() => dashboard), "./admin/media/[id].ts": () => Promise.resolve().then(() => _id_$3), "./admin/media/bulk/delete.ts": () => Promise.resolve().then(() => _delete$2), "./admin/media/index.ts": () => Promise.resolve().then(() => index$3), "./admin/media/upload.ts": () => Promise.resolve().then(() => upload), "./admin/menus/[id].ts": () => Promise.resolve().then(() => _id_$2), "./admin/menus/index.ts": () => Promise.resolve().then(() => index$2), "./admin/menus/reorder.ts": () => Promise.resolve().then(() => reorder), "./admin/middleware.ts": () => Promise.resolve().then(() => middleware), "./admin/posts/[id].ts": () => Promise.resolve().then(() => _id_$1), "./admin/posts/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$3), "./admin/posts/[id]/permanent-delete.ts": () => Promise.resolve().then(() => permanentDelete$1), "./admin/posts/[id]/restore.ts": () => Promise.resolve().then(() => restore$1), "./admin/posts/bulk/delete.ts": () => Promise.resolve().then(() => _delete$1), "./admin/posts/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$2), "./admin/posts/bulk/permanent-delete.ts": () => Promise.resolve().then(() => permanentDelete), "./admin/posts/bulk/publish.ts": () => Promise.resolve().then(() => publish), "./admin/posts/bulk/restore.ts": () => Promise.resolve().then(() => restore), "./admin/posts/bulk/unpublish.ts": () => Promise.resolve().then(() => unpublish), "./admin/posts/index.ts": () => Promise.resolve().then(() => index$1), "./admin/settings.ts": () => Promise.resolve().then(() => settings), "./admin/users/[id].ts": () => Promise.resolve().then(() => _id_), "./admin/users/[id]/2fa/disable.ts": () => Promise.resolve().then(() => disable), "./admin/users/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$1), "./admin/users/bulk/delete.ts": () => Promise.resolve().then(() => _delete), "./admin/users/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate), "./admin/users/index.ts": () => Promise.resolve().then(() => index) }),
  .../* @__PURE__ */ Object.assign({ "./public/archive/[type].ts": () => Promise.resolve().then(() => _type_), "./public/contact.ts": () => Promise.resolve().then(() => contact), "./public/search.ts": () => Promise.resolve().then(() => search) })
};
function toHonoPath(modulePath) {
  const routeSegments = modulePath.replace(/^\.\//, "").replace(/^public\//, "").replace(/\.ts$/, "").split("/").filter((segment) => segment !== "index").map((segment) => segment.replace(/^\[([^\.][^\]]*)\]$/, ":$1"));
  return `/${routeSegments.join("/")}`;
}
const routes = Object.entries(routeModules).filter(([modulePath]) => !modulePath.endsWith(".test.ts") && !modulePath.endsWith(".spec.ts") && !modulePath.endsWith("/middleware.ts")).map(([modulePath, load]) => ({
  path: toHonoPath(modulePath),
  load
})).sort((left, right) => right.path.length - left.path.length);
const apiApp = new Hono().basePath("/api");
apiApp.onError((error, context) => {
  const invalidBody = error instanceof SyntaxError;
  if (!invalidBody) console.error("API request failed", error);
  return context.json(
    { success: false, message: invalidBody ? "Invalid request body." : "Request could not be processed." },
    invalidBody ? 400 : 500
  );
});
apiApp.use("*", async (context, next) => {
  applySecurityHeaders(context);
  const request = context.req.raw;
  if (request.url.length > 8192) {
    return context.json({ success: false, message: "Request URL is too long." }, 414);
  }
  const pathname = context.req.path;
  if (pathname.startsWith("/api/admin/")) context.header("Cache-Control", "no-store, private");
  if (!isReadRequest(request.method)) {
    const maximum = pathname === "/api/admin/media/upload" ? 11 * 1024 * 1024 : 1024 * 1024;
    const bodyError = await enforceRequestBodyLimit(context, maximum);
    if (bodyError) return context.json({ success: false, message: bodyError }, 413);
    if (!hasValidSameOrigin(request)) return context.json({ success: false, message: "Invalid request origin." }, 403);
  }
  return next();
});
apiApp.use("/admin/*", adminSecurity);
function withHonoHeaders(response, context) {
  const headers = new Headers(response.headers);
  for (const [name, value] of context.res.headers) {
    if (name.toLowerCase() === "set-cookie") headers.append(name, value);
    else if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
async function readActivityRequestBody(request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return void 0;
  try {
    return await request.clone().json();
  } catch {
    return void 0;
  }
}
for (const route of routes) {
  apiApp.all(route.path, async (context) => {
    const handler = (await route.load())[context.req.method];
    if (!handler) {
      return Response.json({ success: false, message: "Method not allowed." }, { status: 405 });
    }
    const pathname = context.req.path;
    const method = context.req.method;
    const shouldCaptureActivity = pathname.startsWith("/api/admin/") && !isReadRequest(method);
    const session2 = context.get("session");
    const requestBody = shouldCaptureActivity ? await readActivityRequestBody(context.req.raw) : void 0;
    const before = shouldCaptureActivity ? await captureActivitySnapshot({ pathname, method, actorId: session2?.user.id ?? null, requestBody }) : null;
    const response = await handler(createAdminRouteContext(context));
    await recordActivityRequest({
      request: context.req.raw,
      pathname,
      method,
      response,
      actorId: session2?.user.id ?? null,
      ipAddress: clientAddress(context.req.raw),
      before,
      requestBody
    });
    return withHonoHeaders(response, context);
  });
}
const contentTypes = [];
const templates = [];
const fallbackRegistry = {
  contentTypes,
  templates
};
let configuredRegistry = fallbackRegistry;
function isRegistry(value) {
  return typeof value === "object" && value !== null && Array.isArray(value.contentTypes) && Array.isArray(value.templates);
}
function setContentTypeRegistry(registry) {
  if (isRegistry(registry)) configuredRegistry = registry;
}
function getContentTypeRegistry() {
  const browserRegistry = globalThis.__CMS_CONTENT_TYPE_REGISTRY__;
  return isRegistry(browserRegistry) ? browserRegistry : configuredRegistry;
}
let loadedPath;
function getServerContentTypeRegistry() {
  const configuredPath = process.env.BEAVER_CONTENT_TYPE_REGISTRY_PATH?.trim() || process.env.CONTENT_TYPE_REGISTRY_PATH?.trim();
  const hostPath = resolve(process.cwd(), "src/components/web/content-type-templates/registry.json");
  const registryPath = configuredPath ? resolve(process.cwd(), configuredPath) : existsSync(hostPath) ? hostPath : void 0;
  if (registryPath && registryPath !== loadedPath) {
    setContentTypeRegistry(JSON.parse(readFileSync(registryPath, "utf8")));
    loadedPath = registryPath;
  }
  return getContentTypeRegistry();
}
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emptyToNull = z.string().max(1e4, "Text must be at most 10000 characters").transform((val) => val.trim() === "" ? null : val).nullable().optional();
const SAFE_SCHEMES = /* @__PURE__ */ new Set(["http:", "https:", "mailto:", "tel:"]);
function isSafeHref(value) {
  const candidate = value.trim();
  if (!candidate || /[\u0000-\u001f\u007f\\]/.test(candidate) || candidate.startsWith("//")) return false;
  if (candidate.startsWith("/") || candidate.startsWith("#") || candidate.startsWith("?")) return true;
  try {
    return SAFE_SCHEMES.has(new URL(candidate).protocol);
  } catch {
    return false;
  }
}
const safeHrefSchema = z.string().trim().min(1, "URL is required").max(2048, "URL must be at most 2048 characters").refine(isSafeHref, "URL must be a relative path or use http, https, mailto, or tel");
const safeImageUrlSchema = z.string().trim().max(2048, "Image URL must be at most 2048 characters").refine((value) => {
  if (/^https?:\/\//i.test(value)) {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }
  return value.startsWith("/") && !value.startsWith("//") && !/[\u0000-\u001f\u007f\\]/.test(value);
}, "Image must be a valid http/https URL or a relative path starting with /");
const imageUrlSchema = safeImageUrlSchema.nullable().optional();
const featuredImageSchema = z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(imageUrlSchema);
const galleryImageSchema = z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(imageUrlSchema);
const imageUrlSimpleSchema = z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(
  z.string().refine((val) => safeImageUrlSchema.safeParse(val).success, "Image must be a valid http/https URL or a relative path starting with /").nullable().optional()
);
const publishStatusEnum = z.enum(["draft", "published"]);
function buildSlug(input, title) {
  return (input || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
function jsonOrNull$1(value) {
  if (Array.isArray(value)) return value.length > 0 ? JSON.stringify(value) : null;
  return value ? JSON.stringify(value) : null;
}
function resolvePublicationState(requestedStatus, inputPublishedAt, oldStatus, existingPublishedAt, now) {
  if (requestedStatus === "draft") return { status: "draft", publishedAt: null };
  const publishedAt = inputPublishedAt !== void 0 ? toDateMilliseconds(inputPublishedAt) : toDateMilliseconds(existingPublishedAt) ?? (oldStatus === "published" || oldStatus === "scheduled" ? null : now);
  return {
    status: publishedAt !== null && publishedAt > now ? "scheduled" : "published",
    publishedAt
  };
}
function buildPostPayload(data, userId) {
  const now = Date.now();
  const publication = resolvePublicationState(data.status ?? "draft", data.publishedAt, void 0, null, now);
  return {
    id: generateId(),
    title: sanitizeText(data.title ?? ""),
    slug: buildSlug(data.slug, data.title ?? ""),
    type: data.type ?? "post",
    status: publication.status,
    excerpt: data.excerpt ?? null,
    description: data.description ? sanitizeHtml(data.description) : null,
    tags: jsonOrNull$1(data.tags),
    sections: jsonOrNull$1(data.sections),
    customFieldValues: jsonOrNull$1(data.customFieldValues),
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    featuredImage: data.featuredImage ?? null,
    gallery: jsonOrNull$1(data.gallery),
    authorId: userId,
    publishedAt: publication.publishedAt,
    createdAt: now,
    updatedAt: now
  };
}
function buildUpdatePayload(data, existing, now) {
  const oldStatus = existing.status;
  const publication = resolvePublicationState(
    data.status ?? oldStatus ?? "draft",
    data.publishedAt,
    oldStatus,
    existing.publishedAt,
    now
  );
  const update = {
    updatedAt: now,
    status: publication.status,
    publishedAt: publication.publishedAt
  };
  if (data.title !== void 0) update.title = sanitizeText(data.title);
  if (data.slug !== void 0) update.slug = data.slug;
  if (data.type !== void 0) update.type = data.type;
  if (data.excerpt !== void 0) update.excerpt = data.excerpt ?? null;
  if (data.description !== void 0) update.description = data.description ? sanitizeHtml(data.description) : null;
  if (data.tags !== void 0) update.tags = jsonOrNull$1(data.tags);
  if (data.sections !== void 0) update.sections = jsonOrNull$1(data.sections);
  if (data.customFieldValues !== void 0) update.customFieldValues = jsonOrNull$1(data.customFieldValues);
  if (data.metaTitle !== void 0) update.metaTitle = data.metaTitle ?? null;
  if (data.metaDescription !== void 0) update.metaDescription = data.metaDescription ?? null;
  if (data.featuredImage !== void 0) update.featuredImage = data.featuredImage ?? null;
  if (data.gallery !== void 0) update.gallery = jsonOrNull$1(data.gallery);
  return update;
}
async function createPost(data, userId) {
  const slug = buildSlug(data.slug, data.title);
  const existing = await findPostBySlugRecord(slug);
  if (existing) return serviceConflict("slug", "A post with this slug already exists.");
  try {
    const payload = buildPostPayload(data, userId);
    payload.slug = slug;
    const post = await createPostRecord(payload);
    if (data.categoryIds?.length) {
      await syncPostCategoriesRecord(payload.id, data.categoryIds, payload.createdAt);
    }
    invalidatePublicDataCache();
    return serviceSuccess(post, "Post created.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to create post." } };
  }
}
async function updatePost(id2, data) {
  const existing = await findPostByIdRecord(id2);
  if (!existing || existing.deletedAt != null) return serviceNotFound("Post");
  if (data.slug && data.slug !== existing.slug) {
    const slugConflict = await findPostBySlugRecord(data.slug);
    if (slugConflict) return serviceConflict("slug", "A post with this slug already exists.");
  }
  try {
    const now = Date.now();
    const updateData = buildUpdatePayload(data, existing, now);
    const post = await updatePostRecord(id2, updateData);
    if (data.categoryIds !== void 0) {
      await syncPostCategoriesRecord(id2, data.categoryIds, now);
    }
    invalidatePublicDataCache();
    return serviceSuccess(post, "Post updated.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to update post." } };
  }
}
async function duplicatePost(id2, userId) {
  const original = await findPostByIdRecord(id2);
  if (!original || original.deletedAt != null) return serviceNotFound("Post");
  const now = Date.now();
  const newId = generateId();
  let newSlug = `${original.slug}-copy`;
  const slugConflict = await findPostBySlugRecord(newSlug);
  if (slugConflict) {
    const timestamp2 = now.toString(36).slice(-6);
    newSlug = `${original.slug}-copy-${timestamp2}`;
  }
  try {
    const post = await createPostRecord({
      id: newId,
      title: original.title ? `${original.title} (Copy)` : "Untitled (Copy)",
      slug: newSlug,
      type: original.type,
      status: "draft",
      excerpt: original.excerpt,
      description: original.description,
      tags: original.tags,
      sections: original.sections,
      customFieldValues: original.customFieldValues,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      featuredImage: original.featuredImage,
      gallery: original.gallery,
      authorId: userId,
      publishedAt: null,
      createdAt: now,
      updatedAt: now
    });
    if (original.categories?.length) {
      await syncPostCategoriesRecord(
        newId,
        original.categories.map((c) => c.id),
        now
      );
    }
    invalidatePublicDataCache();
    return serviceSuccess(post, "Post duplicated.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate post." } };
  }
}
async function bulkDeletePosts(ids) {
  const results = [];
  for (const id2 of ids) {
    const existing = await findPostByIdRecord(id2);
    if (!existing || existing.deletedAt != null) {
      results.push({ id: id2, success: false });
      continue;
    }
    try {
      results.push({ id: id2, success: await trashPostRecord(id2, Date.now()) });
    } catch {
      results.push({ id: id2, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk delete completed.");
}
async function bulkPublishPosts(ids) {
  const now = Date.now();
  const results = [];
  for (const id2 of ids) {
    const existing = await findPostByIdRecord(id2);
    if (!existing || existing.deletedAt != null) {
      results.push({ id: id2, success: false });
      continue;
    }
    try {
      await updatePostRecord(id2, { status: "published", publishedAt: now, updatedAt: now });
      results.push({ id: id2, success: true });
    } catch {
      results.push({ id: id2, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk publish completed.");
}
async function bulkUnpublishPosts(ids) {
  const now = Date.now();
  const results = [];
  for (const id2 of ids) {
    const existing = await findPostByIdRecord(id2);
    if (!existing || existing.deletedAt != null) {
      results.push({ id: id2, success: false });
      continue;
    }
    try {
      await updatePostRecord(id2, { status: "draft", publishedAt: null, updatedAt: now });
      results.push({ id: id2, success: true });
    } catch {
      results.push({ id: id2, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk unpublish completed.");
}
async function bulkDuplicatePosts(ids, userId) {
  const results = [];
  for (const originalId of ids) {
    const result = await duplicatePost(originalId, userId);
    if (result.success) {
      results.push({ id: originalId, success: true, newId: result.data.id });
    } else {
      results.push({ id: originalId, success: false, error: result.error.message });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
async function deletePost(id2) {
  const existing = await findPostByIdRecord(id2);
  if (!existing || existing.deletedAt != null) return serviceNotFound("Post");
  try {
    const moved = await trashPostRecord(id2, Date.now());
    if (!moved) return serviceNotFound("Post");
    invalidatePublicDataCache();
    return serviceSuccess(null, "Post moved to trash.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to move post to trash." } };
  }
}
async function getPost(id2) {
  const post = await findPostByIdRecord(id2);
  if (!post || post.deletedAt != null) return serviceNotFound("Post");
  return serviceSuccess(post, "OK");
}
async function getTrashedPost(id2) {
  const post = await findPostByIdRecord(id2);
  if (!post || post.deletedAt == null) return serviceNotFound("Post");
  return serviceSuccess(post, "OK");
}
async function restorePost(id2) {
  const existing = await getTrashedPost(id2);
  if (!existing.success) return existing;
  try {
    const restored = await restorePostRecord(id2, Date.now());
    if (!restored) return serviceNotFound("Post");
    const post = await findPostByIdRecord(id2);
    if (!post) return serviceNotFound("Post");
    invalidatePublicDataCache();
    return serviceSuccess(post, "Post restored.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to restore post." } };
  }
}
async function permanentlyDeletePost(id2) {
  const existing = await getTrashedPost(id2);
  if (!existing.success) return { success: false, error: existing.error };
  try {
    const deleted = await permanentlyDeletePostRecord(id2);
    if (!deleted) return serviceNotFound("Post");
    invalidatePublicDataCache();
    return serviceSuccess(null, "Post permanently deleted.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to permanently delete post." } };
  }
}
async function bulkRestorePosts(ids) {
  const results = [];
  for (const id2 of ids) {
    const existing = await findPostByIdRecord(id2);
    if (!existing || existing.deletedAt == null) {
      results.push({ id: id2, success: false });
      continue;
    }
    try {
      results.push({ id: id2, success: await restorePostRecord(id2, Date.now()) });
    } catch {
      results.push({ id: id2, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk restore completed.");
}
async function bulkPermanentlyDeletePosts(ids) {
  const results = [];
  for (const id2 of ids) {
    const existing = await findPostByIdRecord(id2);
    if (!existing || existing.deletedAt == null) {
      results.push({ id: id2, success: false });
      continue;
    }
    try {
      results.push({ id: id2, success: await permanentlyDeletePostRecord(id2) });
    } catch {
      results.push({ id: id2, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk permanent delete completed.");
}
async function listPosts(filters) {
  const result = await listPostRecords(filters);
  return serviceSuccess(result, "OK");
}
async function getPublishedPostByType(type, slug) {
  if (!slugRegex.test(type) || !slugRegex.test(slug)) return serviceNotFound("Post");
  const post = await getCachedPublicData(`post:published:${type}:${slug}`, async () => {
    const record = await findPublishedByTypeAndSlugRecord(type, slug);
    return record ? { ...record, description: record.description ? sanitizeHtml(record.description) : null } : record;
  });
  if (!post) return serviceNotFound("Post");
  return serviceSuccess(post, "OK");
}
async function listPublishedPostsByType(type, page = 1, perPage = 10, filters = {}) {
  const normalizedPage = clampPage(page);
  const normalizedPerPage = clampPerPage(perPage, 10);
  const availableCustomFields = getPublicCustomFieldFilters(type);
  const requestedCustomFields = filters.customFields ?? {};
  const customFields = Object.fromEntries(
    availableCustomFields.flatMap((field) => {
      const value = requestedCustomFields[field.name]?.trim().slice(0, 100);
      if (!value || !isValidCustomFieldFilterValue(field, value)) return [];
      return [[field.name, field.type === "boolean" ? value === "true" ? "1" : "0" : value]];
    })
  );
  const normalizedFilters = {
    search: filters.search?.trim().slice(0, 100) || void 0,
    category: filters.category?.trim().slice(0, 100) || void 0,
    tag: filters.tag?.trim().slice(0, 100) || void 0,
    customFields: Object.keys(customFields).length > 0 ? customFields : void 0,
    sortBy: filters.sortBy === "title" ? "title" : filters.sortBy === "created_at" ? "created_at" : void 0,
    sortOrder: filters.sortOrder === "asc" || filters.sortOrder === "desc" ? filters.sortOrder : void 0
  };
  const customFieldCacheKey = Object.entries(normalizedFilters.customFields ?? {}).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => `${name}=${value}`).join(",");
  const cacheKey = [type, normalizedPage, normalizedPerPage, normalizedFilters.search?.toLowerCase() ?? "", normalizedFilters.category?.toLowerCase() ?? "", normalizedFilters.tag?.toLowerCase() ?? "", customFieldCacheKey, normalizedFilters.sortBy ?? "", normalizedFilters.sortOrder ?? ""].join(":");
  return serviceSuccess(await getCachedPublicData(`posts:published:${cacheKey}`, () => listPublishedPostRecordsByType(type, normalizedPage, normalizedPerPage, normalizedFilters)), "OK");
}
async function getPublishedArchiveFilterOptions(type) {
  return serviceSuccess(await getCachedPublicData(`posts:published:archive-filter-options:${type}`, async () => ({
    ...await listPublishedArchiveFilterOptionsByType(type),
    customFields: getPublicCustomFieldFilters(type)
  })), "OK");
}
function getPublicCustomFieldFilters(type) {
  const registry = getServerContentTypeRegistry();
  const contentType = registry.contentTypes.find((candidate) => candidate.slug === type);
  if (!contentType) return [];
  return (registry.templates.find((template) => template.id === contentType.detailTemplate && template.kind === "detail")?.fieldSlots ?? []).filter((field) => /^[A-Za-z0-9_-]{1,64}$/.test(field.key)).slice(0, 50).flatMap((field) => ["text", "number", "boolean", "select", "date"].includes(field.type) ? [{ name: field.key, label: field.label, type: field.type, options: [] }] : []);
}
function getPublicCustomFieldFiltersFromSearchParams(type, searchParams) {
  const allowedNames = new Set(getPublicCustomFieldFilters(type).map((field) => field.name));
  const result = {};
  let inspected = 0;
  for (const [key, value] of searchParams.entries()) {
    inspected += 1;
    if (inspected > 200 || Object.keys(result).length >= 50) break;
    const name = key.startsWith("field_") ? key.slice(6) : "";
    if (name && allowedNames.has(name)) result[name] = value.slice(0, 100);
  }
  return result;
}
function isValidCustomFieldFilterValue(field, value) {
  if (field.type === "select") return field.options.includes(value);
  if (field.type === "boolean") return value === "true" || value === "false";
  if (field.type === "number") return Number.isFinite(Number(value));
  if (field.type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value);
  return true;
}
async function searchPublishedPosts(query, page = 1, perPage = 10) {
  const normalizedQuery = query.trim().slice(0, 100);
  const normalizedPage = clampPage(page);
  const normalizedPerPage = clampPerPage(perPage, 10);
  if (!normalizedQuery) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage: normalizedPerPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK");
  }
  const result = await getCachedPublicData(
    `posts:published:search:${normalizedQuery.toLowerCase()}:${normalizedPage}:${normalizedPerPage}`,
    () => searchPublishedPostRecords(normalizedQuery, normalizedPage, normalizedPerPage)
  );
  return serviceSuccess(result, "OK");
}
async function listPublishedPostsByTag(tag, page = 1, perPage = 10) {
  const normalizedTag = tag.trim().slice(0, 100);
  const normalizedPage = clampPage(page);
  const normalizedPerPage = clampPerPage(perPage, 10);
  if (!normalizedTag) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage: normalizedPerPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK");
  }
  return serviceSuccess(
    await getCachedPublicData(
      `posts:published:tag:${normalizedTag.toLowerCase()}:${normalizedPage}:${normalizedPerPage}`,
      () => listPublishedPostRecordsByTag(normalizedTag, normalizedPage, normalizedPerPage)
    ),
    "OK"
  );
}
const MAX_MENU_PARENT_DEPTH = 20;
async function validateParentId(parentId, type, currentId) {
  if (!parentId) return null;
  if (parentId === currentId) return "A menu item cannot be its own parent.";
  const parent = await findMenuById(parentId);
  if (!parent || parent.type !== type) return "Parent menu item was not found in this menu.";
  const visited = new Set(currentId ? [currentId] : []);
  let cursor = parent;
  for (let depth = 0; cursor && depth < MAX_MENU_PARENT_DEPTH; depth += 1) {
    if (visited.has(cursor.id)) return "Menu hierarchy cannot contain a cycle.";
    visited.add(cursor.id);
    if (!cursor.parentId) return null;
    cursor = await findMenuById(cursor.parentId);
    if (cursor && cursor.type !== type) return "Parent menu item was not found in this menu.";
  }
  return cursor ? "Menu hierarchy is too deep or contains a cycle." : null;
}
async function getMenuTree(type) {
  const tree = await getCachedPublicData(`menu-tree:${type ?? "all"}`, () => getMenuTreeRecords(void 0, type));
  return serviceSuccess(tree, "OK");
}
async function listMenus() {
  const items = await listMenus$1();
  return serviceSuccess(items, "OK");
}
async function getMenu(id2) {
  const item = await findMenuById(id2);
  if (!item) return serviceNotFound("Menu");
  return serviceSuccess(item, "OK");
}
async function createMenu(data) {
  const parentError = await validateParentId(data.parentId, data.type);
  if (parentError) return serviceValidation(parentError);
  const id2 = generateId();
  const now = getCurrentTimestamp();
  const record = await createMenuRecord({
    id: id2,
    title: data.title,
    url: data.url,
    type: data.type,
    position: data.position ?? 0,
    cssClass: data.cssClass,
    target: data.target,
    image: data.image,
    parentId: data.parentId,
    status: data.status,
    createdAt: now,
    updatedAt: now
  });
  invalidatePublicDataCache();
  return serviceSuccess(record, "Menu created.");
}
async function updateMenu(id2, data) {
  const existing = await findMenuById(id2);
  if (!existing) return serviceNotFound("Menu");
  const nextType = data.type ?? existing.type;
  const nextParentId = data.parentId !== void 0 ? data.parentId : existing.parentId;
  const parentError = await validateParentId(nextParentId, nextType, id2);
  if (parentError) return serviceValidation(parentError);
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.title !== void 0) updateData.title = data.title;
  if (data.url !== void 0) updateData.url = data.url;
  if (data.type !== void 0) updateData.type = data.type;
  if (data.position !== void 0) updateData.position = data.position;
  if (data.cssClass !== void 0) updateData.cssClass = data.cssClass;
  if (data.target !== void 0) updateData.target = data.target;
  if (data.image !== void 0) updateData.image = data.image;
  if (data.parentId !== void 0) updateData.parentId = data.parentId;
  if (data.status !== void 0) updateData.status = data.status;
  const updated = await updateMenuRecord(id2, updateData);
  if (!updated) return serviceNotFound("Menu");
  invalidatePublicDataCache();
  return serviceSuccess(updated, "Menu updated.");
}
function flattenTree(tree) {
  const result = [];
  for (const node of tree) {
    result.push({ id: node.id, position: node.position, parentId: node.parentId });
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}
async function reorderMenus(data) {
  const items = flattenTree(data.tree);
  const existing = await listMenus$1(data.type);
  const existingById = new Map(existing.map((item) => [item.id, item]));
  const proposedParents = new Map(existing.map((item) => [item.id, item.parentId]));
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    if (seen.has(item.id)) return serviceValidation("Menu tree contains duplicate items.");
    const current = existingById.get(item.id);
    if (!current) return serviceValidation("Menu tree contains an unknown item.");
    if (item.parentId === item.id) return serviceValidation("A menu item cannot be its own parent.");
    if (item.parentId && !existingById.has(item.parentId)) return serviceValidation("Menu tree contains an unknown parent.");
    seen.add(item.id);
    proposedParents.set(item.id, item.parentId);
  }
  for (const item of existing) {
    const visited = /* @__PURE__ */ new Set();
    let cursor = item.id;
    for (let depth = 0; cursor && depth < MAX_MENU_PARENT_DEPTH; depth += 1) {
      if (visited.has(cursor)) return serviceValidation("Menu hierarchy cannot contain a cycle.");
      visited.add(cursor);
      cursor = proposedParents.get(cursor) ?? null;
    }
    if (cursor) return serviceValidation("Menu hierarchy is too deep or contains a cycle.");
  }
  await reorderMenuTree(items);
  invalidatePublicDataCache();
  return serviceSuccess(null, "Menus reordered.");
}
async function deleteMenu(id2) {
  const existing = await findMenuById(id2);
  if (!existing) return serviceNotFound("Menu");
  await deleteMenuRecord(id2);
  invalidatePublicDataCache();
  return serviceSuccess(null, "Menu deleted.");
}
let cachedS3 = null;
function envValue(name) {
  const value = process.env[name]?.trim();
  return value || void 0;
}
function parseBoolean(value, fallback) {
  if (value === void 0) return fallback;
  return !["false", "0", "no", "off"].includes(value.toLowerCase());
}
function getStorageType() {
  const value = envValue("STORAGE_TYPE")?.toLowerCase() || "local";
  if (value !== "local" && value !== "s3") {
    throw new Error('STORAGE_TYPE must be either "local" or "s3".');
  }
  return value;
}
function getStorageDir() {
  const configuredPath = envValue("STORAGE_PATH") || envValue("STORAGE_DIR");
  if (configuredPath) return resolve(process.cwd(), configuredPath);
  const uploadDir = envValue("UPLOAD_DIR") || "./public";
  return resolve(process.cwd(), uploadDir, "storage");
}
function normalizeStorageKey(filePath) {
  const value = filePath.trim().replace(/^\/+/, "");
  const key = value === "storage" ? "" : value.startsWith("storage/") ? value.slice("storage/".length) : value;
  if (!key || key.includes("\0") || key.includes("\\") || key.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("Invalid storage file path.");
  }
  return key;
}
function resolveStorageFile(filePath) {
  const storageDir = getStorageDir();
  const target = resolve(storageDir, normalizeStorageKey(filePath));
  const relativeTarget = relative(storageDir, target);
  if (!relativeTarget || relativeTarget === ".." || relativeTarget.startsWith(`..${sep}`) || isAbsolute(relativeTarget)) {
    throw new Error("Invalid storage file path.");
  }
  return target;
}
function getS3StorageConfig() {
  const bucket = envValue("S3_BUCKET");
  if (!bucket) throw new Error("S3_BUCKET is required when STORAGE_TYPE=s3.");
  const accessKeyId = envValue("S3_ACCESS_KEY_ID") || envValue("S3_ACCESS_KEY") || envValue("AWS_ACCESS_KEY_ID");
  const secretAccessKey = envValue("S3_SECRET_ACCESS_KEY") || envValue("S3_SECRET_KEY") || envValue("AWS_SECRET_ACCESS_KEY");
  if (accessKeyId && !secretAccessKey || !accessKeyId && secretAccessKey) {
    throw new Error("S3 access key and secret key must be configured together.");
  }
  return {
    bucket,
    endpoint: envValue("S3_ENDPOINT"),
    region: envValue("S3_REGION") || "us-east-1",
    forcePathStyle: parseBoolean(envValue("S3_FORCE_PATH_STYLE"), false),
    accessKeyId,
    secretAccessKey
  };
}
function getS3Storage() {
  const config = getS3StorageConfig();
  const cacheKey = JSON.stringify(config);
  if (cachedS3?.cacheKey === cacheKey) return cachedS3;
  const clientConfig = {
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    ...config.endpoint ? { endpoint: config.endpoint } : {},
    ...config.accessKeyId && config.secretAccessKey ? { credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } } : {}
  };
  const client = new S3Client(clientConfig);
  cachedS3 = { cacheKey, client, config };
  return cachedS3;
}
function isMissingS3Object(error) {
  const candidate = error;
  return candidate.name === "NoSuchKey" || candidate.name === "NotFound" || candidate.$metadata?.httpStatusCode === 404;
}
async function writeStorageFile(filePath, data) {
  if (getStorageType() === "local") {
    const target = resolveStorageFile(filePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, data);
    return;
  }
  const key = normalizeStorageKey(filePath);
  const { client, config } = getS3Storage();
  await client.send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: data }));
}
async function readStorageFile(filePath) {
  if (getStorageType() === "local") {
    const target = resolveStorageFile(filePath);
    try {
      return await readFile(target);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }
  const key = normalizeStorageKey(filePath);
  const { client, config } = getS3Storage();
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
    if (!response.Body) return null;
    return Buffer.from(await response.Body.transformToByteArray());
  } catch (error) {
    if (isMissingS3Object(error)) return null;
    throw error;
  }
}
async function deleteStorageFile(filePath) {
  if (getStorageType() === "local") {
    const target = resolveStorageFile(filePath);
    try {
      await unlink(target);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
  }
  const key = normalizeStorageKey(filePath);
  const { client, config } = getS3Storage();
  try {
    await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
    return true;
  } catch (error) {
    if (isMissingS3Object(error)) return false;
    throw error;
  }
}
function resolveMigrationsFolder() {
  const dialect = databaseConfig.connection;
  const packaged = fileURLToPath(new URL(`./migrations/${dialect}/`, import.meta.url));
  const source = fileURLToPath(new URL(`../../../migrations/${dialect}/`, import.meta.url));
  const legacySqlite = fileURLToPath(new URL("../../../migrations/", import.meta.url));
  const candidates = dialect === "sqlite" ? [packaged, source, legacySqlite] : [packaged, source];
  const folder = candidates.find((candidate) => existsSync(join(candidate, "meta", "_journal.json")));
  if (!folder) throw new Error(`No ${dialect} database migrations were packaged.`);
  return folder;
}
async function migrate() {
  const migrationsFolder = resolveMigrationsFolder();
  const config = { migrationsFolder };
  if (databaseConfig.connection === "sqlite") {
    await migrate$1(db, executeSqliteMigrations, config);
  } else if (databaseConfig.connection === "mysql") {
    await migrate$2(db, config);
  } else {
    await migrate$3(db, config);
  }
}
const DEFAULT_INTERVAL_SECONDS = 60;
const MIN_INTERVAL_SECONDS = 1;
const MAX_INTERVAL_SECONDS = 24 * 60 * 60;
const DEFAULT_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 1e3;
function boundedInteger(value, fallback, minimum, maximum) {
  if (value === void 0 || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) return fallback;
  return parsed;
}
function getSchedulingWorkerIntervalMs() {
  return boundedInteger(
    process.env.BEAVER_WORKER_INTERVAL_SECONDS,
    DEFAULT_INTERVAL_SECONDS,
    MIN_INTERVAL_SECONDS,
    MAX_INTERVAL_SECONDS
  ) * 1e3;
}
function getSchedulingWorkerBatchSize() {
  return boundedInteger(process.env.BEAVER_WORKER_BATCH_SIZE, DEFAULT_BATCH_SIZE, 1, MAX_BATCH_SIZE);
}
async function recordScheduledPublication(postId, scheduledAt, publishedAt) {
  await createActivityLogRecord({
    action: "publish_scheduled",
    resource: "post",
    resourceId: postId,
    metadata: {
      scheduledAt,
      publishedAt,
      delaySeconds: scheduledAt === null ? null : Math.max(0, Math.floor((publishedAt - scheduledAt) / 1e3))
    },
    userAgent: "beaver-scheduling-worker",
    success: true,
    statusCode: 200,
    actorId: null
  });
}
async function runSchedulingWorkerCycle(now = Date.now(), batchSize = getSchedulingWorkerBatchSize()) {
  const normalized = await normalizeLegacyScheduledPostRecords(now);
  const duePosts = await listDueScheduledPostRecords(now, batchSize);
  let published = 0;
  let activityLogs2 = 0;
  let activityLogFailures = 0;
  for (const post of duePosts) {
    const claimed = await publishScheduledPostRecord(post.id, now);
    if (!claimed) continue;
    published += 1;
    try {
      await recordScheduledPublication(post.id, post.publishedAt, now);
      activityLogs2 += 1;
    } catch (error) {
      activityLogFailures += 1;
      console.error(`Activity log failed for scheduled post ${post.id}`, error);
    }
  }
  if (published > 0) invalidatePublicDataCache();
  const purged = await purgeExpiredActivityLogs();
  return { normalized, published, activityLogs: activityLogs2, activityLogFailures, purged };
}
function waitForNextCycle(intervalMs, signal) {
  return new Promise((resolve2) => {
    if (signal?.aborted) {
      resolve2();
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve2();
    }, intervalMs);
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve2();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
async function runSchedulingWorker(options = {}) {
  const intervalMs = options.intervalMs ?? getSchedulingWorkerIntervalMs();
  const batchSize = options.batchSize ?? getSchedulingWorkerBatchSize();
  if (!Number.isInteger(intervalMs) || intervalMs < MIN_INTERVAL_SECONDS * 1e3) {
    throw new Error("Scheduling worker interval must be at least one second.");
  }
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BATCH_SIZE) {
    throw new Error(`Scheduling worker batch size must be between 1 and ${MAX_BATCH_SIZE}.`);
  }
  while (!options.signal?.aborted) {
    try {
      const result = await runSchedulingWorkerCycle(Date.now(), batchSize);
      await options.onCycle?.(result);
    } catch (error) {
      console.error("Scheduling worker cycle failed", error);
    }
    if (options.signal?.aborted) break;
    await waitForNextCycle(intervalMs, options.signal);
  }
}
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  type: z.string().min(1).max(64).regex(slugRegex, "Type must contain only lowercase alphanumeric characters and hyphens").default("post"),
  status: publishStatusEnum.default("published"),
  description: emptyToNull,
  image: imageUrlSimpleSchema
});
const updateCategorySchema = createCategorySchema.partial();
const menuTypeEnum = z.enum(["navbar", "footer", "sidebar"]);
const createMenuSchema = z.object({
  // Required: 1-100 characters (Req 7.1)
  title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
  // Required: URL string
  url: safeHrefSchema,
  // Required: menu type (Req 7.1)
  type: menuTypeEnum,
  // Optional: non-negative integer, defaults to 0 (Req 7.1)
  position: z.number().int().min(0, "Position must be a non-negative integer").default(0),
  // Optional: parent menu item ID (ULID)
  parentId: z.string().regex(ulidRegex, "Parent ID must be a valid ULID").nullable().optional(),
  // Optional: empty → null (Req 9.9)
  cssClass: emptyToNull,
  // Optional: empty → null (Req 9.9)
  target: z.preprocess(
    (value) => value === "" ? null : value,
    z.enum(["_self", "_blank", "_parent", "_top"]).nullable().optional()
  ),
  image: imageUrlSimpleSchema,
  status: publishStatusEnum.default("published")
});
const updateMenuSchema = createMenuSchema.partial();
const MAX_MENU_DEPTH = 20;
const MAX_MENU_CHILDREN = 100;
const MAX_MENU_NODES = 1e3;
function menuTreeItemSchemaAtDepth(depth) {
  const children = depth >= MAX_MENU_DEPTH ? z.array(z.never()).max(0) : z.array(menuTreeItemSchemaAtDepth(depth + 1)).max(MAX_MENU_CHILDREN);
  return z.object({
    id: z.string().regex(ulidRegex, "Menu item ID must be a valid ULID"),
    parentId: z.string().regex(ulidRegex, "Parent ID must be a valid ULID").nullable(),
    position: z.number().int().min(0, "Position must be a non-negative integer"),
    children
  });
}
const menuTreeItemSchema = menuTreeItemSchemaAtDepth(0);
const reorderMenusSchema = z.object({
  type: menuTypeEnum,
  tree: z.array(menuTreeItemSchema).max(MAX_MENU_CHILDREN, "Too many top-level menu items")
}).superRefine((value, context) => {
  let count2 = 0;
  const visit = (nodes) => {
    for (const node of nodes) {
      count2 += 1;
      if (count2 > MAX_MENU_NODES) return true;
      if (visit(node.children)) return true;
    }
    return false;
  };
  if (visit(value.tree)) {
    context.addIssue({ code: "custom", message: `At most ${MAX_MENU_NODES} menu items may be reordered.` });
  }
});
const sectionText = z.string().max(1e4).nullable().optional();
const sectionShortText = z.string().max(512).nullable().optional();
const sectionLinkSchema = z.object({
  label: z.string().max(200),
  url: safeHrefSchema
});
const sectionItemSchema = z.object({
  caption: sectionShortText,
  title: sectionShortText,
  text: sectionText,
  image: safeImageUrlSchema.nullable().optional(),
  alt_image: sectionShortText,
  video: z.string().max(2048).nullable().optional(),
  map: z.string().max(256).nullable().optional(),
  icon: sectionShortText,
  form_inquiry: z.boolean().nullable().optional(),
  embed: z.string().max(4e3).nullable().optional(),
  bg_color: z.string().max(200).nullable().optional(),
  bg_image: safeImageUrlSchema.nullable().optional(),
  links: z.array(sectionLinkSchema).max(20, "Too many section links").nullable().optional(),
  style_css: z.string().max(1e3).nullable().optional(),
  style_css_inline: z.string().max(4e3).nullable().optional(),
  style_id: z.string().max(128).nullable().optional()
});
const sectionSchema = z.object({
  id: z.string().min(1, "Section id is required").max(128),
  type: z.string().min(1, "Section type is required").max(64),
  caption: sectionShortText,
  title: sectionShortText,
  text: sectionText,
  image: safeImageUrlSchema.nullable().optional(),
  alt_image: sectionShortText,
  bg_color: z.string().max(200).nullable().optional(),
  bg_image: safeImageUrlSchema.nullable().optional(),
  style_css: z.string().max(1e3).nullable().optional(),
  style_css_inline: z.string().max(4e3).nullable().optional(),
  style_id: z.string().max(128).nullable().optional(),
  alignment: z.string().max(32).nullable().optional(),
  limit: z.number().int().min(0).max(100).nullable().optional(),
  sort: z.number().int().min(0).max(1e6).optional(),
  sort_by: z.string().max(32).nullable().optional(),
  sort_order: z.enum(["asc", "desc"]).nullable().optional(),
  category: z.string().max(128).nullable().optional(),
  links: z.array(sectionLinkSchema).max(20, "Too many section links").nullable().optional(),
  item: z.array(sectionItemSchema).max(100, "Too many section items").nullable().optional()
});
const tagSchema = z.string().min(1, "Tag must not be empty").max(50, "Tag must be at most 50 characters");
const createPostSchema = z.object({
  // Required
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  // Optional with validation
  slug: z.string().max(100, "Slug must be at most 100 characters").regex(slugRegex, "Slug must contain only lowercase alphanumeric characters and hyphens").optional(),
  type: z.string().min(1).max(64).regex(slugRegex, "Type must contain only lowercase alphanumeric characters and hyphens").default("post"),
  status: publishStatusEnum.default("draft"),
  publishedAt: z.number().int().positive().nullable().optional(),
  // Optional string fields with empty-to-null transform (Req 9.9)
  excerpt: emptyToNull,
  description: z.string().max(1e5, "Description must be at most 100000 characters").optional(),
  // Tags: array of strings, max 30 items (Req 20.1)
  tags: z.array(tagSchema).max(30, "Tags must contain at most 30 items").optional(),
  // Sections: array of objects, max 50 items (Req 20.2)
  sections: z.array(sectionSchema).max(50, "Sections must contain at most 50 items").optional(),
  // SEO fields (Req 9.6)
  metaTitle: z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(
    z.string().max(60, "Meta title must be at most 60 characters").nullable().optional()
  ),
  metaDescription: z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(
    z.string().max(160, "Meta description must be at most 160 characters").nullable().optional()
  ),
  // Featured image (Req 17.4)
  featuredImage: featuredImageSchema,
  // Gallery images stored as JSON array of URLs
  gallery: z.array(galleryImageSchema).max(20, "Gallery must contain at most 20 images").optional(),
  // Category IDs: array of ULIDs (Req 9.7)
  categoryIds: z.array(z.string().regex(ulidRegex, "Invalid category ID format")).max(100, "Too many categories").optional(),
  // Custom field values: record of arbitrary values (Req 20.3)
  customFieldValues: z.record(z.string().max(64), z.unknown()).refine((value) => Object.keys(value).length <= 100, "Too many custom fields").optional()
});
const updatePostSchema = createPostSchema.partial();
const settingsSeedSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(1e4).optional(),
  meta_title: z.string().max(200).optional(),
  meta_description: z.string().max(1e4).optional(),
  maintenance_mode: z.boolean().optional(),
  timezone: z.string().max(100).optional(),
  logo: z.string().max(2048).optional(),
  favicon: z.string().max(2048).optional(),
  links: z.array(z.object({
    platform: z.string().min(1).max(100),
    url: safeHrefSchema,
    icon: z.string().max(100).optional()
  }).strict()).max(100).optional(),
  open_hours: z.array(z.object({
    day: z.string().min(1).max(100),
    open: z.string().min(1).max(20),
    close: z.string().min(1).max(20)
  }).strict()).max(100).optional(),
  custom_css: z.string().max(1e5).optional(),
  custom_javascript: z.string().max(1e5).optional(),
  translate_countries: z.array(z.string().min(1).max(20)).max(100).optional(),
  email_notifications: z.array(z.string().email()).max(100).optional()
}).strict();
const categorySeedSchema = createCategorySchema.extend({
  slug: z.string().regex(slugRegex, "Slug must contain only lowercase alphanumeric characters and hyphens").optional()
}).strict();
const contentSeedSchema = createPostSchema.omit({ categoryIds: true }).extend({
  status: z.enum(["draft", "published"]).default("published"),
  categorySlugs: z.array(z.string().trim().min(1).max(200)).max(100).optional()
}).strict();
const menuSeedSchema = createMenuSchema.omit({ parentId: true }).extend({
  position: z.number().int().min(0).optional(),
  parentUrl: safeHrefSchema.optional()
}).strict();
const seedDataSchema = z.object({
  settings: settingsSeedSchema.default({}),
  categories: z.array(categorySeedSchema).max(5e3).default([]),
  posts: z.array(contentSeedSchema).max(5e3).default([]),
  pages: z.array(contentSeedSchema).max(5e3).default([]),
  menus: z.array(menuSeedSchema).max(5e3).default([])
}).strict();
function emptyEntitySummary() {
  return { created: 0, updated: 0, skipped: 0 };
}
function emptySummary(source, dryRun) {
  return {
    source,
    dryRun,
    settings: emptyEntitySummary(),
    categories: emptyEntitySummary(),
    posts: emptyEntitySummary(),
    pages: emptyEntitySummary(),
    menus: emptyEntitySummary()
  };
}
function seedError(message) {
  return new Error(`Seed data error: ${message}`);
}
function assertUnique(label, values) {
  const seen = /* @__PURE__ */ new Set();
  for (const value of values) {
    if (seen.has(value)) throw seedError(`Duplicate ${label}: "${value}".`);
    seen.add(value);
  }
}
function contentSlug(item) {
  const slug = item.slug ?? slugify(item.title);
  if (!slug) throw seedError(`Unable to generate a slug for content "${item.title}".`);
  return slug;
}
function categorySlug(item) {
  const slug = item.slug ?? slugify(item.name);
  if (!slug) throw seedError(`Unable to generate a slug for category "${item.name}".`);
  return slug;
}
function menuKey(type, url) {
  return `${type}:${url}`;
}
function validateSeedData(data) {
  const categorySlugs = data.categories.map(categorySlug);
  assertUnique("category slug", categorySlugs);
  const contentSlugs = [...data.posts, ...data.pages].map(contentSlug);
  assertUnique("content slug", contentSlugs);
  const menuKeys = data.menus.map((menu) => menuKey(menu.type, menu.url));
  assertUnique("menu item", menuKeys);
  validateMenuParentGraph(data.menus);
  return data;
}
function parseSeedData(input, source = "<seed data>") {
  const result = seedDataSchema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.length ? issue.path.join(".") : "<root>"}: ${issue.message}`).join("; ");
    throw seedError(`Invalid data in ${source}: ${details}`);
  }
  return validateSeedData(result.data);
}
function assertRegularFile(filePath) {
  let stats;
  try {
    stats = lstatSync(filePath);
  } catch {
    throw seedError(`Seed file was not found: ${filePath}`);
  }
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw seedError(`Seed path must be a regular file: ${filePath}`);
  }
}
function resolveSeedPath(options) {
  if (!options.filePath) throw seedError("A seed file is required.");
  const filePath = isAbsolute(options.filePath) ? options.filePath : resolve(process.cwd(), options.filePath);
  assertRegularFile(filePath);
  return { filePath, source: filePath };
}
async function loadSeedData(options) {
  const { filePath, source } = resolveSeedPath(options);
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw seedError(`Unable to read ${source}: ${message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw seedError(`Invalid JSON in ${source}: ${message}`);
  }
  return { data: parseSeedData(parsed, source), source };
}
function serializeSettingValue(value) {
  if (typeof value === "string") return value;
  const serialized = JSON.stringify(value);
  if (serialized === void 0) throw seedError("A setting value could not be serialized.");
  return serialized;
}
function jsonOrNull(value) {
  if (value === void 0 || value === null) return null;
  if (Array.isArray(value) && value.length === 0) return null;
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return null;
  return JSON.stringify(value) ?? null;
}
async function importSettings(tx, data, summary, overwrite, now) {
  for (const [key, value] of Object.entries(data)) {
    if (value === void 0) continue;
    const serialized = serializeSettingValue(value);
    const rows = await tx.select().from(settings$1).where(eq(settings$1.key, key)).limit(1).execute();
    const existing = rows[0];
    if (!existing) {
      await tx.insert(settings$1).values({ key, value: serialized, createdAt: now, updatedAt: now }).execute();
      summary.created++;
      continue;
    }
    if (!overwrite || existing.value === serialized) {
      summary.skipped++;
      continue;
    }
    await tx.update(settings$1).set({ value: serialized, updatedAt: now }).where(eq(settings$1.key, key)).execute();
    summary.updated++;
  }
}
async function importCategories(tx, data, summary, overwrite, now) {
  const categoryIds = /* @__PURE__ */ new Map();
  for (const category of data) {
    const slug = categorySlug(category);
    const rows = await tx.select().from(categories).where(eq(categories.slug, slug)).limit(1).execute();
    const existing = rows[0];
    if (!existing) {
      const id2 = generateId();
      await tx.insert(categories).values({
        id: id2,
        name: sanitizeText(category.name),
        slug,
        type: category.type ?? "post",
        description: category.description ?? null,
        image: category.image ?? null,
        status: category.status ?? "published",
        createdAt: now,
        updatedAt: now
      }).execute();
      categoryIds.set(slug, id2);
      summary.created++;
      continue;
    }
    categoryIds.set(slug, existing.id);
    if (!overwrite) {
      summary.skipped++;
      continue;
    }
    const next = {
      name: sanitizeText(category.name),
      type: category.type ?? "post",
      description: category.description ?? null,
      image: category.image ?? null,
      status: category.status ?? "published"
    };
    const changed = existing.name !== next.name || existing.type !== next.type || existing.description !== next.description || existing.image !== next.image || existing.status !== next.status;
    if (!changed) {
      summary.skipped++;
      continue;
    }
    await tx.update(categories).set({ ...next, updatedAt: now }).where(eq(categories.id, existing.id)).execute();
    summary.updated++;
  }
  return categoryIds;
}
async function resolveCategoryIds(tx, slugs, categoryIds, contentLabel) {
  const resolved = [];
  for (const slug of slugs ?? []) {
    let categoryId = categoryIds.get(slug);
    if (!categoryId) {
      const rows = await tx.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1).execute();
      categoryId = rows[0]?.id;
    }
    if (!categoryId) {
      throw seedError(`Content "${contentLabel}" references unknown category slug "${slug}".`);
    }
    if (!resolved.includes(categoryId)) resolved.push(categoryId);
  }
  return resolved;
}
function buildContentFields(item, type, now, existingPublishedAt) {
  const requestedStatus = item.status ?? "published";
  const publishedAt = requestedStatus === "published" ? item.publishedAt ?? existingPublishedAt ?? now : null;
  const status2 = requestedStatus === "published" && publishedAt !== null && publishedAt > now ? "scheduled" : requestedStatus;
  return {
    title: sanitizeText(item.title),
    slug: contentSlug(item),
    type,
    status: status2,
    excerpt: item.excerpt ?? null,
    description: item.description ? sanitizeHtml(item.description) : null,
    tags: jsonOrNull(item.tags),
    sections: jsonOrNull(item.sections),
    customFieldValues: jsonOrNull(item.customFieldValues),
    metaTitle: item.metaTitle ?? null,
    metaDescription: item.metaDescription ?? null,
    featuredImage: item.featuredImage ?? null,
    gallery: jsonOrNull(item.gallery),
    publishedAt
  };
}
async function syncContentCategories(tx, postId, categoryIds, now) {
  await tx.delete(postCategories).where(eq(postCategories.postId, postId)).execute();
  for (const categoryId of categoryIds) {
    await tx.insert(postCategories).values({
      id: generateId(),
      postId,
      categoryId,
      createdAt: now
    }).execute();
  }
}
async function importContent(tx, data, kind, authorId, categoryIds, summary, overwrite, now) {
  for (const item of data) {
    const slug = contentSlug(item);
    const type = kind === "page" ? "page" : item.type ?? "post";
    const rows = await tx.select().from(posts).where(eq(posts.slug, slug)).limit(1).execute();
    const existing = rows[0];
    if (existing && existing.type !== type) {
      throw seedError(`Content slug "${slug}" already belongs to type "${existing.type}"; expected "${type}".`);
    }
    const resolvedCategoryIds = await resolveCategoryIds(tx, item.categorySlugs, categoryIds, item.title);
    if (existing && !overwrite) {
      summary.skipped++;
      continue;
    }
    const fields = buildContentFields(item, type, now, existing?.publishedAt);
    if (existing) {
      const changed = existing.title !== fields.title || existing.type !== fields.type || existing.status !== fields.status || existing.excerpt !== fields.excerpt || existing.description !== fields.description || existing.tags !== fields.tags || existing.sections !== fields.sections || existing.customFieldValues !== fields.customFieldValues || existing.metaTitle !== fields.metaTitle || existing.metaDescription !== fields.metaDescription || existing.featuredImage !== fields.featuredImage || existing.gallery !== fields.gallery || existing.publishedAt !== fields.publishedAt;
      const existingCategoryRows = await tx.select({ categoryId: postCategories.categoryId }).from(postCategories).where(eq(postCategories.postId, existing.id)).execute();
      const existingCategoryIds = existingCategoryRows.map((row) => row.categoryId).sort();
      const nextCategoryIds = [...resolvedCategoryIds].sort();
      const categoriesChanged = existingCategoryIds.length !== nextCategoryIds.length || existingCategoryIds.some((categoryId, index2) => categoryId !== nextCategoryIds[index2]);
      if (!changed && !categoriesChanged) {
        summary.skipped++;
        continue;
      }
      await tx.update(posts).set({ ...fields, updatedAt: now }).where(eq(posts.id, existing.id)).execute();
      await syncContentCategories(tx, existing.id, resolvedCategoryIds, now);
      summary.updated++;
      continue;
    }
    const id2 = generateId();
    await tx.insert(posts).values({
      id: id2,
      ...fields,
      authorId,
      createdAt: now,
      updatedAt: now
    }).execute();
    await syncContentCategories(tx, id2, resolvedCategoryIds, now);
    summary.created++;
  }
}
async function findMenuByKey(tx, type, url) {
  const rows = await tx.select().from(menus).where(and(eq(menus.type, type), eq(menus.url, url))).limit(1).execute();
  return rows[0];
}
function validateMenuParentGraph(data) {
  const keys = new Set(data.map((menu) => menuKey(menu.type, menu.url)));
  const parents = new Map(
    data.filter((menu) => menu.parentUrl).map((menu) => [menuKey(menu.type, menu.url), menuKey(menu.type, menu.parentUrl)])
  );
  for (const [key, parent] of parents) {
    if (key === parent) throw seedError(`Menu item "${key}" cannot be its own parent.`);
    if (!keys.has(parent)) continue;
    const visited = /* @__PURE__ */ new Set([key]);
    let cursor = parent;
    while (cursor && keys.has(cursor)) {
      if (visited.has(cursor)) throw seedError(`Menu hierarchy contains a cycle at "${cursor}".`);
      visited.add(cursor);
      cursor = parents.get(cursor);
    }
  }
}
async function validateMenuParentReferences(tx, data) {
  validateMenuParentGraph(data);
  const sourceKeys = new Set(data.map((menu) => menuKey(menu.type, menu.url)));
  for (const menu of data) {
    if (!menu.parentUrl) continue;
    const parentKey = menuKey(menu.type, menu.parentUrl);
    if (sourceKeys.has(parentKey)) continue;
    const existing = await findMenuByKey(tx, menu.type, menu.parentUrl);
    if (!existing) throw seedError(`Menu "${menuKey(menu.type, menu.url)}" references unknown parent "${parentKey}".`);
  }
}
async function resolveMenuParentId(tx, menu, menuIds) {
  if (!menu.parentUrl) return null;
  const key = menuKey(menu.type, menu.parentUrl);
  const fromSeed = menuIds.get(key);
  if (fromSeed) return fromSeed;
  const existing = await findMenuByKey(tx, menu.type, menu.parentUrl);
  if (!existing) throw seedError(`Menu "${menuKey(menu.type, menu.url)}" references unknown parent "${key}".`);
  return existing.id;
}
async function importMenus(tx, data, summary, overwrite, now) {
  await validateMenuParentReferences(tx, data);
  const menuIds = /* @__PURE__ */ new Map();
  const parentUpdates = /* @__PURE__ */ new Set();
  for (const [index2, menu] of data.entries()) {
    const key = menuKey(menu.type, menu.url);
    const existing = await findMenuByKey(tx, menu.type, menu.url);
    if (!existing) {
      const id2 = generateId();
      await tx.insert(menus).values({
        id: id2,
        title: sanitizeText(menu.title),
        url: menu.url,
        type: menu.type,
        position: menu.position ?? index2,
        cssClass: menu.cssClass ? sanitizeText(menu.cssClass) : null,
        target: menu.target ?? null,
        image: menu.image ?? null,
        status: menu.status ?? "published",
        parentId: null,
        createdAt: now,
        updatedAt: now
      }).execute();
      menuIds.set(key, id2);
      parentUpdates.add(id2);
      summary.created++;
      continue;
    }
    menuIds.set(key, existing.id);
    if (!overwrite) {
      summary.skipped++;
      continue;
    }
    const next = {
      title: sanitizeText(menu.title),
      url: menu.url,
      type: menu.type,
      position: menu.position ?? index2,
      cssClass: menu.cssClass ? sanitizeText(menu.cssClass) : null,
      target: menu.target ?? null,
      image: menu.image ?? null,
      status: menu.status ?? "published",
      parentId: null
    };
    const changed = existing.title !== next.title || existing.url !== next.url || existing.type !== next.type || existing.position !== next.position || existing.cssClass !== next.cssClass || existing.target !== next.target || existing.image !== next.image || existing.status !== next.status || existing.parentId !== next.parentId;
    if (!changed) {
      summary.skipped++;
      continue;
    }
    await tx.update(menus).set({ ...next, updatedAt: now }).where(eq(menus.id, existing.id)).execute();
    parentUpdates.add(existing.id);
    summary.updated++;
  }
  for (const menu of data) {
    const id2 = menuIds.get(menuKey(menu.type, menu.url));
    if (!id2 || !parentUpdates.has(id2)) continue;
    const parentId = await resolveMenuParentId(tx, menu, menuIds);
    if (parentId === id2) throw seedError(`Menu item "${menuKey(menu.type, menu.url)}" cannot be its own parent.`);
    await tx.update(menus).set({ parentId, updatedAt: now }).where(eq(menus.id, id2)).execute();
  }
}
function plannedSummary(data, source) {
  const result = emptySummary(source, true);
  result.settings.created = Object.keys(data.settings).length;
  result.categories.created = data.categories.length;
  result.posts.created = data.posts.length;
  result.pages.created = data.pages.length;
  result.menus.created = data.menus.length;
  return result;
}
function formatSeedDataSummary(result) {
  const prefix = result.dryRun ? "Seed data dry-run" : "Seed data import";
  const lines = [
    `${prefix} complete: ${result.source}`,
    `  settings: ${result.settings.created} created, ${result.settings.updated} updated, ${result.settings.skipped} skipped`,
    `  categories: ${result.categories.created} created, ${result.categories.updated} updated, ${result.categories.skipped} skipped`,
    `  posts: ${result.posts.created} created, ${result.posts.updated} updated, ${result.posts.skipped} skipped`,
    `  pages: ${result.pages.created} created, ${result.pages.updated} updated, ${result.pages.skipped} skipped`,
    `  menus: ${result.menus.created} created, ${result.menus.updated} updated, ${result.menus.skipped} skipped`
  ];
  return lines.join("\n");
}
async function seedData(options) {
  const { data, source } = await loadSeedData(options);
  const dryRun = options.dryRun === true;
  if (dryRun) return plannedSummary(data, source);
  const userRows = await db.select({ id: users.id }).from(users).limit(1).execute();
  const authorId = userRows[0]?.id ?? SUPER_ADMIN_USER_ID;
  const result = emptySummary(source, false);
  const overwrite = options.overwrite === true;
  const now = getCurrentTimestamp();
  await db.transaction(async (tx) => {
    await importSettings(tx, data.settings, result.settings, overwrite, now);
    const categoryIds = await importCategories(tx, data.categories, result.categories, overwrite, now);
    await importContent(tx, data.posts, "post", authorId, categoryIds, result.posts, overwrite, now);
    await importContent(tx, data.pages, "page", authorId, categoryIds, result.pages, overwrite, now);
    await importMenus(tx, data.menus, result.menus, overwrite, now);
  });
  const changed = Object.values(result).some((value) => {
    if (typeof value !== "object" || value === null || !("created" in value)) return false;
    const summary = value;
    return summary.created > 0 || summary.updated > 0;
  });
  if (changed) invalidatePublicDataCache();
  return result;
}
async function seed(options) {
  if (options && (options.filePath || options.dryRun || options.overwrite)) {
    return seedData(options);
  }
  const admin = getAdminCredentials();
  console.log(`✅ System seed complete (environment-managed Super Admin: ${admin.email})`);
}
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  });
}
async function resetSuperAdminPassword() {
  const admin = getAdminCredentials();
  return { email: admin.email };
}
const TWO_FACTOR_ISSUER = "Beaver";
function getSuperAdminTwoFactorUri(secret) {
  const credentials = getAdminCredentials();
  return generateURI({
    issuer: TWO_FACTOR_ISSUER,
    label: credentials.email,
    secret
  });
}
function generateSuperAdminTwoFactorSetup(force = false) {
  const current = getSuperAdminTwoFactorConfig();
  if (current.enabled && !force) {
    throw new Error("Super Admin 2FA is already enabled. Use --force to rotate the secret.");
  }
  const secret = generateSecret();
  return {
    enabled: true,
    secret,
    otpauthUrl: getSuperAdminTwoFactorUri(secret)
  };
}
async function loadAdminActor(userId) {
  const user = await findUserByIdRecord(userId);
  if (!user) return null;
  const role = isStaticRole(user.role) ? user.role : null;
  return {
    id: user.id,
    role,
    isSuperAdmin: role === "super-admin",
    permissions: new Set(await getUserPermissions(user.id))
  };
}
function hasAdminPermission(actor, permission) {
  return actor.isSuperAdmin || actor.permissions.has(permission);
}
function hasAnyAdminPermission(actor, permissions) {
  return actor.isSuperAdmin || permissions.some((permission) => actor.permissions.has(permission));
}
async function canAssignRole(actor, role) {
  if (role === void 0) return true;
  if (role === null || !isStaticRole(role)) return false;
  if (role === "super-admin") return false;
  if (actor.isSuperAdmin) return true;
  if (!actor.role) return false;
  return getStaticRoleRank(role) <= getStaticRoleRank(actor.role);
}
function canManageSensitiveUserFields(actor, targetUserId) {
  return actor.id === targetUserId || hasAdminPermission(actor, "users.manage");
}
async function getUser(id2) {
  const user = await findSafeUserByIdRecord(id2);
  if (!user) return serviceNotFound("User");
  return serviceSuccess({ ...user, twoFactorEnabled: await isTwoFactorEnabled(id2) }, "OK");
}
async function disableUserTwoFactor(id2, currentUserId) {
  const actor = await loadAdminActor(currentUserId);
  if (!actor || !hasAdminPermission(actor, "users.manage")) {
    return serviceForbidden("Insufficient permissions.");
  }
  if (isSuperAdminUserId(id2)) {
    return serviceForbidden("Super Admin two-factor authentication is managed by ADMIN_2FA_ENABLED and ADMIN_2FA_SECRET.");
  }
  if (id2 === currentUserId) {
    return serviceForbidden("Use your profile page to disable your own two-factor authentication.");
  }
  const existing = await findUserByIdRecord(id2);
  if (!existing) return serviceNotFound("User");
  const record = await findTwoFactorRecord(id2);
  if (!record || record.enabled !== 1) {
    return serviceValidation("Two-factor authentication is not enabled.");
  }
  await deleteTwoFactorRecord(id2);
  await deleteRefreshSessionsForUser(id2);
  return serviceSuccess({ enabled: false }, "Two-factor authentication disabled.");
}
async function getUserByEmail(email) {
  const user = await findUserByEmailRecord(email);
  if (!user) return serviceNotFound("User");
  return serviceSuccess(user, "OK");
}
async function listUsersPaginated(filters = {}) {
  const result = await listUsersPaginatedRecord(filters);
  return serviceSuccess(result, "OK");
}
async function createUser(data, actorId) {
  const actor = await loadAdminActor(actorId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.create", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  if (!await canAssignRole(actor, data.role)) return serviceForbidden("You cannot assign this role.");
  const existing = await findUserByEmailRecord(data.email);
  if (existing) return serviceConflict("email", "A user with this email already exists.");
  const id2 = generateId();
  const now = getCurrentTimestamp();
  const passwordHash = await hashPassword(data.password);
  const created = await createUserRecord({
    id: id2,
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    createdAt: now,
    updatedAt: now
  });
  return serviceSuccess(created, "User created.");
}
async function updateUser(id2, data, currentUserId) {
  if (isSuperAdminUserId(id2)) {
    return serviceForbidden("Super Admin is managed by ADMIN_* environment variables.");
  }
  const actor = await loadAdminActor(currentUserId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.edit", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = await findUserByIdRecord(id2);
  if (!existing) return serviceNotFound("User");
  const isSelf = id2 === currentUserId;
  const changesSensitiveFields = data.email !== void 0 || data.password !== void 0 || data.role !== void 0;
  if (!isSelf && changesSensitiveFields) {
    if (!canManageSensitiveUserFields(actor, id2) || !await canAssignRole(actor, existing.role)) {
      return serviceForbidden("You cannot manage this user.");
    }
  }
  if (data.email !== void 0 && data.email !== existing.email) {
    const conflict = await findUserByEmailRecord(data.email);
    if (conflict) return serviceConflict("email", "A user with this email already exists.");
  }
  if (data.role !== void 0) {
    if (isSelf) return serviceForbidden("You cannot change your own role.");
    if (!await canAssignRole(actor, data.role)) return serviceForbidden("You cannot assign this role.");
  }
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.email !== void 0) updateData.email = data.email;
  if (data.password !== void 0) updateData.passwordHash = await hashPassword(data.password);
  if (data.role !== void 0) updateData.role = data.role;
  const updated = await updateUserRecord(id2, updateData);
  if (!updated) return serviceNotFound("User");
  if (data.email !== void 0 || data.password !== void 0 || data.role !== void 0) {
    await deleteRefreshSessionsForUser(id2);
  }
  return serviceSuccess(updated, "User updated.");
}
async function deleteUser(id2, currentUserId) {
  if (isSuperAdminUserId(id2)) {
    return serviceForbidden("Super Admin is managed by ADMIN_* environment variables.");
  }
  const actor = await loadAdminActor(currentUserId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.delete", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = await findUserByIdRecord(id2);
  if (!existing) return serviceNotFound("User");
  if (id2 === currentUserId) return serviceForbidden("You cannot delete your own account.");
  if (!await canAssignRole(actor, existing.role)) return serviceForbidden("You cannot manage this user.");
  await deleteUserRecord(id2);
  await deleteTwoFactorRecord(id2);
  return serviceSuccess(null, "User deleted.");
}
async function duplicateUser(id2, currentUserId) {
  if (isSuperAdminUserId(id2)) {
    return serviceForbidden("Super Admin is managed by ADMIN_* environment variables.");
  }
  const actor = await loadAdminActor(currentUserId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.create", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = await findUserByIdRecord(id2);
  if (!existing) return serviceNotFound("User");
  if (!await canAssignRole(actor, existing.role)) return serviceForbidden("You cannot assign this role.");
  const newId = generateId();
  const now = getCurrentTimestamp();
  let newEmail = `duplicated_${existing.email}`;
  if (await findUserByEmailRecord(newEmail)) {
    const ts = now.toString(36).slice(-4);
    newEmail = `duplicated_${ts}_${existing.email}`;
  }
  try {
    const created = await createUserRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      email: newEmail,
      passwordHash: existing.password,
      // duplicate password hash
      role: existing.role,
      createdAt: now,
      updatedAt: now
    });
    return serviceSuccess(created, "User duplicated.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate user." } };
  }
}
async function bulkDeleteUsers(ids, currentUserId) {
  const results = [];
  for (const id2 of ids) {
    const result = await deleteUser(id2, currentUserId);
    results.push({ id: id2, success: result.success, error: !result.success ? result.error.message : void 0 });
  }
  return serviceSuccess(results, "Bulk delete completed.");
}
async function bulkDuplicateUsers(ids, currentUserId) {
  const results = [];
  for (const id2 of ids) {
    const result = await duplicateUser(id2, currentUserId);
    if (result.success) {
      results.push({ id: id2, success: true, newId: result.data.id });
    } else {
      results.push({ id: id2, success: false });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
const loginSchema = z.object({
  email: z.string().max(254, "Email is too long").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});
const twoFactorCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Authenticator code must be 6 digits.")
});
const disableTwoFactorSchema = twoFactorCodeSchema.extend({
  password: z.string().min(1, "Current password is required.").max(128, "Password is too long.")
});
const DUMMY_PASSWORD_HASH = "$2b$12$o0uJ9XsFOcfthEY.ALXOH.hYe9WJIhl6AFPTnQ5gOOJ5OMaarBZN2";
const LOGIN_GLOBAL_LIMIT = 100;
const LOGIN_EMAIL_LIMIT = 5;
const LOGIN_IP_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1e3;
function loginRateLimits(email, clientKey) {
  return [
    { key: "login:failed:global", limit: LOGIN_GLOBAL_LIMIT },
    { key: `login:failed:email:${email}`, limit: LOGIN_EMAIL_LIMIT },
    { key: `login:failed:ip:${clientKey}`, limit: LOGIN_IP_LIMIT }
  ];
}
function failedLogin(rateLimits) {
  if (rateLimits.some(({ key, limit }) => !isRateLimitAvailable(key, limit))) {
    return {
      success: false,
      status: 429,
      message: "Too many requests. Please try again later."
    };
  }
  for (const { key, limit } of rateLimits) {
    isWithinRateLimit(key, limit, LOGIN_WINDOW_MS);
  }
  return {
    success: false,
    status: 401,
    message: "Invalid credentials."
  };
}
function clearLoginFailures(rateLimits) {
  for (const { key } of rateLimits) resetRateLimit(key);
}
async function handlePasswordLogin(body, clientKey = "unknown") {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      status: 422,
      message: "Validation error."
    };
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const rateLimits = loginRateLimits(normalizedEmail, clientKey);
  if (isConfiguredSuperAdminEmail(normalizedEmail)) {
    const superAdmin = await authenticateSuperAdmin(normalizedEmail, password);
    if (!superAdmin) {
      return failedLogin(rateLimits);
    }
    clearLoginFailures(rateLimits);
    return {
      success: true,
      status: 200,
      message: "Login successful.",
      user: superAdmin,
      requiresTwoFactor: await isTwoFactorEnabled(superAdmin.id)
    };
  }
  const userResult = await getUserByEmail(email);
  const isValid = await verifyPassword(password, userResult.success ? userResult.data.password : DUMMY_PASSWORD_HASH);
  if (!userResult.success || !isValid) {
    return failedLogin(rateLimits);
  }
  const safeUser = { ...userResult.data };
  Reflect.deleteProperty(safeUser, "password");
  clearLoginFailures(rateLimits);
  return {
    success: true,
    status: 200,
    message: "Login successful.",
    user: safeUser,
    requiresTwoFactor: await isTwoFactorEnabled(safeUser.id)
  };
}
function adminSuccess(data, message = "OK") {
  return Response.json({ success: true, data, message });
}
function adminCreated(data, message = "Created") {
  return Response.json({ success: true, data, message }, { status: 201 });
}
function adminError(message, status2 = 400, errors) {
  return Response.json({ success: false, message, ...errors ? { errors } : {} }, { status: status2 });
}
function adminUnauthorized(message = "Unauthorized.") {
  return adminError(message, 401);
}
function requireAuth(session2) {
  return session2?.user ? null : adminUnauthorized();
}
async function requirePermission(session2, permission) {
  if (!session2?.user) return adminUnauthorized();
  const authorised = await can(session2.user.id, permission);
  return authorised ? null : adminError("Insufficient permissions.", 403);
}
async function requireAnyPermission(session2, permissions) {
  if (!session2?.user) return adminUnauthorized();
  const authorised = await canAny(session2.user.id, permissions);
  return authorised ? null : adminError("Insufficient permissions.", 403);
}
const CODE_STATUS = {
  validation: 422,
  conflict: 409,
  not_found: 404,
  forbidden: 403,
  unauthorized: 401
};
function mapServiceError(result, fallbackStatus = 400) {
  const code = result.error?.code ?? "";
  const status2 = CODE_STATUS[code] ?? fallbackStatus;
  return adminError(result.error?.message ?? "Unknown error.", status2, result.error?.fieldErrors);
}
function toFieldErrors(issues) {
  return issues.reduce((acc, issue) => {
    const field = String(issue.path[0] ?? "_root");
    if (!acc[field]) acc[field] = [];
    acc[field].push(issue.message);
    return acc;
  }, {});
}
function parseWithSchema(schema2, input, message = "Validation error.") {
  const parsed = schema2.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message,
      fieldErrors: toFieldErrors(parsed.error.issues)
    };
  }
  return {
    success: true,
    data: parsed.data
  };
}
const MAX_BULK_IDS = 100;
const bulkIdPattern = /^[A-Za-z0-9_-]{1,128}$/;
function parseBulkIds(input) {
  if (!Array.isArray(input) || input.length === 0) {
    return { success: false, message: "At least one id is required." };
  }
  if (input.length > MAX_BULK_IDS) {
    return { success: false, message: `At most ${MAX_BULK_IDS} ids may be processed at once.` };
  }
  const ids = [];
  for (const value of input) {
    if (typeof value !== "string" || !bulkIdPattern.test(value)) {
      return { success: false, message: "Every id must be a short alphanumeric identifier." };
    }
    if (!ids.includes(value)) ids.push(value);
  }
  return { success: true, ids };
}
async function handleTwoFactorStatus(session2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  return adminSuccess(await getTwoFactorStatus(session2.user.id), "OK");
}
async function handleTwoFactorSetup(session2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const result = await beginTwoFactorSetup(session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleTwoFactorEnable(session2, body) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const parsed = parseWithSchema(twoFactorCodeSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await confirmTwoFactorSetup(session2.user.id, parsed.data.code);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleTwoFactorDisable(session2, body) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const parsed = parseWithSchema(disableTwoFactorSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await disableTwoFactor(session2.user.id, parsed.data.password, parsed.data.code);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function generateUniqueSlug(name, excludeId) {
  let slug = slugify(name);
  if (!slug) slug = "category";
  if (await categorySlugExistsRecord(slug, excludeId)) {
    let counter = 1;
    while (await categorySlugExistsRecord(`${slug}-${counter}`, excludeId)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }
  return slug;
}
async function createCategoryAsync(data) {
  const id2 = generateId();
  const now = getCurrentTimestamp();
  const slug = await generateUniqueSlug(data.name);
  const created = await createCategoryRecord({
    id: id2,
    name: data.name,
    slug,
    type: data.type ?? "category",
    description: data.description ?? null,
    image: data.image ?? null,
    status: data.status ?? "published",
    createdAt: now,
    updatedAt: now
  });
  return serviceSuccess(created, "Category created.");
}
async function updateCategory(id2, data) {
  const existing = await findCategoryByIdRecord(id2);
  if (!existing) return serviceNotFound("Category");
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.type !== void 0) updateData.type = data.type;
  if (data.description !== void 0) updateData.description = data.description;
  if (data.image !== void 0) updateData.image = data.image;
  if (data.status !== void 0) updateData.status = data.status;
  if (data.name !== void 0 && data.name !== existing.name) {
    updateData.slug = await generateUniqueSlug(data.name, id2);
  }
  const updated = await updateCategoryRecord(id2, updateData);
  if (!updated) return serviceNotFound("Category");
  return serviceSuccess(updated, "Category updated.");
}
async function deleteCategory(id2) {
  const existing = await findCategoryByIdRecord(id2);
  if (!existing) return serviceNotFound("Category");
  await deleteCategoryRecord(id2);
  return serviceSuccess(null, "Category deleted.");
}
async function duplicateCategory(id2) {
  const existing = await findCategoryByIdRecord(id2);
  if (!existing) return serviceNotFound("Category");
  const newId = generateId();
  const now = getCurrentTimestamp();
  const newSlug = `${existing.slug}-copy`;
  let finalSlug = newSlug;
  if (await categorySlugExistsRecord(finalSlug)) {
    const ts = now.toString(36).slice(-4);
    finalSlug = `${newSlug}-${ts}`;
  }
  try {
    const created = await createCategoryRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      slug: finalSlug,
      type: existing.type,
      description: existing.description,
      image: existing.image,
      status: existing.status,
      createdAt: now,
      updatedAt: now
    });
    return serviceSuccess(created, "Category duplicated.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate category." } };
  }
}
async function bulkDeleteCategories(ids) {
  const results = [];
  for (const id2 of ids) {
    const existing = await findCategoryByIdRecord(id2);
    if (!existing) {
      results.push({ id: id2, success: false });
      continue;
    }
    try {
      await deleteCategoryRecord(id2);
      results.push({ id: id2, success: true });
    } catch {
      results.push({ id: id2, success: false });
    }
  }
  return serviceSuccess(results, "Bulk delete completed.");
}
async function bulkDuplicateCategories(ids) {
  const results = [];
  for (const id2 of ids) {
    const result = await duplicateCategory(id2);
    if (result.success) {
      results.push({ id: id2, success: true, newId: result.data.id });
    } else {
      results.push({ id: id2, success: false });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
async function bulkUpdateCategoryStatus(ids, status2) {
  const now = getCurrentTimestamp();
  const results = await Promise.all(ids.map(async (id2) => {
    const updated = await updateCategoryRecord(id2, { status: status2, updatedAt: now });
    return { id: id2, success: updated !== null };
  }));
  return serviceSuccess(results, `Categories ${status2 === "published" ? "published" : "unpublished"}.`);
}
async function listCategories(filters) {
  const items = await listCategoryRecords(filters);
  return serviceSuccess(items, "Categories retrieved.");
}
const builtInContentTypes = ["post", "page"];
function isKnownContentType(type) {
  return builtInContentTypes.includes(type) || getServerContentTypeRegistry().contentTypes.some((contentType) => contentType.slug === type);
}
function getKnownContentTypes() {
  const seen = /* @__PURE__ */ new Set();
  return [...builtInContentTypes, ...getServerContentTypeRegistry().contentTypes.map((contentType) => contentType.slug)].filter((type) => {
    if (seen.has(type)) return false;
    seen.add(type);
    return true;
  });
}
function contentPermission(type, action) {
  return `content.${type}.${action}`;
}
function categoryPermission(type, action) {
  return `category.${type}.${action}`;
}
const INSUFFICIENT$1 = "Insufficient permissions.";
const CATEGORY_NOT_FOUND = "Category not found.";
async function canCategory(userId, type, action) {
  return isKnownContentType(type) && can(userId, categoryPermission(type, action));
}
async function guardBulkCategory(session2, ids, action) {
  const unauth = requireAuth(session2);
  if (unauth) return { perm: unauth, ids };
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return { perm: adminError(parsedIds.message, 400), ids };
  const allowed = await Promise.all(
    parsedIds.ids.map(async (id2) => {
      const category = await findCategoryByIdRecord(id2);
      return category && await canCategory(session2.user.id, category.type, action);
    })
  );
  return allowed.every(Boolean) ? { ids } : { perm: adminError(INSUFFICIENT$1, 403), ids };
}
async function handleListCategories(session2, filters) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const type = filters?.type ?? "post";
  if (!await canCategory(session2.user.id, type, "view")) return adminError(INSUFFICIENT$1, 403);
  const result = await listCategories({ ...filters, type });
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleCreateCategory(session2, body) {
  const parsed = parseWithSchema(createCategorySchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  if (!await canCategory(session2.user.id, parsed.data.type, "manage")) return adminError(INSUFFICIENT$1, 403);
  if (parsed.data.status === "published" && !await canCategory(session2.user.id, parsed.data.type, "publish"))
    return adminError(INSUFFICIENT$1, 403);
  const result = await createCategoryAsync(parsed.data);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetCategory(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const category = await findCategoryByIdRecord(id2);
  if (!category) return adminError(CATEGORY_NOT_FOUND, 404);
  if (!await canCategory(session2.user.id, category.type, "view")) return adminError(INSUFFICIENT$1, 403);
  return adminSuccess(category);
}
async function handleUpdateCategory(session2, id2, body) {
  const parsed = parseWithSchema(updateCategorySchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const existing = await findCategoryByIdRecord(id2);
  if (!existing) return adminError(CATEGORY_NOT_FOUND, 404);
  if (parsed.data.type !== void 0 && parsed.data.type !== existing.type)
    return adminError("Category type cannot be changed.", 422);
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  if (!await canCategory(session2.user.id, existing.type, "manage")) return adminError(INSUFFICIENT$1, 403);
  if (parsed.data.status === "published" && existing.status !== "published" && !await canCategory(session2.user.id, existing.type, "publish"))
    return adminError(INSUFFICIENT$1, 403);
  if (parsed.data.status === "draft" && existing.status === "published" && !await canCategory(session2.user.id, existing.type, "unpublish"))
    return adminError(INSUFFICIENT$1, 403);
  const result = await updateCategory(id2, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicateCategory(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = await findCategoryByIdRecord(id2);
  if (!existing || !await canCategory(session2.user.id, existing.type, "manage"))
    return adminError(INSUFFICIENT$1, 403);
  const result = await duplicateCategory(id2);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteCategory(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = await findCategoryByIdRecord(id2);
  if (!existing || !await canCategory(session2.user.id, existing.type, "manage"))
    return adminError(INSUFFICIENT$1, 403);
  const result = await deleteCategory(id2);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleBulkDeleteCategories(session2, ids) {
  const { perm } = await guardBulkCategory(session2, ids, "manage");
  if (perm) return perm;
  const result = await bulkDeleteCategories(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkDuplicateCategories(session2, ids) {
  const { perm } = await guardBulkCategory(session2, ids, "manage");
  if (perm) return perm;
  const result = await bulkDuplicateCategories(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkUpdateCategoryStatus(session2, ids, status2) {
  const action = status2 === "published" ? "publish" : "unpublish";
  const { perm } = await guardBulkCategory(session2, ids, action);
  if (perm) return perm;
  const result = await bulkUpdateCategoryStatus(ids, status2);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
const INSUFFICIENT = "Insufficient permissions.";
async function canPost(userId, type, action) {
  return isKnownContentType(type) && can(userId, contentPermission(type, action));
}
async function canManageContent(userId, type) {
  return canPost(userId, type, "delete") || canPost(userId, type, "delete-own");
}
function ownPostAction(action) {
  return `${action}-own`;
}
async function canManagePost(userId, post, action) {
  if (await canPost(userId, post.type, action)) return true;
  return post.authorId === userId && await canPost(userId, post.type, ownPostAction(action));
}
async function canEditPost(userId, id2) {
  const result = await getPost(id2);
  if (!result.success) return false;
  if (await canPost(userId, result.data.type, "edit")) return true;
  return await canPost(userId, result.data.type, "edit-own") && result.data.authorId === userId;
}
async function guardPost(session2, type, action) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  if (!await canPost(session2.user.id, type, action)) return adminError(INSUFFICIENT, 403);
  return null;
}
async function guardBulkPost(session2, ids, action) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const allowed = await Promise.all(
    parsedIds.ids.map(async (id2) => {
      const post = await getPost(id2);
      return post.success && canManagePost(session2.user.id, post.data, action);
    })
  );
  return allowed.every(Boolean) ? null : adminError(INSUFFICIENT, 403);
}
async function guardBulkTrashedPost(session2, ids) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const allowed = await Promise.all(
    parsedIds.ids.map(async (id2) => {
      const post = await getTrashedPost(id2);
      return post.success && await canManagePost(session2.user.id, post.data, "delete");
    })
  );
  return allowed.every(Boolean) ? null : adminError(INSUFFICIENT, 403);
}
async function handleListPosts(session2, filters) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const isTrash = filters.trash === true;
  const type = filters.type ?? (isTrash ? void 0 : "post");
  let allowedTypes;
  if (type) {
    const allowed = isTrash ? await canManageContent(session2.user.id, type) : await canPost(session2.user.id, type, "view");
    if (!allowed) return adminError(INSUFFICIENT, 403);
  } else if (isTrash) {
    const knownTypes = getKnownContentTypes();
    allowedTypes = [];
    for (const knownType of knownTypes) {
      if (await canManageContent(session2.user.id, knownType)) allowedTypes.push(knownType);
    }
    if (allowedTypes.length === 0) return adminError(INSUFFICIENT, 403);
  } else {
    return adminError(INSUFFICIENT, 403);
  }
  const user = await findUserByIdRecord(session2.user.id);
  const scopedFilters = user?.role === "author" ? { ...filters, ...type ? { type } : {}, ...allowedTypes ? { types: allowedTypes } : {}, authorId: session2.user.id } : { ...filters, ...type ? { type } : {}, ...allowedTypes ? { types: allowedTypes } : {} };
  const result = await listPosts(scopedFilters);
  return result.success ? adminSuccess(result.data) : mapServiceError(result);
}
async function handleCreatePost(session2, body) {
  const parsed = parseWithSchema(createPostSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const perm = await guardPost(session2, parsed.data.type, "create");
  if (perm) return perm;
  if (parsed.data.status === "published" && !await canPost(session2.user.id, parsed.data.type, "publish") && !await canPost(session2.user.id, parsed.data.type, "publish-own")) {
    return adminError(INSUFFICIENT, 403);
  }
  const result = await createPost(parsed.data, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetPost(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const result = await getPost(id2);
  if (!result.success) return adminError(result.error.message, 404);
  if (!await canPost(session2.user.id, result.data.type, "view")) return adminError(INSUFFICIENT, 403);
  const user = await findUserByIdRecord(session2.user.id);
  if (user?.role === "author" && result.data.authorId !== session2.user.id) {
    return adminError(INSUFFICIENT, 403);
  }
  return adminSuccess(result.data);
}
async function handleUpdatePost(session2, id2, body) {
  if (!await canEditPost(session2?.user?.id ?? "", id2)) return adminError(INSUFFICIENT, 403);
  const parsed = parseWithSchema(updatePostSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const existing = await getPost(id2);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (parsed.data.type !== void 0 && parsed.data.type !== existing.data.type)
    return adminError("Content type cannot be changed.", 422);
  if (parsed.data.status === "published" && existing.data.status !== "published" && !await canManagePost(session2.user.id, existing.data, "publish"))
    return adminError(INSUFFICIENT, 403);
  if (parsed.data.status === "draft" && (existing.data.status === "published" || existing.data.status === "scheduled") && !await canManagePost(session2.user.id, existing.data, "unpublish"))
    return adminError(INSUFFICIENT, 403);
  const result = await updatePost(id2, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicatePost(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = await getPost(id2);
  if (!existing.success || !await canPost(session2.user.id, existing.data.type, "create") || !await canEditPost(session2.user.id, id2)) {
    return adminError(INSUFFICIENT, 403);
  }
  const result = await duplicatePost(id2, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeletePost(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = await getPost(id2);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (!await canManagePost(session2.user.id, existing.data, "delete")) return adminError(INSUFFICIENT, 403);
  const result = await deletePost(id2);
  return result.success ? adminSuccess(null, result.message) : mapServiceError(result);
}
async function handleRestorePost(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = await getTrashedPost(id2);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (!await canManagePost(session2.user.id, existing.data, "delete")) return adminError(INSUFFICIENT, 403);
  const result = await restorePost(id2);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handlePermanentlyDeletePost(session2, id2) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = await getTrashedPost(id2);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (!await canManagePost(session2.user.id, existing.data, "delete")) return adminError(INSUFFICIENT, 403);
  const result = await permanentlyDeletePost(id2);
  return result.success ? adminSuccess(null, result.message) : mapServiceError(result);
}
async function handleBulkDeletePosts(session2, ids) {
  const perm = await guardBulkPost(session2, ids, "delete");
  if (perm) return perm;
  const result = await bulkDeletePosts(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkRestorePosts(session2, ids) {
  const perm = await guardBulkTrashedPost(session2, ids);
  if (perm) return perm;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const result = await bulkRestorePosts(parsedIds.ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkPermanentlyDeletePosts(session2, ids) {
  const perm = await guardBulkTrashedPost(session2, ids);
  if (perm) return perm;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const result = await bulkPermanentlyDeletePosts(parsedIds.ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkPublishPosts(session2, ids) {
  const perm = await guardBulkPost(session2, ids, "publish");
  if (perm) return perm;
  const result = await bulkPublishPosts(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkUnpublishPosts(session2, ids) {
  const perm = await guardBulkPost(session2, ids, "unpublish");
  if (perm) return perm;
  const result = await bulkUnpublishPosts(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkDuplicatePosts(session2, ids) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const allowed = await Promise.all(
    parsedIds.ids.map(async (id2) => {
      const post = await getPost(id2);
      return post.success && await canPost(session2.user.id, post.data.type, "create") && await canEditPost(session2.user.id, id2);
    })
  );
  if (!allowed.every(Boolean)) return adminError(INSUFFICIENT, 403);
  const result = await bulkDuplicatePosts(parsedIds.ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
const roleSchema = z.enum(["admin", "editor", "author"], { error: "Invalid role." });
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  email: z.string().max(254, "Email is too long").email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters").max(128, "Password must be at most 128 characters"),
  role: roleSchema.default("author")
});
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  email: z.string().max(254, "Email is too long").email("Invalid email address").optional(),
  password: z.string().min(12, "Password must be at least 12 characters").max(128, "Password must be at most 128 characters").optional(),
  role: roleSchema.optional()
});
const USER_CREATE_PERMS = ["users.create", "users.manage"];
const USER_EDIT_PERMS = ["users.edit", "users.manage"];
async function handleListUsers(session2, filters) {
  const perm = await requirePermission(session2, "users.view");
  if (perm) return perm;
  const result = await listUsersPaginated(filters ?? {});
  return result.success ? adminSuccess(result.data) : adminError(result.error.message, 500);
}
async function handleCreateUser(session2, body) {
  const perm = await requireAnyPermission(session2, USER_CREATE_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(createUserSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await createUser(parsed.data, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetUser(session2, id2) {
  const perm = await requirePermission(session2, "users.view");
  if (perm) return perm;
  const result = await getUser(id2);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404);
}
async function handleUpdateUser(session2, id2, body) {
  const perm = await requireAnyPermission(session2, USER_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(updateUserSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await updateUser(id2, parsed.data, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicateUser(session2, id2) {
  const perm = await requireAnyPermission(session2, USER_CREATE_PERMS);
  if (perm) return perm;
  const result = await duplicateUser(id2, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteUser(session2, id2) {
  const perm = await requireAnyPermission(session2, ["users.delete", "users.manage"]);
  if (perm) return perm;
  const result = await deleteUser(id2, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDisableUserTwoFactor(session2, id2) {
  const perm = await requirePermission(session2, "users.manage");
  if (perm) return perm;
  const result = await disableUserTwoFactor(id2, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleBulkDeleteUsers(session2, ids) {
  const perm = await requireAnyPermission(session2, ["users.delete", "users.manage"]);
  if (perm) return perm;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const result = await bulkDeleteUsers(parsedIds.ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkDuplicateUsers(session2, ids) {
  const perm = await requireAnyPermission(session2, USER_CREATE_PERMS);
  if (perm) return perm;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const result = await bulkDuplicateUsers(parsedIds.ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
const imageSettingSchema = z.string().trim().max(2048, "Image URL must be at most 2048 characters").refine(
  (value) => value === "" || safeImageUrlSchema.safeParse(value).success,
  "Image must be a valid http/https URL or a relative path starting with /"
).optional();
const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required").max(50, "Platform is too long"),
  url: safeHrefSchema,
  icon: z.string().max(100, "Icon is too long").optional()
});
const openHoursSchema = z.object({
  day: z.string().min(1, "Day is required").max(20, "Day is too long"),
  open: z.string().min(1, "Open time is required").max(20, "Open time is too long"),
  close: z.string().min(1, "Close time is required").max(20, "Close time is too long")
});
const emailNotificationListSchema = z.string().max(1e4, "Email list is too long").refine((value) => value.split(",").map((email) => email.trim()).filter(Boolean).every((email) => {
  return email.length <= 254 && !/[\u0000-\u001f\u007f]/.test(email) && z.string().email().safeParse(email).success;
}) && value.split(",").map((email) => email.trim()).filter(Boolean).length <= 100, "Email list contains an invalid address or too many recipients");
const updateSettingsSchema = z.object({
  title: z.string().max(200, "Title is too long").optional(),
  description: z.string().max(1e4, "Description is too long").optional(),
  meta_title: z.string().max(200, "Meta title is too long").optional(),
  meta_description: z.string().max(1e4, "Meta description is too long").optional(),
  maintenance_mode: z.boolean().optional(),
  timezone: z.string().max(100, "Timezone is too long").optional(),
  logo: imageSettingSchema,
  favicon: imageSettingSchema,
  links: z.array(socialLinkSchema).max(50, "Too many links").optional(),
  open_hours: z.array(openHoursSchema).max(14, "Too many opening-hour entries").optional(),
  custom_css: z.string().max(5e4, "Custom CSS is too long").optional(),
  custom_javascript: z.string().max(5e4, "Custom JavaScript is too long").optional(),
  translate_countries: z.array(z.string().max(10, "Country code is too long")).max(250, "Too many countries").optional(),
  email_notifications: emailNotificationListSchema.optional()
});
async function handleGetSettings(session2) {
  const perm = await requirePermission(session2, "settings.manage");
  if (perm) return perm;
  return adminSuccess(await getSiteSettings());
}
async function handleUpdateSettings(session2, body) {
  const perm = await requirePermission(session2, "settings.manage");
  if (perm) return perm;
  const parsed = parseWithSchema(updateSettingsSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await updateSiteSettings(parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function updateProfile(userId, data) {
  if (isSuperAdminUserId(userId)) {
    return serviceForbidden("Super Admin profile is managed by ADMIN_* environment variables.");
  }
  const existing = await findUserByIdRecord(userId);
  if (!existing) return serviceNotFound("User");
  if (data.email !== void 0 && data.email !== existing.email) {
    const conflict = await findUserByEmailRecord(data.email);
    if (conflict) return serviceConflict("email", "A user with this email already exists.");
  }
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.email !== void 0) updateData.email = data.email;
  if (data.password !== void 0) updateData.passwordHash = await hashPassword(data.password);
  const updated = await updateUserRecord(userId, updateData);
  if (!updated) return serviceNotFound("User");
  if (data.email !== void 0 || data.password !== void 0) {
    await deleteRefreshSessionsForUser(userId);
  }
  return serviceSuccess(updated, "Profile updated.");
}
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name must be between 1 and 100 characters.").max(100).optional(),
  email: z.string().max(254, "Email is too long.").email("Invalid email address.").optional(),
  password: z.string().min(12, "Password must be between 12 and 128 characters.").max(128).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field (name, email, or password) must be provided to update.",
  path: ["_form"]
});
async function handleUpdateProfile(session2, body) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const parsed = parseWithSchema(updateProfileSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await updateProfile(session2.user.id, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
const MENU_EDIT_PERMS = ["menus.edit", "menus.manage"];
async function handleListMenus(session2) {
  const perm = await requirePermission(session2, "menus.view");
  if (perm) return perm;
  const result = await listMenus();
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleCreateMenu(session2, body) {
  const perm = await requirePermission(session2, "menus.create");
  if (perm) return perm;
  const parsed = parseWithSchema(createMenuSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  if (parsed.data.status === "published" && !await can(session2.user.id, "menus.publish")) return adminError("Insufficient permissions.", 403);
  const result = await createMenu(parsed.data);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetMenu(session2, id2) {
  const perm = await requirePermission(session2, "menus.view");
  if (perm) return perm;
  const result = await getMenu(id2);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404);
}
async function handleUpdateMenu(session2, id2, body) {
  const perm = await requireAnyPermission(session2, MENU_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(updateMenuSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const existing = await getMenu(id2);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (parsed.data.status === "published" && existing.data.status !== "published" && !await can(session2.user.id, "menus.publish")) return adminError("Insufficient permissions.", 403);
  if (parsed.data.status === "draft" && existing.data.status === "published" && !await can(session2.user.id, "menus.unpublish")) return adminError("Insufficient permissions.", 403);
  const result = await updateMenu(id2, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteMenu(session2, id2) {
  const perm = await requirePermission(session2, "menus.delete");
  if (perm) return perm;
  const result = await deleteMenu(id2);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleReorderMenus(session2, body) {
  const perm = await requireAnyPermission(session2, MENU_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(reorderMenusSchema, body, "Invalid reorder data.");
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await reorderMenus(parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 4e7;
const MAX_IMAGE_DIMENSION = 1e4;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "audio/mpeg"
];
const MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3"
};
function isImageMimeType(mimeType) {
  return mimeType.startsWith("image/");
}
function generateMediaPath(id2, extension) {
  return `storage/${id2}.${extension}`;
}
function generateThumbnailPath(id2) {
  return `storage/${id2}_thumb.webp`;
}
function getExtensionFromMimeType(mimeType) {
  return MIME_TO_EXTENSION[mimeType] ?? "";
}
function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed` };
  }
  return { valid: true };
}
async function validateFileContents(buffer, mimeType) {
  const hasSignature = mimeType === "image/jpeg" && buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255])) || mimeType === "image/png" && buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) || mimeType === "image/gif" && buffer.subarray(0, 4).toString("ascii") === "GIF8" || mimeType === "image/webp" && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP" || mimeType === "application/pdf" && buffer.subarray(0, 5).toString("ascii") === "%PDF-" || mimeType === "video/mp4" && buffer.subarray(4, 8).toString("ascii") === "ftyp" || mimeType === "audio/mpeg" && (buffer.subarray(0, 3).toString("ascii") === "ID3" || buffer[0] === 255 && (buffer[1] & 224) === 224);
  if (!hasSignature) return { valid: false, error: "The uploaded file content does not match its type." };
  if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)) {
    try {
      const metadata = await sharp(buffer, { failOn: "error", limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
      if (!metadata.format || !metadata.width || !metadata.height) return { valid: false, error: "The uploaded image is invalid." };
      if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
        return { valid: false, error: "The uploaded image dimensions are too large." };
      }
      if (metadata.pages && metadata.pages > 100) return { valid: false, error: "The uploaded image has too many frames." };
    } catch {
      return { valid: false, error: "The uploaded image is invalid." };
    }
  }
  return { valid: true };
}
async function listMediaService(filters = {}) {
  const result = await listMediaRecords(filters);
  return serviceSuccess(result, "OK");
}
async function getMedia(id2) {
  const item = await findMediaByIdRecord(id2);
  if (!item) return serviceNotFound("Media");
  return serviceSuccess(item, "OK");
}
async function uploadMediaForUser(formData, userId, metadata) {
  const file = formData.get("file");
  if (!file || file.size === 0) {
    return { success: false, error: { code: "validation", message: "No file provided." } };
  }
  const fileCheck = validateFile(file);
  if (!fileCheck.valid) {
    return {
      success: false,
      error: { code: "validation", message: fileCheck.error ?? "Invalid file." }
    };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentCheck = await validateFileContents(buffer, file.type);
  if (!contentCheck.valid) {
    return { success: false, error: { code: "validation", message: contentCheck.error ?? "Invalid file." } };
  }
  const fileResult = await processUploadedFile(
    buffer,
    file.type
  );
  return await createMediaRecord({
    id: fileResult.id,
    userId,
    name: metadata.name ?? file.name,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    url: fileResult.url,
    thumbnailUrl: fileResult.thumbnailUrl,
    alt: metadata.alt ?? null,
    caption: metadata.caption ?? null,
    width: fileResult.width,
    height: fileResult.height,
    folder: metadata.folder ?? null
  });
}
async function createMediaRecord(params) {
  const id2 = params.id ?? generateId();
  const now = getCurrentTimestamp();
  const record = await createMediaRecord$1({
    id: id2,
    userId: params.userId,
    name: params.name || params.fileName,
    fileName: params.fileName,
    mimeType: params.mimeType,
    size: params.size,
    url: params.url,
    thumbnailUrl: params.thumbnailUrl,
    alt: params.alt,
    caption: params.caption,
    width: params.width,
    height: params.height,
    folder: params.folder,
    createdAt: now,
    updatedAt: now
  });
  return serviceSuccess(record, "Media uploaded.");
}
async function updateMedia(id2, data) {
  const existing = await findMediaByIdRecord(id2);
  if (!existing) return serviceNotFound("Media");
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.alt !== void 0) updateData.alt = data.alt;
  if (data.caption !== void 0) updateData.caption = data.caption;
  if (data.folder !== void 0) updateData.folder = data.folder;
  const updated = await updateMediaRecord(id2, updateData);
  if (!updated) return serviceNotFound("Media");
  return serviceSuccess(updated, "Media updated.");
}
async function deleteMedia(id2) {
  const existing = await findMediaByIdRecord(id2);
  if (!existing) return serviceNotFound("Media");
  await deleteMediaRecord(id2);
  return serviceSuccess(null, "Media deleted.");
}
async function processUploadedFile(buffer, mimeType, id2) {
  const fileId = id2 ?? generateId();
  const extension = getExtensionFromMimeType(mimeType);
  const relativePath = generateMediaPath(fileId, extension);
  await writeStorageFile(relativePath, buffer);
  let width = null;
  let height = null;
  let thumbnailUrl = null;
  if (isImageMimeType(mimeType) && mimeType !== "image/svg+xml") {
    try {
      const metadata = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      const thumbRelativePath = generateThumbnailPath(fileId);
      const thumbnail = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).resize(300, 300, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
      await writeStorageFile(thumbRelativePath, thumbnail);
      if (mimeType !== "image/gif") {
        await Promise.all(
          [640, 1280].filter((responsiveWidth) => width !== null && width > responsiveWidth).map(async (responsiveWidth) => {
            const variant = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).resize({ width: responsiveWidth, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
            await writeStorageFile(relativePath.replace(/\.[^.]+$/, `_w${responsiveWidth}.webp`), variant);
          })
        );
      }
      thumbnailUrl = `/${thumbRelativePath}`;
    } catch {
    }
  }
  return {
    id: fileId,
    url: `/${relativePath}`,
    thumbnailUrl,
    width,
    height
  };
}
const uploadMediaSchema = z.object({
  // Optional display name (defaults to filename at the service layer)
  name: z.string().trim().max(255, "Name must be at most 255 characters").optional(),
  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull.pipe(z.string().max(500).nullable().optional()),
  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull.pipe(z.string().max(2e3).nullable().optional()),
  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull.pipe(z.string().max(255).nullable().optional())
});
const updateMediaSchema = z.object({
  // Optional name, but must be non-empty if provided
  name: z.string().trim().min(1, "Name must not be empty").max(255, "Name must be at most 255 characters").optional(),
  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull.pipe(z.string().max(500).nullable().optional()),
  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull.pipe(z.string().max(2e3).nullable().optional()),
  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull.pipe(z.string().max(255).nullable().optional())
});
async function deleteFileIfExists(fileUrl) {
  if (!fileUrl) return;
  try {
    const relativePath = fileUrl.replace(/^\/+/, "");
    const match = relativePath.match(/^storage\/([A-Za-z0-9_-]+?)(?:_(thumb|w640|w1280))?\.[A-Za-z0-9]+$/);
    if (!match) return;
    const fileId = match[1];
    const candidates = /* @__PURE__ */ new Set([
      relativePath,
      `storage/${fileId}_thumb.webp`,
      `storage/${fileId}_w640.webp`,
      `storage/${fileId}_w1280.webp`
    ]);
    for (const candidate of candidates) {
      await deleteStorageFile(candidate);
    }
  } catch {
  }
}
async function handleListMedia(session2, filters) {
  const perm = await requirePermission(session2, "media.view");
  if (perm) return perm;
  const result = await listMediaService(filters);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleGetMedia(session2, id2) {
  const perm = await requirePermission(session2, "media.view");
  if (perm) return perm;
  if (!id2) return adminError("Media id is required.", 400);
  const result = await getMedia(id2);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404);
}
async function handleUpdateMedia(session2, id2, body) {
  if (!id2) return adminError("Media id is required.", 400);
  const perm = await requirePermission(session2, "media.edit");
  if (perm) return perm;
  const parsed = parseWithSchema(updateMediaSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await updateMedia(id2, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteMedia(session2, id2) {
  if (!id2) return adminError("Media id is required.", 400);
  const perm = await requirePermission(session2, "media.delete");
  if (perm) return perm;
  const mediaResult = await getMedia(id2);
  if (!mediaResult.success) return adminError(mediaResult.error.message, 404);
  const result = await deleteMedia(id2);
  if (!result.success) return mapServiceError(result);
  await deleteFileIfExists(mediaResult.data.url);
  await deleteFileIfExists(mediaResult.data.thumbnailUrl);
  return adminSuccess(result.data, result.message);
}
async function handleBulkDeleteMedia(session2, ids) {
  const perm = await requirePermission(session2, "media.delete");
  if (perm) return perm;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const results = [];
  for (const id2 of parsedIds.ids) {
    const mediaResult = await getMedia(id2);
    if (!mediaResult.success) {
      results.push({ id: id2, success: false });
      continue;
    }
    const deleteResult = await deleteMedia(id2);
    results.push({ id: id2, success: deleteResult.success });
    if (deleteResult.success) {
      await deleteFileIfExists(mediaResult.data.url);
      await deleteFileIfExists(mediaResult.data.thumbnailUrl);
    }
  }
  return adminSuccess(results, "Bulk delete completed.");
}
async function handleUploadMedia(session2, formData) {
  const perm = await requirePermission(session2, "media.upload");
  if (perm) return perm;
  if (!isWithinRateLimit(`media-upload:user:${session2.user.id}`, 20, 15 * 60 * 1e3)) {
    return adminError("Too many uploads. Please try again later.", 429);
  }
  const metadata = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "file") metadata[key] = value;
  }
  const parsed = parseWithSchema(uploadMediaSchema, metadata);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await uploadMediaForUser(formData, session2.user.id, parsed.data);
  return result.success ? adminSuccess(result.data, "Media uploaded.") : mapServiceError(result);
}
async function handleListActivityLogs(session2, filters = {}) {
  const permission = await requirePermission(session2, "activity-log.view");
  if (permission) return permission;
  try {
    return adminSuccess(await listActivityLogs(filters));
  } catch (error) {
    console.error("Activity log list failed", error);
    return adminError("Activity log could not be loaded.", 500);
  }
}
function positiveInteger(value) {
  if (!value || !/^\d+$/.test(value)) return void 0;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : void 0;
}
function dateBoundary(value, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return void 0;
  const date = /* @__PURE__ */ new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}.000Z`);
  const timestamp2 = Math.floor(date.getTime() / 1e3);
  return Number.isFinite(timestamp2) ? timestamp2 : void 0;
}
const GET$g = async ({ request, locals }) => {
  const url = new URL(request.url);
  const filters = {
    page: positiveInteger(url.searchParams.get("page")),
    perPage: positiveInteger(url.searchParams.get("perPage")),
    search: url.searchParams.get("search")?.slice(0, 100) || void 0,
    action: url.searchParams.get("action")?.slice(0, 64) || void 0,
    resource: url.searchParams.get("resource")?.slice(0, 64) || void 0,
    from: dateBoundary(url.searchParams.get("from")),
    to: dateBoundary(url.searchParams.get("to"), true)
  };
  const success = url.searchParams.get("success");
  if (success === "true" || success === "false") filters.success = success === "true";
  return handleListActivityLogs(locals.session, filters);
};
const activityLogs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$g
}, Symbol.toStringTag, { value: "Module" }));
const POST$v = async ({ request, cookies, locals }) => {
  const response = await handleTwoFactorDisable(
    locals.session,
    await request.json()
  );
  if (response.ok) {
    clearAdminSessionCookies(cookies);
    clearAdminTwoFactorChallengeCookie(cookies);
  }
  return response;
};
const disable$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$v
}, Symbol.toStringTag, { value: "Module" }));
const POST$u = async ({ request, cookies, locals }) => {
  const response = await handleTwoFactorEnable(
    locals.session,
    await request.json()
  );
  if (response.ok) {
    clearAdminSessionCookies(cookies);
    clearAdminTwoFactorChallengeCookie(cookies);
  }
  return response;
};
const enable = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$u
}, Symbol.toStringTag, { value: "Module" }));
const POST$t = async ({ locals }) => {
  return handleTwoFactorSetup(locals.session);
};
const setup = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$t
}, Symbol.toStringTag, { value: "Module" }));
const GET$f = async ({ locals }) => {
  return handleTwoFactorStatus(locals.session);
};
const status$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$f
}, Symbol.toStringTag, { value: "Module" }));
async function establishAdminSession(user, cookies, options = {}) {
  const permissions = await getUserPermissions(user.id);
  const sessionId = generateId();
  const twoFactorVerified = options.twoFactorVerified === true;
  const accessToken = await signAccessToken({
    sub: user.id,
    sessionId,
    email: user.email,
    role: user.role,
    permissions,
    twoFactorVerified
  });
  const refreshToken = await signRefreshToken({
    sub: user.id,
    sessionId,
    email: user.email,
    twoFactorVerified
  });
  if (!isSuperAdminUserId(user.id)) {
    await saveRefreshSession(sessionId, user.id, getRefreshSessionExpiry());
  }
  cookies.set(ADMIN_ACCESS_COOKIE, accessToken, buildAdminAccessCookieOptions());
  cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, buildAdminRefreshCookieOptions());
  return { user, permissions, twoFactorEnabled: await isTwoFactorEnabled(user.id) };
}
const POST$s = async ({ request, cookies }) => {
  const parsed = twoFactorCodeSchema.safeParse(await request.json());
  if (!parsed.success) return adminError("Authenticator code must be 6 digits.", 422);
  const challenge = readAdminTwoFactorChallenge(cookies);
  if (!challenge) return adminError("Two-factor login has expired. Please sign in again.", 401);
  try {
    const payload = await verifyTwoFactorChallengeToken(challenge);
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return adminError("Invalid two-factor login.", 401);
    }
    if (!isWithinRateLimit(`login:2fa:${payload.sub}`, 5, 15 * 60 * 1e3)) {
      return adminError("Too many requests. Please try again later.", 429);
    }
    const user = await findSafeUserByIdRecord(payload.sub);
    if (!user || user.email !== payload.email || !await verifyTwoFactorCode(user.id, parsed.data.code)) {
      return adminError("Invalid authenticator code.", 401);
    }
    const session2 = await establishAdminSession(user, cookies, { twoFactorVerified: true });
    clearAdminTwoFactorChallengeCookie(cookies);
    return Response.json({ success: true, message: "Login successful.", data: session2 });
  } catch {
    clearAdminSessionCookies(cookies);
    clearAdminTwoFactorChallengeCookie(cookies);
    return adminError("Two-factor login has expired. Please sign in again.", 401);
  }
};
const verify = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$s
}, Symbol.toStringTag, { value: "Module" }));
const POST$r = async ({ request, cookies }) => {
  const body = await request.json();
  const result = await handlePasswordLogin(body, clientAddress(request));
  if (!result.success || !result.user) {
    return Response.json({ success: false, message: result.message }, { status: result.status });
  }
  if (result.requiresTwoFactor) {
    const challenge = await signTwoFactorChallengeToken({
      sub: result.user.id,
      email: result.user.email
    });
    clearAdminSessionCookies(cookies);
    cookies.set(ADMIN_2FA_CHALLENGE_COOKIE, challenge, buildAdminTwoFactorChallengeCookieOptions());
    return Response.json({
      success: true,
      message: "Authenticator code required.",
      data: { requiresTwoFactor: true }
    }, { status: 202 });
  }
  clearAdminTwoFactorChallengeCookie(cookies);
  const session2 = await establishAdminSession(result.user, cookies);
  return Response.json({
    success: true,
    message: "Login successful.",
    data: session2
  });
};
const login = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$r
}, Symbol.toStringTag, { value: "Module" }));
const POST$q = async ({ cookies }) => {
  const refresh2 = readAdminRefreshToken(cookies);
  if (refresh2) {
    try {
      const payload = await verifyRefreshToken(refresh2);
      await deleteRefreshSession(payload.sessionId);
    } catch {
    }
  }
  cookies.set(ADMIN_ACCESS_COOKIE, "", { ...buildAdminAccessCookieOptions(), maxAge: 0 });
  cookies.set(ADMIN_REFRESH_COOKIE, "", { ...buildAdminRefreshCookieOptions(), maxAge: 0 });
  clearAdminTwoFactorChallengeCookie(cookies);
  return Response.json({ success: true, message: "Logged out." });
};
const logout = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$q
}, Symbol.toStringTag, { value: "Module" }));
const PUT$6 = async ({ request, locals }) => {
  const body = await request.json();
  return handleUpdateProfile(locals.session, body);
};
const profile = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PUT: PUT$6
}, Symbol.toStringTag, { value: "Module" }));
const POST$p = async ({ cookies }) => {
  const session2 = await refreshAdminSession(cookies);
  if (!session2) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }
  return Response.json({ success: true, data: session2 });
};
const refresh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$p
}, Symbol.toStringTag, { value: "Module" }));
const GET$e = async ({ cookies }) => {
  let session2 = await getAdminSession(cookies);
  if (!session2) {
    session2 = await refreshAdminSession(cookies);
  }
  if (!session2) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }
  const roleName = getStaticRoleName(session2.user.role);
  return Response.json({
    success: true,
    data: {
      user: session2.user,
      permissions: session2.permissions,
      roleName,
      twoFactorEnabled: session2.twoFactorEnabled
    }
  });
};
const session = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$e
}, Symbol.toStringTag, { value: "Module" }));
const GET$d = async ({ params, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400);
  return handleGetCategory(locals.session, params.id);
};
const PUT$5 = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400);
  const body = await request.json();
  return handleUpdateCategory(locals.session, params.id, body);
};
const DELETE$5 = async ({ params, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400);
  return handleDeleteCategory(locals.session, params.id);
};
const _id_$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$5,
  GET: GET$d,
  PUT: PUT$5
}, Symbol.toStringTag, { value: "Module" }));
const POST$o = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "Category id is required." }), { status: 400 });
  }
  return handleDuplicateCategory(locals.session, params.id);
};
const duplicate$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$o
}, Symbol.toStringTag, { value: "Module" }));
const POST$n = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return await handleBulkDeleteCategories(locals.session, ids);
};
const _delete$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$n
}, Symbol.toStringTag, { value: "Module" }));
const POST$m = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return await handleBulkDuplicateCategories(locals.session, ids);
};
const duplicate$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$m
}, Symbol.toStringTag, { value: "Module" }));
const POST$l = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  const status2 = body?.status === "published" || body?.status === "draft" ? body.status : null;
  if (!status2) return Response.json({ success: false, message: "Invalid category status." }, { status: 422 });
  return handleBulkUpdateCategoryStatus(locals.session, ids, status2);
};
const status = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$l
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$3 = /* @__PURE__ */ new Set(["name", "createdAt"]);
const VALID_SORT_ORDER$3 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$c = async ({ request, locals }) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || void 0;
  const search2 = url.searchParams.get("search") || void 0;
  const statusParam = url.searchParams.get("status");
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const sortByValid = sortBy && VALID_SORT_BY$3.has(sortBy) ? sortBy : void 0;
  const sortOrderValid = sortOrder && VALID_SORT_ORDER$3.has(sortOrder) ? sortOrder : void 0;
  const status2 = statusParam === "draft" || statusParam === "published" ? statusParam : void 0;
  return handleListCategories(locals.session, { type, search: search2, status: status2, sortBy: sortByValid, sortOrder: sortOrderValid });
};
const POST$k = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateCategory(locals.session, body);
};
const index$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$c,
  POST: POST$k
}, Symbol.toStringTag, { value: "Module" }));
const GET$b = async ({ locals }) => {
  const session2 = locals.session;
  const permission = await requirePermission(session2, "dashboard.view");
  if (permission) return permission;
  const user = await findUserByIdRecord(session2.user.id);
  const stats = await getDashboardStatsRecord(user?.role === "author" ? user.id : void 0);
  return adminSuccess(stats);
};
const dashboard = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$b
}, Symbol.toStringTag, { value: "Module" }));
const GET$a = async ({ params, locals }) => {
  return handleGetMedia(locals.session, params.id);
};
const PUT$4 = async ({ params, request, locals }) => {
  const body = await request.json();
  return handleUpdateMedia(locals.session, params.id, body);
};
const DELETE$4 = async ({ params, locals }) => {
  return handleDeleteMedia(locals.session, params.id);
};
const _id_$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$4,
  GET: GET$a,
  PUT: PUT$4
}, Symbol.toStringTag, { value: "Module" }));
const POST$j = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return handleBulkDeleteMedia(locals.session, ids);
};
const _delete$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$j
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$2 = /* @__PURE__ */ new Set(["name", "createdAt", "size"]);
const VALID_SORT_ORDER$2 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$9 = async ({ request, locals }) => {
  const url = new URL(request.url);
  const filters = {};
  const page = url.searchParams.get("page");
  const perPage = url.searchParams.get("perPage");
  const search2 = url.searchParams.get("search");
  const folder = url.searchParams.get("folder");
  const mimeType = url.searchParams.get("mimeType");
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  if (page) filters.page = Number(page);
  if (perPage) filters.perPage = Number(perPage);
  if (search2) filters.search = search2;
  if (folder === "") filters.folder = null;
  else if (folder) filters.folder = folder;
  if (mimeType) filters.mimeType = mimeType;
  if (sortBy && VALID_SORT_BY$2.has(sortBy)) filters.sortBy = sortBy;
  if (sortOrder && VALID_SORT_ORDER$2.has(sortOrder)) filters.sortOrder = sortOrder;
  return handleListMedia(locals.session, filters);
};
const POST$i = async ({ request, locals }) => {
  const formData = await request.formData();
  return handleUploadMedia(locals.session, formData);
};
const index$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$9,
  POST: POST$i
}, Symbol.toStringTag, { value: "Module" }));
const POST$h = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    return handleUploadMedia(locals.session, formData);
  } catch {
    return Response.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
};
const upload = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$h
}, Symbol.toStringTag, { value: "Module" }));
const GET$8 = async ({ params, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400);
  return handleGetMenu(locals.session, params.id);
};
const PUT$3 = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400);
  const body = await request.json();
  return handleUpdateMenu(locals.session, params.id, body);
};
const DELETE$3 = async ({ params, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400);
  return handleDeleteMenu(locals.session, params.id);
};
const _id_$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$3,
  GET: GET$8,
  PUT: PUT$3
}, Symbol.toStringTag, { value: "Module" }));
const GET$7 = async ({ locals }) => {
  return handleListMenus(locals.session);
};
const POST$g = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateMenu(locals.session, body);
};
const index$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$7,
  POST: POST$g
}, Symbol.toStringTag, { value: "Module" }));
const POST$f = async ({ request, locals }) => {
  const body = await request.json();
  return handleReorderMenus(locals.session, body);
};
const reorder = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$f
}, Symbol.toStringTag, { value: "Module" }));
const GET$6 = async ({ params, locals }) => {
  return handleGetPost(locals.session, params.id);
};
const PUT$2 = async ({ params, request, locals }) => {
  const body = await request.json();
  return await handleUpdatePost(locals.session, params.id, body);
};
const DELETE$2 = async ({ params, locals }) => {
  return await handleDeletePost(locals.session, params.id);
};
const _id_$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$2,
  GET: GET$6,
  PUT: PUT$2
}, Symbol.toStringTag, { value: "Module" }));
const POST$e = async ({ params, locals }) => {
  return await handleDuplicatePost(locals.session, params.id);
};
const duplicate$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$e
}, Symbol.toStringTag, { value: "Module" }));
const DELETE$1 = async ({ params, locals }) => {
  return handlePermanentlyDeletePost(locals.session, params.id);
};
const permanentDelete$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$1
}, Symbol.toStringTag, { value: "Module" }));
const POST$d = async ({ params, locals }) => {
  return handleRestorePost(locals.session, params.id);
};
const restore$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$d
}, Symbol.toStringTag, { value: "Module" }));
const POST$c = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return await handleBulkDeletePosts(locals.session, ids);
};
const _delete$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$c
}, Symbol.toStringTag, { value: "Module" }));
const POST$b = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return await handleBulkDuplicatePosts(locals.session, ids);
};
const duplicate$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$b
}, Symbol.toStringTag, { value: "Module" }));
const POST$a = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return handleBulkPermanentlyDeletePosts(locals.session, ids);
};
const permanentDelete = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$a
}, Symbol.toStringTag, { value: "Module" }));
const POST$9 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return await handleBulkPublishPosts(locals.session, ids);
};
const publish = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$9
}, Symbol.toStringTag, { value: "Module" }));
const POST$8 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return handleBulkRestorePosts(locals.session, ids);
};
const restore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$8
}, Symbol.toStringTag, { value: "Module" }));
const POST$7 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return await handleBulkUnpublishPosts(locals.session, ids);
};
const unpublish = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$7
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$1 = /* @__PURE__ */ new Set(["title", "updatedAt"]);
const VALID_SORT_ORDER$1 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$5 = async ({ request, locals }) => {
  const url = new URL(request.url);
  const filters = {};
  const search2 = url.searchParams.get("search");
  const status2 = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const trash = url.searchParams.get("trash");
  if (search2) filters.search = search2;
  if (status2) filters.status = status2;
  if (type) filters.type = type;
  if (sortBy && VALID_SORT_BY$1.has(sortBy)) filters.sortBy = sortBy;
  if (sortOrder && VALID_SORT_ORDER$1.has(sortOrder)) filters.sortOrder = sortOrder;
  if (trash === "1" || trash === "true") filters.trash = true;
  return handleListPosts(locals.session, filters);
};
const POST$6 = async ({ request, locals }) => {
  const body = await request.json();
  return await handleCreatePost(locals.session, body);
};
const index$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$5,
  POST: POST$6
}, Symbol.toStringTag, { value: "Module" }));
const GET$4 = async ({ locals }) => {
  return handleGetSettings(locals.session);
};
const PUT$1 = async ({ request, locals }) => {
  const body = await request.json();
  return handleUpdateSettings(locals.session, body);
};
const settings = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$4,
  PUT: PUT$1
}, Symbol.toStringTag, { value: "Module" }));
const GET$3 = async ({ params, locals }) => {
  if (!params.id) return adminError("User id is required.", 400);
  return handleGetUser(locals.session, params.id);
};
const PUT = async ({ params, request, locals }) => {
  if (!params.id) return adminError("User id is required.", 400);
  const body = await request.json();
  return handleUpdateUser(locals.session, params.id, body);
};
const DELETE = async ({ params, locals }) => {
  if (!params.id) return adminError("User id is required.", 400);
  return handleDeleteUser(locals.session, params.id);
};
const _id_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  GET: GET$3,
  PUT
}, Symbol.toStringTag, { value: "Module" }));
const POST$5 = async ({ params, locals }) => {
  if (!params.id) return adminError("User id is required.", 400);
  return handleDisableUserTwoFactor(locals.session, params.id);
};
const disable = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$5
}, Symbol.toStringTag, { value: "Module" }));
const POST$4 = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "User id is required." }), { status: 400 });
  }
  return handleDuplicateUser(locals.session, params.id);
};
const duplicate$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$4
}, Symbol.toStringTag, { value: "Module" }));
const POST$3 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return handleBulkDeleteUsers(locals.session, ids);
};
const _delete = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$3
}, Symbol.toStringTag, { value: "Module" }));
const POST$2 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id2) => typeof id2 === "string") : [];
  return handleBulkDuplicateUsers(locals.session, ids);
};
const duplicate = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$2
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY = /* @__PURE__ */ new Set(["name", "email", "createdAt", "updatedAt"]);
const VALID_SORT_ORDER = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$2 = async ({ request, locals }) => {
  const url = new URL(request.url);
  const search2 = url.searchParams.get("search") || void 0;
  const roleValue = url.searchParams.get("role");
  const role = isStaticRole(roleValue) ? roleValue : void 0;
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const sortByValid = sortBy && VALID_SORT_BY.has(sortBy) ? sortBy : void 0;
  const sortOrderValid = sortOrder && VALID_SORT_ORDER.has(sortOrder) ? sortOrder : void 0;
  return handleListUsers(locals.session, { search: search2, role, sortBy: sortByValid, sortOrder: sortOrderValid });
};
const POST$1 = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateUser(locals.session, body);
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$2,
  POST: POST$1
}, Symbol.toStringTag, { value: "Module" }));
const GET$1 = async ({ params, request }) => {
  const registry = getServerContentTypeRegistry();
  const type = params.type;
  if (!type || !registry.contentTypes.some((contentType) => contentType.slug === type)) {
    return Response.json({ message: "Content type not found." }, { status: 404 });
  }
  const url = new URL(request.url);
  const requestedPage = Number(url.searchParams.get("page") ?? 1);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const result = await listPublishedPostsByType(type, page, 10, {
    search: url.searchParams.get("search") ?? void 0,
    category: url.searchParams.get("category") ?? void 0,
    tag: url.searchParams.get("tag") ?? void 0,
    customFields: getPublicCustomFieldFiltersFromSearchParams(type, url.searchParams)
  });
  if (!result.success) return Response.json({ message: result.error.message }, { status: 500 });
  return Response.json(result.data);
};
const _type_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$1
}, Symbol.toStringTag, { value: "Module" }));
const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().max(200).refine((value) => !/[\r\n]/.test(value), "Subject contains invalid line breaks").optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5e3),
  turnstileToken: z.string().trim().min(1).max(2048).optional()
});
function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}
async function verifyTurnstile(token, request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const required = process.env.CONTACT_TURNSTILE_REQUIRED === "true" || process.env.NODE_ENV !== "development" && !isTestEnvironment();
  if (!secret) return required ? "Turnstile is not configured." : null;
  if (!token) return "Turnstile verification is required.";
  try {
    const body = new URLSearchParams({ secret, response: token });
    const remoteIp = clientAddress(request);
    if (remoteIp !== "unknown") body.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(5e3)
    });
    const result = await response.json();
    return result.success === true ? null : "Turnstile verification failed.";
  } catch {
    return "Turnstile verification is unavailable.";
  }
}
const POST = async ({ request }) => {
  const client = clientAddress(request);
  if (!isWithinRateLimit(`contact:${client}`, 5, 15 * 60 * 1e3)) {
    return Response.json({ success: false, message: "Too many requests. Please try again later." }, { status: 429 });
  }
  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, message: "Please complete all required fields." }, { status: 422 });
  if (!isWithinRateLimit(`contact:email:${parsed.data.email.toLowerCase()}`, 3, 15 * 60 * 1e3)) {
    return Response.json({ success: false, message: "Too many requests. Please try again later." }, { status: 429 });
  }
  const turnstileError = await verifyTurnstile(parsed.data.turnstileToken, request);
  if (turnstileError) {
    return Response.json({ success: false, message: turnstileError }, { status: !process.env.TURNSTILE_SECRET_KEY ? 503 : 403 });
  }
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const recipients = (await getSiteSettings()).email_notifications;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from || recipients.length === 0 || Boolean(user) !== Boolean(password)) {
    return Response.json({ success: false, message: "Contact email is not configured." }, { status: 503 });
  }
  const { name, email, subject, message } = parsed.data;
  try {
    await nodemailer.createTransport({ host, port, secure: process.env.SMTP_SECURE === "true", auth: user && password ? { user, pass: password } : void 0 }).sendMail({
      to: recipients,
      from,
      replyTo: email,
      subject: `[Contact] ${subject || "New message"}`,
      text: `Name: ${name}
Email: ${email}
Subject: ${subject || "-"}

${message}`,
      html: `<h1>New contact message</h1><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Subject:</strong> ${escapeHtml(subject || "-")}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`
    });
  } catch (error) {
    console.error("Contact email delivery failed", error);
    return Response.json({ success: false, message: "Unable to send your message. Please try again." }, { status: 502 });
  }
  return Response.json({ success: true, message: "Message sent." }, { status: 201 });
};
const contact = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: "Module" }));
const GET = async ({ request }) => {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (query.length < 2) return Response.json({ data: [] });
  const result = await searchPublishedPosts(query, 1, 10);
  return Response.json({ data: result.success ? result.data.data : [] });
};
const search = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
export {
  activityLogs$1 as activityLogs,
  adminRefreshSessions,
  adminTwoFactor,
  apiApp,
  categories,
  categoriesRelations,
  closeDatabase,
  databaseDialect,
  deleteStorageFile,
  formatSeedDataSummary,
  generateSuperAdminTwoFactorSetup,
  getMenuTree,
  getPublicCustomFieldFiltersFromSearchParams,
  getPublishedArchiveFilterOptions,
  getPublishedPostByType,
  getSiteSettings,
  getStorageDir,
  getStorageType,
  listPublishedPostsByTag,
  listPublishedPostsByType,
  media,
  mediaRelations,
  menus,
  menusRelations,
  migrate,
  parseSeedData,
  passwordResetTokens,
  postCategories,
  postCategoriesRelations,
  posts,
  postsRelations,
  purgeExpiredActivityLogs,
  readStorageFile,
  resetDatabase,
  resetSuperAdminPassword,
  runSchedulingWorker,
  runSchedulingWorkerCycle,
  sanitizeHtml,
  schema,
  searchPublishedPosts,
  seed,
  settings$1 as settings,
  users,
  usersRelations,
  writeStorageFile
};
