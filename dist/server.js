import { existsSync, readFileSync, mkdirSync, chmodSync, lstatSync, statSync, writeFileSync, renameSync, unlinkSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";
import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { createHash, randomUUID } from "node:crypto";
import { relations, or, like, eq, and, count, desc, asc, inArray, gt, lt, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { readFile } from "node:fs/promises";
import { ulid } from "ulidx";
import sanitizeHtmlLibrary from "sanitize-html";
import sharp from "sharp";
import { jwtVerify, SignJWT } from "jose";
import { unlink } from "fs/promises";
import path from "path";
import fs from "fs";
import { z } from "zod";
import nodemailer from "nodemailer";
import { isIP } from "node:net";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
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
function normalizePath(value) {
  const segment = value?.trim().replace(/^\/+|\/+$/g, "") || process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "") || "admin";
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(segment)) {
    throw new Error("beaver adminPath must be a single URL segment, such as panel-rahasia.");
  }
  return `/${segment}`;
}
function resolveRegistry(value, defaultFile, optionName) {
  const filePath = value instanceof URL ? fileURLToPath(value) : value ? resolve(process.cwd(), value) : fileURLToPath(new URL(defaultFile, import.meta.url));
  if (!filePath.endsWith(".json")) {
    throw new Error(`beaver ${optionName} must point to a JSON file.`);
  }
  if (!existsSync(filePath)) {
    throw new Error(`beaver ${optionName} does not exist: ${filePath}`);
  }
  return filePath;
}
function readRegistry(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}
function beaver(options = {}) {
  const adminPath = normalizePath(options.adminPath);
  const registries = {
    "@content-type-registry": resolveRegistry(options.contentTypeRegistry, "./registry/content-types.json", "contentTypeRegistry"),
    "@section-registry": resolveRegistry(options.sectionRegistry, "./registry/sections.json", "sectionRegistry"),
    "@menu-group-registry": resolveRegistry(options.menuGroupRegistry, "./registry/menu-groups.json", "menuGroupRegistry")
  };
  process.env.BEAVER_CONTENT_TYPE_REGISTRY_PATH = registries["@content-type-registry"];
  process.env.BEAVER_SECTION_REGISTRY_PATH = registries["@section-registry"];
  process.env.BEAVER_MENU_GROUP_REGISTRY_PATH = registries["@menu-group-registry"];
  setContentTypeRegistry(readRegistry(registries["@content-type-registry"]));
  const compatShim = fileURLToPath(new URL("./compat/use-sync-external-store.js", import.meta.url));
  return {
    name: "@zbeaver/beaver",
    hooks: {
      "astro:config:setup": ({ addMiddleware, injectRoute, updateConfig }) => {
        updateConfig({
          vite: {
            resolve: {
              alias: [
                { find: /^use-sync-external-store(\/.*)?$/, replacement: compatShim },
                { find: "use-sync-external-store/shim/index.js", replacement: compatShim },
                { find: "use-sync-external-store/shim/with-selector.js", replacement: compatShim },
                { find: "use-sync-external-store/shim/index", replacement: compatShim },
                { find: "use-sync-external-store/shim/with-selector", replacement: compatShim },
                { find: "use-sync-external-store/shim", replacement: compatShim },
                { find: "use-sync-external-store", replacement: compatShim },
                ...Object.entries(registries).map(([find, replacement]) => ({ find, replacement }))
              ]
            },
            define: { __ADMIN_PATH__: JSON.stringify(adminPath) },
            ssr: { noExternal: ["@zbeaver/beaver"] },
            optimizeDeps: {
              include: [
                "highlight.js/lib/core"
              ]
            }
          }
        });
        injectRoute({ pattern: "/__cms/control-panel", entrypoint: new URL("./astro/admin.astro", import.meta.url), prerender: false });
        injectRoute({ pattern: "/__cms/http", entrypoint: new URL("./astro/http.js", import.meta.url), prerender: false });
        addMiddleware({ entrypoint: new URL("./astro/middleware.js", import.meta.url), order: "pre" });
      }
    }
  };
}
const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  roleId: text("role_id").references(() => roles.id),
  emailVerified: integer("email_verified").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const adminRefreshSessions = sqliteTable("admin_refresh_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull()
});
const posts = sqliteTable("posts", {
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
  authorId: text("author_id").notNull().references(() => users.id),
  publishedAt: integer("published_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const menus = sqliteTable("menus", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  position: integer("position").notNull().default(0),
  parentId: text("parent_id").references(() => menus.id),
  cssClass: text("css_class"),
  target: text("target"),
  image: text("image"),
  status: text("status").notNull().default("published"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const categories = sqliteTable("categories", {
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
const postCategories = sqliteTable("post_categories", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull()
});
const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isSystem: integer("is_system").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  group: text("group").notNull(),
  description: text("description"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const rolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey(),
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull()
});
const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
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
const settings$1 = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id]
  }),
  posts: many(posts),
  media: many(media)
}));
const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  postCategories: many(postCategories)
}));
const categoriesRelations = relations(categories, ({ many }) => ({
  postCategories: many(postCategories)
}));
const postCategoriesRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id]
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id]
  })
}));
const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions)
}));
const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}));
const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  })
}));
const mediaRelations = relations(media, ({ one }) => ({
  user: one(users, {
    fields: [media.userId],
    references: [users.id]
  })
}));
const menusRelations = relations(menus, ({ one, many }) => ({
  parent: one(menus, {
    fields: [menus.parentId],
    references: [menus.id],
    relationName: "menuParentChild"
  }),
  children: many(menus, {
    relationName: "menuParentChild"
  })
}));
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adminRefreshSessions,
  categories,
  categoriesRelations,
  media,
  mediaRelations,
  menus,
  menusRelations,
  permissions,
  permissionsRelations,
  postCategories,
  postCategoriesRelations,
  posts,
  postsRelations,
  rolePermissions,
  rolePermissionsRelations,
  roles,
  rolesRelations,
  settings: settings$1,
  users,
  usersRelations
}, Symbol.toStringTag, { value: "Module" }));
const dbPath = process.env.DATABASE_URL || "./db/sqlite.db";
const isFileDatabase = dbPath !== ":memory:" && !dbPath.startsWith("file:");
const dbDir = isFileDatabase ? dirname(dbPath) : null;
if (dbDir && dbDir !== "." && dbDir !== "") {
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true, mode: 448 });
  chmodSync(dbDir, 448);
}
const sqlite = new Database(dbPath);
if (isFileDatabase) {
  chmodSync(dbPath, 384);
}
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
if (isFileDatabase) {
  for (const suffix of ["-wal", "-shm"]) {
    const journalPath = `${dbPath}${suffix}`;
    if (existsSync(journalPath)) chmodSync(journalPath, 384);
  }
}
const db = drizzle(sqlite, { schema });
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
const MAX_PAGE = 1e4;
const MAX_PER_PAGE = 100;
function clampPage(value, fallback = 1) {
  return typeof value === "number" && Number.isSafeInteger(value) ? Math.min(MAX_PAGE, Math.max(1, value)) : fallback;
}
function clampPerPage(value, fallback = 20) {
  return typeof value === "number" && Number.isSafeInteger(value) ? Math.min(MAX_PER_PAGE, Math.max(1, value)) : fallback;
}
function clampPagination(filters) {
  const page = clampPage(filters.page);
  const perPage = clampPerPage(filters.perPage);
  return { page, perPage, offset: (page - 1) * perPage };
}
const MAX_FILTER_TEXT_LENGTH$2 = 100;
function toSafe(user) {
  const safe = { ...user };
  Reflect.deleteProperty(safe, "password");
  return safe;
}
function findUserByIdRecord(id) {
  return db.select().from(users).where(eq(users.id, id)).get();
}
function findUserByEmailRecord(email) {
  return db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
}
function listUsersPaginatedRecord(filters) {
  const { page, perPage, offset } = clampPagination(filters);
  const conditions = [];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH$2);
  const roleId = filters.roleId?.slice(0, 128);
  if (search2) {
    conditions.push(
      or(like(users.name, `%${search2}%`), like(users.email, `%${search2}%`))
    );
  }
  if (roleId) {
    conditions.push(eq(users.roleId, roleId));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const totalQuery = db.select({ value: count() }).from(users);
  const totalRows = whereClause ? totalQuery.where(whereClause).all() : totalQuery.all();
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
    roleId: users.roleId,
    emailVerified: users.emailVerified,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    roleName: roles.name
  }).from(users).leftJoin(roles, eq(users.roleId, roles.id));
  const paged = (whereClause ? dataQuery.where(whereClause) : dataQuery).orderBy(orderColumn).limit(perPage).offset(offset).all();
  return {
    data: paged,
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
function createUserRecord(input) {
  db.insert(users).values({
    id: input.id,
    name: sanitizeText(input.name),
    email: input.email.toLowerCase().trim(),
    password: input.passwordHash,
    roleId: input.roleId,
    emailVerified: 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
  }).run();
  return findSafeUserByIdRecord(input.id);
}
function updateUserRecord(id, input) {
  const updates = { updatedAt: input.updatedAt };
  if (input.name !== void 0) updates.name = sanitizeText(input.name);
  if (input.email !== void 0) updates.email = input.email.toLowerCase().trim();
  if (input.passwordHash !== void 0) updates.password = input.passwordHash;
  if (input.roleId !== void 0) updates.roleId = input.roleId;
  db.update(users).set(updates).where(eq(users.id, id)).run();
  return findSafeUserByIdRecord(id) ?? null;
}
function deleteUserRecord(id) {
  return db.delete(users).where(eq(users.id, id)).run().changes > 0;
}
function findSafeUserByIdRecord(id) {
  const user = findUserByIdRecord(id);
  return user ? toSafe(user) : null;
}
async function getUserRole(userId) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { roleId: true }
  });
  if (!user?.roleId) return null;
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, user.roleId),
    columns: { isSystem: true }
  });
  if (!role) return null;
  return { roleId: user.roleId, isSystem: role.isSystem === 1 };
}
async function getUserPermissions(userId) {
  const userRole = await getUserRole(userId);
  if (!userRole) return [];
  if (userRole.isSystem) {
    const allPermissions = db.select({ slug: permissions.slug }).from(permissions).all();
    return allPermissions.map((permission) => permission.slug);
  }
  const rolePerms = await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.roleId, userRole.roleId),
    with: { permission: true }
  });
  return rolePerms.map((rolePermission) => rolePermission.permission.slug);
}
async function can(userId, permission) {
  const userRole = await getUserRole(userId);
  if (userRole?.isSystem) return true;
  return (await getUserPermissions(userId)).includes(permission);
}
async function canAny(userId, permissions2) {
  const userRole = await getUserRole(userId);
  if (userRole?.isSystem) return true;
  const userPermissions = await getUserPermissions(userId);
  return permissions2.some((permission) => userPermissions.includes(permission));
}
const ADMIN_ACCESS_COOKIE = "admin_access_token";
const ADMIN_REFRESH_COOKIE = "admin_refresh_token";
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
function readAdminAccessToken(cookies) {
  return cookies.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
}
function readAdminRefreshToken(cookies) {
  return cookies.get(ADMIN_REFRESH_COOKIE)?.value ?? null;
}
const SECRET_NAMES = ["SESSION_SECRET", "ADMIN_JWT_ACCESS_SECRET", "ADMIN_JWT_REFRESH_SECRET"];
const PLACEHOLDER_VALUES = /* @__PURE__ */ new Set([
  "change-me",
  "change-this-password",
  "admin@example.com",
  "password123"
]);
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
function assertSecureSeedEnvironment() {
  if (isTestEnvironment()) return;
  assertSecureSecrets();
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim();
  if (!email || email.length > 254 || !/^.+@.+\..+$/.test(email) || !password || password.length < 12 || password.length > 128 || !name || name.length > 100) {
    throw new Error("Seeding requires ADMIN_EMAIL, ADMIN_NAME, and an ADMIN_PASSWORD of at least 12 characters.");
  }
  if (PLACEHOLDER_VALUES.has(email) || PLACEHOLDER_VALUES.has(password)) {
    throw new Error("Seeding does not allow placeholder administrator credentials.");
  }
}
function getSeedAdminCredentials() {
  if (isTestEnvironment()) {
    return {
      email: process.env.ADMIN_EMAIL?.trim() || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "password123",
      name: process.env.ADMIN_NAME?.trim() || "Super Admin"
    };
  }
  assertSecureSeedEnvironment();
  return {
    email: process.env.ADMIN_EMAIL.trim(),
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME.trim()
  };
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
async function verifyAccessToken(token) {
  const result = await jwtVerify(token, getAccessSecret(), { algorithms: ["HS256"] });
  return result.payload;
}
async function verifyRefreshToken(token) {
  const result = await jwtVerify(token, getRefreshSecret(), { algorithms: ["HS256"] });
  return result.payload;
}
function generateId() {
  return ulid();
}
function slugify(input) {
  let slug = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  if (slug.length > 200) {
    slug = slug.slice(0, 200).replace(/-+$/, "");
  }
  return slug;
}
function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1e3);
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
function saveRefreshSession(sessionId, userId, expiresAt) {
  db.insert(adminRefreshSessions).values({
    id: sessionId,
    userId,
    expiresAt: normalizeExpiry(expiresAt),
    createdAt: getCurrentTimestamp()
  }).run();
}
function deleteRefreshSession(sessionId) {
  db.delete(adminRefreshSessions).where(eq(adminRefreshSessions.id, sessionId)).run();
}
function deleteRefreshSessionsForUser(userId) {
  db.delete(adminRefreshSessions).where(eq(adminRefreshSessions.userId, userId)).run();
}
function deleteRefreshSessionsForRole(roleId) {
  const roleUsers = db.select({ id: users.id }).from(users).where(eq(users.roleId, roleId)).all();
  if (roleUsers.length === 0) return;
  db.delete(adminRefreshSessions).where(inArray(adminRefreshSessions.userId, roleUsers.map((user) => user.id))).run();
}
function findActiveRefreshSession(sessionId) {
  const now = getCurrentTimestamp();
  const row = db.select({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt }).from(adminRefreshSessions).where(and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now))).get();
  return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null;
}
function consumeRefreshSession(sessionId) {
  const now = getCurrentTimestamp();
  const row = db.delete(adminRefreshSessions).where(and(eq(adminRefreshSessions.id, sessionId), activeExpiryCondition(now))).returning({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt }).get();
  return row ? { ...row, expiresAt: normalizeExpiry(row.expiresAt) } : null;
}
async function getAdminSession(cookies) {
  const access = readAdminAccessToken(cookies);
  if (!access) return null;
  try {
    const payload = await verifyAccessToken(access);
    if (typeof payload.sessionId !== "string") return null;
    const stored = findActiveRefreshSession(payload.sessionId);
    if (!stored || stored.userId !== payload.sub) return null;
    const user = findSafeUserByIdRecord(payload.sub);
    if (!user) return null;
    return { user, permissions: await getUserPermissions(user.id) };
  } catch {
    return null;
  }
}
async function refreshAdminSession(cookies) {
  const refresh2 = readAdminRefreshToken(cookies);
  if (!refresh2) return null;
  try {
    const payload = await verifyRefreshToken(refresh2);
    const stored = consumeRefreshSession(payload.sessionId);
    if (!stored || stored.userId !== payload.sub) return null;
    const user = findSafeUserByIdRecord(payload.sub);
    if (!user) return null;
    const permissions2 = await getUserPermissions(user.id);
    const nextSessionId = crypto.randomUUID();
    const nextAccess = await signAccessToken({
      sub: user.id,
      sessionId: nextSessionId,
      email: user.email,
      roleId: user.roleId,
      permissions: permissions2
    });
    const nextRefresh = await signRefreshToken({
      sub: user.id,
      sessionId: nextSessionId
    });
    saveRefreshSession(nextSessionId, user.id, getRefreshSessionExpiry());
    cookies.set(ADMIN_ACCESS_COOKIE, nextAccess, buildAdminAccessCookieOptions());
    cookies.set(ADMIN_REFRESH_COOKIE, nextRefresh, buildAdminRefreshCookieOptions());
    return { user, permissions: permissions2 };
  } catch {
    return null;
  }
}
const RATE_LIMITS = /* @__PURE__ */ new Map();
const MAX_RATE_LIMIT_KEYS = 1e4;
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
  return "unknown";
}
const PUBLIC_PATHS = /* @__PURE__ */ new Set(["/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/session", "/api/admin/auth/logout"]);
function readCookie(request, name) {
  const value = request.headers.get("cookie")?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1);
  return value ? { value } : void 0;
}
function requiredPermissions(pathname, method) {
  const rest = pathname.slice("/api/admin".length);
  const read = method === "GET" || method === "HEAD";
  if (rest.startsWith("/users")) {
    if (read) return ["users.view"];
    if (rest.includes("/bulk/delete") || method === "DELETE") return ["users.delete", "users.manage"];
    if (rest.includes("duplicate") || method === "POST") return ["users.create", "users.manage"];
    return ["users.edit", "users.manage"];
  }
  if (rest.startsWith("/roles")) {
    if (rest === "/roles/sync-permissions" && method === "POST") return ["roles.manage"];
    if (read) return ["roles.view"];
    if (rest.includes("/bulk/delete") || method === "DELETE") return ["roles.delete", "roles.manage"];
    if (rest.includes("duplicate") || method === "POST") return ["roles.create", "roles.manage"];
    return ["roles.edit", "roles.manage"];
  }
  if (rest === "/dashboard") return ["dashboard.view"];
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
  if (pathname === "/api/admin/auth/login" && method === "POST") {
    const client = clientAddress(request);
    const key = client === "unknown" ? `${pathname}:global` : `${pathname}:${client}`;
    const limit = client === "unknown" ? 60 : 10;
    if (!isWithinRateLimit(key, limit, 15 * 60 * 1e3)) return context.json({ success: false, message: "Too many requests. Please try again later." }, 429);
  }
  if (PUBLIC_PATHS.has(pathname)) return next();
  const session2 = await getAdminSession({ get: (name) => readCookie(request, name), set: () => void 0 });
  if (!session2) return context.json({ success: false, message: "Unauthorized." }, 401);
  const permissions2 = requiredPermissions(pathname, method);
  const allowed = permissions2 ? (await Promise.all(permissions2.map((permission) => can(session2.user.id, permission)))).some(Boolean) : true;
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
  .../* @__PURE__ */ Object.assign({ "./admin/auth/login.ts": () => Promise.resolve().then(() => login), "./admin/auth/logout.ts": () => Promise.resolve().then(() => logout), "./admin/auth/profile.ts": () => Promise.resolve().then(() => profile), "./admin/auth/refresh.ts": () => Promise.resolve().then(() => refresh), "./admin/auth/session.ts": () => Promise.resolve().then(() => session), "./admin/categories/[id].ts": () => Promise.resolve().then(() => _id_$5), "./admin/categories/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$7), "./admin/categories/bulk/delete.ts": () => Promise.resolve().then(() => _delete$4), "./admin/categories/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$6), "./admin/categories/bulk/status.ts": () => Promise.resolve().then(() => status), "./admin/categories/index.ts": () => Promise.resolve().then(() => index$5), "./admin/dashboard.ts": () => Promise.resolve().then(() => dashboard), "./admin/media/[id].ts": () => Promise.resolve().then(() => _id_$4), "./admin/media/bulk/delete.ts": () => Promise.resolve().then(() => _delete$3), "./admin/media/index.ts": () => Promise.resolve().then(() => index$4), "./admin/media/upload.ts": () => Promise.resolve().then(() => upload), "./admin/menus/[id].ts": () => Promise.resolve().then(() => _id_$3), "./admin/menus/index.ts": () => Promise.resolve().then(() => index$3), "./admin/menus/reorder.ts": () => Promise.resolve().then(() => reorder), "./admin/middleware.ts": () => Promise.resolve().then(() => middleware), "./admin/posts/[id].ts": () => Promise.resolve().then(() => _id_$2), "./admin/posts/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$5), "./admin/posts/bulk/delete.ts": () => Promise.resolve().then(() => _delete$2), "./admin/posts/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$4), "./admin/posts/bulk/publish.ts": () => Promise.resolve().then(() => publish), "./admin/posts/bulk/unpublish.ts": () => Promise.resolve().then(() => unpublish), "./admin/posts/index.ts": () => Promise.resolve().then(() => index$2), "./admin/roles/[id].ts": () => Promise.resolve().then(() => _id_$1), "./admin/roles/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$3), "./admin/roles/bulk/delete.ts": () => Promise.resolve().then(() => _delete$1), "./admin/roles/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$2), "./admin/roles/index.ts": () => Promise.resolve().then(() => index$1), "./admin/roles/sync-permissions.ts": () => Promise.resolve().then(() => syncPermissions), "./admin/settings.ts": () => Promise.resolve().then(() => settings), "./admin/users/[id].ts": () => Promise.resolve().then(() => _id_), "./admin/users/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$1), "./admin/users/bulk/delete.ts": () => Promise.resolve().then(() => _delete), "./admin/users/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate), "./admin/users/index.ts": () => Promise.resolve().then(() => index) }),
  .../* @__PURE__ */ Object.assign({ "./public/archive/[type].ts": () => Promise.resolve().then(() => _type_), "./public/contact.ts": () => Promise.resolve().then(() => contact), "./public/search.ts": () => Promise.resolve().then(() => search) })
};
function toHonoPath(modulePath) {
  const routeSegments = modulePath.replace(/^\.\//, "").replace(/^public\//, "").replace(/\.ts$/, "").split("/").filter((segment) => segment !== "index").map((segment) => segment.replace(/^\[([^\.][^\]]*)\]$/, ":$1"));
  return `/${routeSegments.join("/")}`;
}
const routes = Object.entries(routeModules).filter(([modulePath]) => !modulePath.endsWith(".test.ts") && !modulePath.endsWith("/middleware.ts")).map(([modulePath, load]) => ({
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
for (const route of routes) {
  apiApp.all(route.path, async (context) => {
    const handler = (await route.load())[context.req.method];
    if (!handler) {
      return Response.json({ success: false, message: "Method not allowed." }, { status: 405 });
    }
    return withHonoHeaders(await handler(createAdminRouteContext(context)), context);
  });
}
const ADMIN_PATH = typeof globalThis.__CMS_ADMIN_PATH__ === "string" ? globalThis.__CMS_ADMIN_PATH__ : "/admin";
const MAX_FILTER_TEXT_LENGTH$1 = 100;
function buildPaginationMeta(page, perPage, total, offset) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total > 0 ? offset + 1 : 0;
  const to = Math.min(offset + perPage, total);
  return { currentPage: page, perPage, total, lastPage, from, to };
}
function findPostByIdRecord(id) {
  const row = db.select().from(posts).where(eq(posts.id, id)).get();
  if (!row) return void 0;
  const author = db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, row.authorId)).get();
  const postCategoriesRows = db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(postCategories).innerJoin(categories, eq(postCategories.categoryId, categories.id)).where(eq(postCategories.postId, id)).all();
  return {
    ...row,
    author: author ?? null,
    categories: postCategoriesRows
  };
}
function findPostBySlugRecord(slug) {
  return db.select().from(posts).where(eq(posts.slug, slug)).get();
}
function findPublishedByTypeAndSlugRecord(type, slug) {
  return db.select({
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
    authorName: users.name
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(and(eq(posts.type, type), eq(posts.slug, slug), eq(posts.status, "published"))).get();
}
function listPostRecords(filters = {}) {
  const { page, perPage, offset } = clampPagination(filters);
  const conditions = [];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH$1);
  const type = filters.type?.slice(0, 64);
  const status2 = filters.status?.slice(0, 32);
  const authorId = filters.authorId?.slice(0, 128);
  const categoryId = filters.categoryId?.slice(0, 128);
  if (search2) {
    conditions.push(like(posts.title, `%${search2}%`));
  }
  if (type) {
    conditions.push(eq(posts.type, type));
  }
  if (status2) {
    conditions.push(eq(posts.status, status2));
  }
  if (authorId) {
    conditions.push(eq(posts.authorId, authorId));
  }
  if (categoryId) {
    conditions.push(sql`exists (
      select 1 from ${postCategories}
      where ${postCategories.postId} = ${posts.id}
        and ${postCategories.categoryId} = ${categoryId}
    )`);
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  const totalQuery = db.select({ value: count() }).from(posts);
  const totalRows = whereClause ? totalQuery.where(whereClause).all() : totalQuery.all();
  const total = totalRows[0]?.value ?? 0;
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
    authorName: users.name
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id));
  const orderColumn = filters.sortBy === "title" ? filters.sortOrder === "asc" ? posts.title : desc(posts.title) : filters.sortBy === "updatedAt" && filters.sortOrder === "asc" ? posts.updatedAt : desc(posts.updatedAt);
  const data = (whereClause ? dataQuery.where(whereClause) : dataQuery).orderBy(orderColumn).limit(perPage).offset(offset).all();
  return {
    data,
    meta: buildPaginationMeta(page, perPage, total, offset)
  };
}
function listPublishedPostRecordsByType(type, page = 1, perPage = 12, filters = {}) {
  const clampedPage = clampPage(page);
  const clampedPerPage = clampPerPage(perPage, 12);
  const offset = (clampedPage - 1) * clampedPerPage;
  const conditions = [eq(posts.type, type), eq(posts.status, "published")];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH$1);
  if (search2) {
    const pattern = `%${search2}%`;
    conditions.push(or(like(posts.title, pattern), like(posts.excerpt, pattern), like(posts.description, pattern)));
  }
  if (filters.category) {
    const category = db.select({ id: categories.id }).from(categories).where(and(or(eq(categories.slug, filters.category), eq(categories.id, filters.category)), eq(categories.status, "published"))).get();
    if (!category) return { data: [], meta: buildPaginationMeta(clampedPage, clampedPerPage, 0, offset) };
    conditions.push(sql`exists (
      select 1 from ${postCategories}
      where ${postCategories.postId} = ${posts.id}
        and ${postCategories.categoryId} = ${category.id}
    )`);
  }
  if (filters.tag) {
    conditions.push(sql`json_valid(${posts.tags})`);
    conditions.push(sql`exists (select 1 from json_each(${posts.tags}) where lower(value) = lower(${filters.tag}))`);
  }
  for (const [fieldName, value] of Object.entries(filters.customFields ?? {})) {
    conditions.push(sql`json_valid(${posts.customFieldValues})`);
    conditions.push(sql`cast(json_extract(${posts.customFieldValues}, ${`$.${fieldName}`}) as text) = ${value}`);
  }
  const condition = and(...conditions);
  const data = db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    excerpt: posts.excerpt,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    publishedAt: posts.publishedAt,
    authorName: users.name
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(condition).orderBy(filters.sortBy === "title" ? filters.sortOrder === "desc" ? desc(posts.title) : posts.title : filters.sortOrder === "asc" ? posts.createdAt : desc(posts.createdAt)).limit(clampedPerPage).offset(offset).all();
  const total = db.select({ value: count() }).from(posts).where(condition).all()[0]?.value ?? 0;
  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, total, offset)
  };
}
function listPublishedArchiveFilterOptionsByType(type) {
  const categoryOptions = db.selectDistinct({ name: categories.name, slug: categories.slug }).from(categories).innerJoin(postCategories, eq(categories.id, postCategories.categoryId)).innerJoin(posts, eq(postCategories.postId, posts.id)).where(and(eq(posts.type, type), eq(posts.status, "published"), eq(categories.status, "published"))).orderBy(asc(categories.name)).limit(5e3).all();
  const tagRows = db.select({ tags: posts.tags }).from(posts).where(and(eq(posts.type, type), eq(posts.status, "published"))).limit(5e3).all();
  const tags = [...new Set(tagRows.flatMap(({ tags: tags2 }) => {
    try {
      const value = tags2 ? JSON.parse(tags2) : [];
      return Array.isArray(value) ? value.filter((tag) => typeof tag === "string").map((tag) => tag.trim().slice(0, 100)).filter(Boolean) : [];
    } catch {
      return [];
    }
  }))].sort((a, b) => a.localeCompare(b)).slice(0, 5e3);
  return { categories: categoryOptions, tags, customFields: [] };
}
function searchPublishedPostRecords(query, page = 1, perPage = 12) {
  const clampedPage = clampPage(page);
  const clampedPerPage = clampPerPage(perPage, 12);
  const offset = (clampedPage - 1) * clampedPerPage;
  const pattern = `%${query}%`;
  const condition = and(
    eq(posts.status, "published"),
    or(
      like(posts.title, pattern),
      like(posts.excerpt, pattern),
      like(posts.description, pattern)
    )
  );
  const data = db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    excerpt: posts.excerpt,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    publishedAt: posts.publishedAt,
    authorName: users.name
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(condition).orderBy(desc(posts.publishedAt)).limit(clampedPerPage).offset(offset).all();
  const total = db.select({ value: count() }).from(posts).where(condition).all()[0]?.value ?? 0;
  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, total, offset)
  };
}
function listPublishedPostRecordsByTag(tag, page = 1, perPage = 12) {
  const clampedPage = clampPage(page);
  const clampedPerPage = clampPerPage(perPage, 12);
  const offset = (clampedPage - 1) * clampedPerPage;
  const condition = and(
    eq(posts.status, "published"),
    sql`json_valid(${posts.tags})`,
    sql`exists (select 1 from json_each(${posts.tags}) where lower(value) = lower(${tag}))`
  );
  const data = db.select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    type: posts.type,
    excerpt: posts.excerpt,
    featuredImage: posts.featuredImage,
    gallery: posts.gallery,
    publishedAt: posts.publishedAt,
    authorName: users.name
  }).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(condition).orderBy(desc(posts.publishedAt)).limit(clampedPerPage).offset(offset).all();
  const total = db.select({ value: count() }).from(posts).where(condition).all()[0]?.value ?? 0;
  return {
    data,
    meta: buildPaginationMeta(clampedPage, clampedPerPage, total, offset)
  };
}
function getDashboardStatsRecord() {
  return {
    totalPosts: db.select({ value: count() }).from(posts).all()[0]?.value ?? 0,
    publishedPosts: db.select({ value: count() }).from(posts).where(eq(posts.status, "published")).all()[0]?.value ?? 0,
    draftPosts: db.select({ value: count() }).from(posts).where(eq(posts.status, "draft")).all()[0]?.value ?? 0,
    totalMedia: db.select({ value: count() }).from(media).all()[0]?.value ?? 0,
    totalUsers: db.select({ value: count() }).from(users).all()[0]?.value ?? 0,
    totalCategories: db.select({ value: count() }).from(categories).all()[0]?.value ?? 0
  };
}
function createPostRecord(input) {
  db.insert(posts).values(input).run();
  return db.select().from(posts).where(eq(posts.id, input.id)).get();
}
function updatePostRecord(id, input) {
  db.update(posts).set(input).where(eq(posts.id, id)).run();
  return db.select().from(posts).where(eq(posts.id, id)).get();
}
function deletePostRecord(id) {
  return db.delete(posts).where(eq(posts.id, id)).run().changes > 0;
}
function syncPostCategoriesRecord(postId, categoryIds, now) {
  db.delete(postCategories).where(eq(postCategories.postId, postId)).run();
  for (const categoryId of categoryIds) {
    db.insert(postCategories).values({
      id: generateId(),
      postId,
      categoryId,
      createdAt: now
    }).run();
  }
}
let loadedPath;
function getServerContentTypeRegistry() {
  const registryPath = process.env.BEAVER_CONTENT_TYPE_REGISTRY_PATH;
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
function getCachedPublicData(key, loader, ttlMs = defaultTtlMs) {
  if (!Number.isFinite(ttlMs) || ttlMs <= 0) return loader();
  const generationAtStart = cacheGeneration;
  const path2 = cachePath(key);
  try {
    if (existsSync(path2) && lstatSync(path2).isFile() && statSync(path2).size <= MAX_CACHE_ENTRY_BYTES) {
      const entry = JSON.parse(readFileSync(path2, "utf8"));
      if (generationAtStart === cacheGeneration && Number.isFinite(entry.expiresAt) && entry.expiresAt > Date.now()) return entry.value;
    }
  } catch {
  }
  const value = loader();
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
    const directory = dirname(path2);
    mkdirSync(directory, { recursive: true, mode: 448 });
    chmodSync(directory, 448);
    pruneCacheDirectory(Buffer.byteLength(serialized, "utf8"));
    tempPath = `${path2}.${process.pid}.${randomUUID()}.tmp`;
    writeFileSync(tempPath, serialized, { encoding: "utf8", mode: 384, flag: "wx" });
    renameSync(tempPath, path2);
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
function buildSlug(input, title) {
  return (input || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
function jsonOrNull(value) {
  if (Array.isArray(value)) return value.length > 0 ? JSON.stringify(value) : null;
  return value ? JSON.stringify(value) : null;
}
function computePublishedAt(inputPublishedAt, oldStatus, newStatus, existing, now) {
  if (inputPublishedAt !== void 0) return inputPublishedAt;
  if (oldStatus !== "published" && newStatus === "published") return now;
  if (oldStatus === "published" && newStatus === "draft") return null;
  return existing.publishedAt ?? null;
}
function buildPostPayload(data, userId) {
  const now = Date.now();
  const isPublished = "status" in data ? data.status === "published" : false;
  return {
    id: generateId(),
    title: sanitizeText(data.title ?? ""),
    slug: buildSlug(data.slug, data.title ?? ""),
    type: data.type ?? "post",
    status: data.status ?? "draft",
    excerpt: data.excerpt ?? null,
    description: data.description ? sanitizeHtml(data.description) : null,
    tags: jsonOrNull(data.tags),
    sections: jsonOrNull(data.sections),
    customFieldValues: jsonOrNull(data.customFieldValues),
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
    featuredImage: data.featuredImage ?? null,
    gallery: jsonOrNull(data.gallery),
    authorId: userId,
    publishedAt: isPublished ? data.publishedAt ?? now : null,
    createdAt: now,
    updatedAt: now
  };
}
function buildUpdatePayload(data, existing, now) {
  const oldStatus = existing.status;
  const newStatus = data.status ?? oldStatus;
  const publishedAt = computePublishedAt(
    data.publishedAt,
    oldStatus,
    newStatus,
    existing,
    now
  );
  const update = { updatedAt: now };
  if (data.title !== void 0) update.title = sanitizeText(data.title);
  if (data.slug !== void 0) update.slug = data.slug;
  if (data.type !== void 0) update.type = data.type;
  if (data.status !== void 0) update.status = data.status;
  if (data.excerpt !== void 0) update.excerpt = data.excerpt ?? null;
  if (data.description !== void 0) update.description = data.description ? sanitizeHtml(data.description) : null;
  if (data.tags !== void 0) update.tags = jsonOrNull(data.tags);
  if (data.sections !== void 0) update.sections = jsonOrNull(data.sections);
  if (data.customFieldValues !== void 0) update.customFieldValues = jsonOrNull(data.customFieldValues);
  if (data.metaTitle !== void 0) update.metaTitle = data.metaTitle ?? null;
  if (data.metaDescription !== void 0) update.metaDescription = data.metaDescription ?? null;
  if (data.featuredImage !== void 0) update.featuredImage = data.featuredImage ?? null;
  if (data.gallery !== void 0) update.gallery = jsonOrNull(data.gallery);
  update.publishedAt = publishedAt;
  return update;
}
function createPost(data, userId) {
  const slug = buildSlug(data.slug, data.title);
  const existing = findPostBySlugRecord(slug);
  if (existing) return serviceConflict("slug", "A post with this slug already exists.");
  try {
    const payload = buildPostPayload(data, userId);
    payload.slug = slug;
    const post = createPostRecord(payload);
    if (data.categoryIds?.length) {
      syncPostCategoriesRecord(payload.id, data.categoryIds, payload.createdAt);
    }
    invalidatePublicDataCache();
    return serviceSuccess(post, "Post created.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to create post." } };
  }
}
function updatePost(id, data) {
  const existing = findPostByIdRecord(id);
  if (!existing) return serviceNotFound("Post");
  if (data.slug && data.slug !== existing.slug) {
    const slugConflict = findPostBySlugRecord(data.slug);
    if (slugConflict) return serviceConflict("slug", "A post with this slug already exists.");
  }
  try {
    const now = Date.now();
    const updateData = buildUpdatePayload(data, existing, now);
    const post = updatePostRecord(id, updateData);
    if (data.categoryIds !== void 0) {
      syncPostCategoriesRecord(id, data.categoryIds, now);
    }
    invalidatePublicDataCache();
    return serviceSuccess(post, "Post updated.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to update post." } };
  }
}
function duplicatePost(id, userId) {
  const original = findPostByIdRecord(id);
  if (!original) return serviceNotFound("Post");
  const now = Date.now();
  const newId = generateId();
  let newSlug = `${original.slug}-copy`;
  const slugConflict = findPostBySlugRecord(newSlug);
  if (slugConflict) {
    const timestamp = now.toString(36).slice(-6);
    newSlug = `${original.slug}-copy-${timestamp}`;
  }
  try {
    const post = createPostRecord({
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
      syncPostCategoriesRecord(
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
function bulkDeletePosts(ids) {
  const results = [];
  for (const id of ids) {
    const existing = findPostByIdRecord(id);
    if (!existing) {
      results.push({ id, success: false });
      continue;
    }
    try {
      deletePostRecord(id);
      results.push({ id, success: true });
    } catch {
      results.push({ id, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk delete completed.");
}
function bulkPublishPosts(ids) {
  const now = Date.now();
  const results = [];
  for (const id of ids) {
    const existing = findPostByIdRecord(id);
    if (!existing) {
      results.push({ id, success: false });
      continue;
    }
    try {
      updatePostRecord(id, { status: "published", publishedAt: now, updatedAt: now });
      results.push({ id, success: true });
    } catch {
      results.push({ id, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk publish completed.");
}
function bulkUnpublishPosts(ids) {
  const now = Date.now();
  const results = [];
  for (const id of ids) {
    const existing = findPostByIdRecord(id);
    if (!existing) {
      results.push({ id, success: false });
      continue;
    }
    try {
      updatePostRecord(id, { status: "draft", publishedAt: null, updatedAt: now });
      results.push({ id, success: true });
    } catch {
      results.push({ id, success: false });
    }
  }
  if (results.some((result) => result.success)) invalidatePublicDataCache();
  return serviceSuccess(results, "Bulk unpublish completed.");
}
function bulkDuplicatePosts(ids, userId) {
  const results = [];
  for (const originalId of ids) {
    const result = duplicatePost(originalId, userId);
    if (result.success) {
      results.push({ id: originalId, success: true, newId: result.data.id });
    } else {
      results.push({ id: originalId, success: false, error: result.error.message });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
function deletePost(id) {
  const existing = findPostByIdRecord(id);
  if (!existing) return serviceNotFound("Post");
  try {
    deletePostRecord(id);
    invalidatePublicDataCache();
    return serviceSuccess(null, "Post deleted.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to delete post." } };
  }
}
function getPost(id) {
  const post = findPostByIdRecord(id);
  if (!post) return serviceNotFound("Post");
  return serviceSuccess(post, "OK");
}
function listPosts(filters) {
  const result = listPostRecords(filters);
  return serviceSuccess(result, "OK");
}
function getPublishedPostByType(type, slug) {
  if (!slugRegex.test(type) || !slugRegex.test(slug)) return serviceNotFound("Post");
  const post = getCachedPublicData(`post:published:${type}:${slug}`, () => {
    const record = findPublishedByTypeAndSlugRecord(type, slug);
    return record ? { ...record, description: record.description ? sanitizeHtml(record.description) : null } : record;
  });
  if (!post) return serviceNotFound("Post");
  return serviceSuccess(post, "OK");
}
function listPublishedPostsByType(type, page = 1, perPage = 12, filters = {}) {
  const normalizedPage = clampPage(page);
  const normalizedPerPage = clampPerPage(perPage, 12);
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
  return serviceSuccess(getCachedPublicData(`posts:published:${cacheKey}`, () => listPublishedPostRecordsByType(type, normalizedPage, normalizedPerPage, normalizedFilters)), "OK");
}
function getPublishedArchiveFilterOptions(type) {
  return serviceSuccess(getCachedPublicData(`posts:published:archive-filter-options:${type}`, () => ({
    ...listPublishedArchiveFilterOptionsByType(type),
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
function searchPublishedPosts(query, page = 1, perPage = 12) {
  const normalizedQuery = query.trim().slice(0, 100);
  const normalizedPage = clampPage(page);
  const normalizedPerPage = clampPerPage(perPage, 12);
  if (!normalizedQuery) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage: normalizedPerPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK");
  }
  const result = getCachedPublicData(
    `posts:published:search:${normalizedQuery.toLowerCase()}:${normalizedPage}:${normalizedPerPage}`,
    () => searchPublishedPostRecords(normalizedQuery, normalizedPage, normalizedPerPage)
  );
  return serviceSuccess(result, "OK");
}
function listPublishedPostsByTag(tag, page = 1, perPage = 12) {
  const normalizedTag = tag.trim().slice(0, 100);
  const normalizedPage = clampPage(page);
  const normalizedPerPage = clampPerPage(perPage, 12);
  if (!normalizedTag) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage: normalizedPerPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK");
  }
  return serviceSuccess(
    getCachedPublicData(
      `posts:published:tag:${normalizedTag.toLowerCase()}:${normalizedPage}:${normalizedPerPage}`,
      () => listPublishedPostRecordsByTag(normalizedTag, normalizedPage, normalizedPerPage)
    ),
    "OK"
  );
}
const MAX_MENU_ROWS = 5e3;
function findMenuById(id) {
  return db.select().from(menus).where(eq(menus.id, id)).get();
}
function listMenus$1(type, publishedOnly = false) {
  const query = db.select().from(menus);
  const condition = type ? eq(menus.type, type) : void 0;
  const where = publishedOnly ? condition ? and(condition, eq(menus.status, "published")) : eq(menus.status, "published") : condition;
  return (where ? query.where(where) : query).limit(MAX_MENU_ROWS).all();
}
function getMenuTreeRecords(items, type) {
  const rows = listMenus$1(type, true);
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
function createMenuRecord(input) {
  db.insert(menus).values({
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
  }).run();
  return findMenuById(input.id);
}
function updateMenuRecord(id, input) {
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
  db.update(menus).set(updateData).where(eq(menus.id, id)).run();
  return findMenuById(id) ?? null;
}
function deleteMenuRecord(id) {
  db.update(menus).set({ parentId: null }).where(eq(menus.parentId, id)).run();
  return db.delete(menus).where(eq(menus.id, id)).run().changes > 0;
}
function reorderMenuTree(items) {
  for (const item of items) {
    db.update(menus).set({ position: item.position, parentId: item.parentId, updatedAt: Date.now() }).where(eq(menus.id, item.id)).run();
  }
}
const MAX_MENU_PARENT_DEPTH = 20;
function validateParentId(parentId, type, currentId) {
  if (!parentId) return null;
  if (parentId === currentId) return "A menu item cannot be its own parent.";
  const parent = findMenuById(parentId);
  if (!parent || parent.type !== type) return "Parent menu item was not found in this menu.";
  const visited = new Set(currentId ? [currentId] : []);
  let cursor = parent;
  for (let depth = 0; cursor && depth < MAX_MENU_PARENT_DEPTH; depth += 1) {
    if (visited.has(cursor.id)) return "Menu hierarchy cannot contain a cycle.";
    visited.add(cursor.id);
    if (!cursor.parentId) return null;
    cursor = findMenuById(cursor.parentId);
    if (cursor && cursor.type !== type) return "Parent menu item was not found in this menu.";
  }
  return cursor ? "Menu hierarchy is too deep or contains a cycle." : null;
}
function getMenuTree(type) {
  const tree = getCachedPublicData(`menu-tree:${type ?? "all"}`, () => getMenuTreeRecords(void 0, type));
  return serviceSuccess(tree, "OK");
}
function listMenus() {
  const items = listMenus$1();
  return serviceSuccess(items, "OK");
}
function getMenu(id) {
  const item = findMenuById(id);
  if (!item) return serviceNotFound("Menu");
  return serviceSuccess(item, "OK");
}
function createMenu(data) {
  const parentError = validateParentId(data.parentId, data.type);
  if (parentError) return serviceValidation(parentError);
  const id = generateId();
  const now = getCurrentTimestamp();
  const record = createMenuRecord({
    id,
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
function updateMenu(id, data) {
  const existing = findMenuById(id);
  if (!existing) return serviceNotFound("Menu");
  const nextType = data.type ?? existing.type;
  const nextParentId = data.parentId !== void 0 ? data.parentId : existing.parentId;
  const parentError = validateParentId(nextParentId, nextType, id);
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
  const updated = updateMenuRecord(id, updateData);
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
function reorderMenus(data) {
  const items = flattenTree(data.tree);
  const existing = listMenus$1(data.type);
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
  reorderMenuTree(items);
  invalidatePublicDataCache();
  return serviceSuccess(null, "Menus reordered.");
}
function deleteMenu(id) {
  const existing = findMenuById(id);
  if (!existing) return serviceNotFound("Menu");
  deleteMenuRecord(id);
  invalidatePublicDataCache();
  return serviceSuccess(null, "Menu deleted.");
}
function getAllSettingsRecords() {
  return db.select().from(settings$1).all();
}
function getSettingRecord(key) {
  return db.select().from(settings$1).where(eq(settings$1.key, key)).get();
}
function upsertSettingRecord(key, value) {
  const now = getCurrentTimestamp();
  const existing = getSettingRecord(key);
  if (existing) {
    db.update(settings$1).set({ value, updatedAt: now }).where(eq(settings$1.key, key)).run();
    return { key, value, createdAt: existing.createdAt, updatedAt: now };
  }
  db.insert(settings$1).values({ key, value, createdAt: now, updatedAt: now }).run();
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
function getSiteSettings() {
  return getCachedPublicData("site-settings", () => {
    const records = getAllSettingsRecords();
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
function updateSiteSettings(data) {
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
    return serviceSuccess(getSiteSettings(), "No settings to update.");
  }
  for (const { key, value } of upserts) {
    upsertSettingRecord(key, value);
  }
  invalidatePublicDataCache();
  return serviceSuccess(getSiteSettings(), "Settings updated successfully.");
}
const migrationsFolder = fileURLToPath(new URL("./migrations/", import.meta.url));
function migrate() {
  const sqlite2 = db.$client;
  const journal = JSON.parse(readFileSync(join(migrationsFolder, "meta", "_journal.json"), "utf8"));
  const migrationTable = "__drizzle_migrations";
  sqlite2.exec(`CREATE TABLE IF NOT EXISTS ${migrationTable} (id INTEGER PRIMARY KEY, hash text NOT NULL, created_at numeric)`);
  const lastMigration = sqlite2.prepare(`SELECT created_at FROM ${migrationTable} ORDER BY created_at DESC LIMIT 1`).get();
  const lastCreatedAt = Number(lastMigration?.created_at ?? -1);
  const recordMigration = sqlite2.prepare(`INSERT INTO ${migrationTable} (hash, created_at) VALUES (?, ?)`);
  sqlite2.exec("BEGIN");
  try {
    for (const entry of journal.entries) {
      if (entry.when <= lastCreatedAt) continue;
      const sql2 = readFileSync(join(migrationsFolder, `${entry.tag}.sql`), "utf8");
      sqlite2.exec(sql2);
      recordMigration.run(createHash("sha256").update(sql2).digest("hex"), entry.when);
    }
    sqlite2.exec("COMMIT");
  } catch (error) {
    sqlite2.exec("ROLLBACK");
    throw error;
  }
}
const CONTENT_TYPE_REGISTRY_PATH = "src/components/web/content-type-templates/registry.json";
const BUILT_IN_CONTENT_TYPES = [
  { slug: "post", name: "post" },
  { slug: "page", name: "page" }
];
function getRegistryPath() {
  const configuredPath = process.env.CONTENT_TYPE_REGISTRY_PATH?.trim() || process.env.BEAVER_CONTENT_TYPE_REGISTRY_PATH?.trim();
  if (configuredPath) return resolve(process.cwd(), configuredPath);
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), CONTENT_TYPE_REGISTRY_PATH),
    resolve(moduleDir, "templates/flowstack/src/components/web/content-type-templates/registry.json"),
    resolve(moduleDir, "../../../templates/flowstack/src/components/web/content-type-templates/registry.json")
  ];
  return candidates.find((candidate) => existsSync(candidate));
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
    { slug: `content.${slug}.publish`, name: `Publish ${name} content`, group: slug },
    { slug: `content.${slug}.unpublish`, name: `Unpublish ${name} content`, group: slug },
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
    { slug: "roles.view", name: "View roles and permissions", group: "roles" },
    { slug: "roles.create", name: "Create roles", group: "roles" },
    { slug: "roles.edit", name: "Edit roles and assign permissions", group: "roles" },
    { slug: "roles.delete", name: "Delete roles", group: "roles" },
    { slug: "roles.manage", name: "Manage roles and permissions", group: "roles" },
    { slug: "settings.manage", name: "Manage system settings", group: "settings" }
  ];
}
function isContentPermissionSlug(slug) {
  return slug.startsWith("content.") || slug.startsWith("category.");
}
function syncPermissionRecords(definitions) {
  const now = getCurrentTimestamp();
  return db.transaction((tx) => {
    const existing = tx.select({ id: permissions.id, slug: permissions.slug }).from(permissions).all();
    const existingBySlug = new Map(existing.map((permission) => [permission.slug, permission]));
    const desiredSlugs = new Set(definitions.map((permission) => permission.slug));
    const obsolete = existing.filter((permission) => isContentPermissionSlug(permission.slug) && !desiredSlugs.has(permission.slug));
    for (const permission of obsolete) {
      tx.delete(rolePermissions).where(eq(rolePermissions.permissionId, permission.id)).run();
      tx.delete(permissions).where(eq(permissions.id, permission.id)).run();
    }
    let added = 0;
    let updated = 0;
    for (const definition of definitions) {
      const current = existingBySlug.get(definition.slug);
      if (current) {
        tx.update(permissions).set({
          name: definition.name,
          group: definition.group,
          description: definition.name,
          updatedAt: now
        }).where(eq(permissions.id, current.id)).run();
        updated++;
        continue;
      }
      tx.insert(permissions).values({
        id: generateId(),
        name: definition.name,
        slug: definition.slug,
        group: definition.group,
        description: definition.name,
        createdAt: now,
        updatedAt: now
      }).run();
      added++;
    }
    return { added, updated, removed: obsolete.length, total: definitions.length };
  });
}
const DEFAULT_ROLES = [
  {
    name: "Super Admin",
    slug: "super-admin",
    description: "Full system access. Cannot be deleted or modified.",
    isSystem: 1
  },
  {
    name: "Editor",
    slug: "editor",
    description: "Can manage all content, media, categories, and menus.",
    isSystem: 0
  },
  {
    name: "Author",
    slug: "author",
    description: "Can create and edit own posts, view and upload media.",
    isSystem: 0
  },
  {
    name: "Viewer",
    slug: "viewer",
    description: "Read-only access to posts, media, and categories.",
    isSystem: 0
  }
];
function getRolePermissionMap(definitions) {
  return {
    "super-admin": definitions.map((permission) => permission.slug),
    editor: [
      ...definitions.filter((permission) => isContentPermissionSlug(permission.slug)).map((permission) => permission.slug),
      "dashboard.view",
      "media.view",
      "media.upload",
      "media.edit",
      "media.delete",
      "menus.view",
      "menus.create",
      "menus.edit",
      "menus.delete",
      "menus.publish",
      "menus.unpublish"
    ],
    author: [
      "content.post.view",
      "content.post.create",
      "content.post.edit-own",
      "media.view",
      "media.upload"
    ],
    viewer: [
      "content.post.view",
      "media.view",
      "category.post.view"
    ]
  };
}
async function seed() {
  console.log("🌱 Seeding database...");
  const permissionDefinitions = getPermissionDefinitions();
  const rolePermissionMap = getRolePermissionMap(permissionDefinitions);
  const now = getCurrentTimestamp();
  console.log("  → Inserting permissions...");
  const permissionSync = syncPermissionRecords(permissionDefinitions);
  console.log(`  ✓ ${permissionSync.total} permissions ready`);
  db.transaction((tx) => {
    const existingPermissions = tx.select({ id: permissions.id, slug: permissions.slug }).from(permissions).all();
    const permissionSlugToId = new Map(
      existingPermissions.map((p) => [p.slug, p.id])
    );
    console.log("  → Inserting roles...");
    for (const role of DEFAULT_ROLES) {
      tx.insert(roles).values({
        id: generateId(),
        name: role.name,
        slug: role.slug,
        description: role.description,
        isSystem: role.isSystem,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing({ target: roles.slug }).run();
    }
    const existingRoles = tx.select({ id: roles.id, slug: roles.slug }).from(roles).all();
    const roleSlugToId = new Map(
      existingRoles.map((r) => [r.slug, r.id])
    );
    console.log(`  ✓ ${existingRoles.length} roles ready`);
    console.log("  → Assigning permissions to roles...");
    for (const role of DEFAULT_ROLES) {
      const roleId = roleSlugToId.get(role.slug);
      if (roleId) {
        tx.delete(rolePermissions).where(sql`${rolePermissions.roleId} = ${roleId}`).run();
      }
    }
    let assignmentCount = 0;
    for (const [roleSlug, permSlugs] of Object.entries(rolePermissionMap)) {
      const roleId = roleSlugToId.get(roleSlug);
      if (!roleId) {
        console.warn(`  ⚠ Role "${roleSlug}" not found, skipping assignments`);
        continue;
      }
      for (const permSlug of permSlugs) {
        const permissionId = permissionSlugToId.get(permSlug);
        if (!permissionId) {
          console.warn(`  ⚠ Permission "${permSlug}" not found, skipping`);
          continue;
        }
        tx.insert(rolePermissions).values({
          id: generateId(),
          roleId,
          permissionId,
          createdAt: now
        }).run();
        assignmentCount++;
      }
    }
    console.log(`  ✓ ${assignmentCount} role-permission assignments created`);
    console.log("  → Creating super-admin user...");
    const admin = getSeedAdminCredentials();
    const resolvedAdminEmail = admin.email;
    const resolvedAdminPassword = admin.password;
    const resolvedAdminName = admin.name;
    const hashedPassword = bcrypt.hashSync(resolvedAdminPassword, 12);
    const superAdminRoleId = roleSlugToId.get("super-admin");
    if (!superAdminRoleId) {
      console.warn("  ⚠ Super Admin role not found, skipping user creation");
    } else {
      tx.insert(users).values({
        id: generateId(),
        name: resolvedAdminName,
        email: resolvedAdminEmail,
        password: hashedPassword,
        roleId: superAdminRoleId,
        emailVerified: 1,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing({ target: users.email }).run();
      console.log(`  ✓ Super-admin user ready (${resolvedAdminEmail})`);
    }
  });
  console.log("✅ Seed complete!");
}
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  });
}
const MAX_CATEGORY_ROWS = 5e3;
function findCategoryByIdRecord(id) {
  return db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    type: categories.type,
    description: categories.description,
    image: categories.image,
    status: categories.status,
    createdAt: categories.createdAt,
    updatedAt: categories.updatedAt
  }).from(categories).where(eq(categories.id, id)).get();
}
function findCategoryBySlugRecord(slug) {
  return db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    type: categories.type,
    description: categories.description,
    image: categories.image,
    status: categories.status,
    createdAt: categories.createdAt,
    updatedAt: categories.updatedAt
  }).from(categories).where(eq(categories.slug, slug)).get();
}
function listCategoryRecords(filters) {
  const conditions = [];
  const type = filters?.type?.slice(0, 64);
  const search2 = filters?.search?.slice(0, 100);
  if (type) {
    conditions.push(eq(categories.type, type));
  }
  if (search2) {
    conditions.push(like(categories.name, `%${search2}%`));
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
  return (conditions.length > 0 ? query.where(and(...conditions)) : query).limit(MAX_CATEGORY_ROWS).all();
}
function categorySlugExistsRecord(slug, excludeId) {
  const rows = db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).all();
  return excludeId ? rows.some((row) => row.id !== excludeId) : rows.length > 0;
}
function createCategoryRecord(input) {
  db.insert(categories).values({
    ...input,
    name: sanitizeText(input.name),
    description: input.description ? sanitizeText(input.description) : null
  }).run();
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
function updateCategoryRecord(id, input) {
  const updates = { updatedAt: input.updatedAt };
  if (input.name !== void 0) updates.name = sanitizeText(input.name);
  if (input.slug !== void 0) updates.slug = input.slug;
  if (input.type !== void 0) updates.type = input.type;
  if (input.description !== void 0) updates.description = input.description ? sanitizeText(input.description) : null;
  if (input.image !== void 0) updates.image = input.image;
  if (input.status !== void 0) updates.status = input.status;
  db.update(categories).set(updates).where(eq(categories.id, id)).run();
  return findCategoryByIdRecord(id) ?? null;
}
function deleteCategoryRecord(id) {
  return db.delete(categories).where(eq(categories.id, id)).run().changes > 0;
}
async function generateUniqueSlug(name, excludeId) {
  let slug = slugify(name);
  if (!slug) slug = "category";
  if (categorySlugExistsRecord(slug, excludeId)) {
    let counter = 1;
    while (categorySlugExistsRecord(`${slug}-${counter}`, excludeId)) {
      counter++;
    }
    slug = `${slug}-${counter}`;
  }
  return slug;
}
async function createCategoryAsync(data) {
  const id = generateId();
  const now = getCurrentTimestamp();
  const slug = await generateUniqueSlug(data.name);
  const created = createCategoryRecord({
    id,
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
async function updateCategory(id, data) {
  const existing = findCategoryByIdRecord(id);
  if (!existing) return serviceNotFound("Category");
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.type !== void 0) updateData.type = data.type;
  if (data.description !== void 0) updateData.description = data.description;
  if (data.image !== void 0) updateData.image = data.image;
  if (data.status !== void 0) updateData.status = data.status;
  if (data.name !== void 0 && data.name !== existing.name) {
    updateData.slug = await generateUniqueSlug(data.name, id);
  }
  const updated = updateCategoryRecord(id, updateData);
  if (!updated) return serviceNotFound("Category");
  return serviceSuccess(updated, "Category updated.");
}
function deleteCategory(id) {
  const existing = findCategoryByIdRecord(id);
  if (!existing) return serviceNotFound("Category");
  deleteCategoryRecord(id);
  return serviceSuccess(null, "Category deleted.");
}
function duplicateCategory(id) {
  const existing = findCategoryByIdRecord(id);
  if (!existing) return serviceNotFound("Category");
  const newId = generateId();
  const now = getCurrentTimestamp();
  const newSlug = `${existing.slug}-copy`;
  let finalSlug = newSlug;
  if (categorySlugExistsRecord(finalSlug)) {
    const ts = now.toString(36).slice(-4);
    finalSlug = `${newSlug}-${ts}`;
  }
  try {
    const created = createCategoryRecord({
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
function bulkDeleteCategories(ids) {
  const results = [];
  for (const id of ids) {
    const existing = findCategoryByIdRecord(id);
    if (!existing) {
      results.push({ id, success: false });
      continue;
    }
    try {
      deleteCategoryRecord(id);
      results.push({ id, success: true });
    } catch {
      results.push({ id, success: false });
    }
  }
  return serviceSuccess(results, "Bulk delete completed.");
}
function bulkDuplicateCategories(ids) {
  const results = [];
  for (const id of ids) {
    const result = duplicateCategory(id);
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id });
    } else {
      results.push({ id, success: false });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
function bulkUpdateCategoryStatus(ids, status2) {
  const now = getCurrentTimestamp();
  const results = ids.map((id) => {
    const updated = updateCategoryRecord(id, { status: status2, updatedAt: now });
    return { id, success: updated !== null };
  });
  return serviceSuccess(results, `Categories ${status2 === "published" ? "published" : "unpublished"}.`);
}
function listCategories(filters) {
  const items = listCategoryRecords(filters);
  return serviceSuccess(items, "Categories retrieved.");
}
function templatePath(name) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error("Invalid template name.");
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const packaged = resolve(moduleDir, "templates", name, "data", "seed.json");
  return existsSync(packaged) ? packaged : resolve(moduleDir, "..", "..", "..", "templates", name, "data", "seed.json");
}
async function seedTemplate(name) {
  const template = JSON.parse(await readFile(templatePath(name), "utf8"));
  const user = db.select({ id: users.id }).from(users).get();
  if (!user) throw new Error("Run the base seed before importing template data.");
  const settings2 = getSiteSettings();
  if (template.settings && settings2.title === "My CMS") {
    const result = updateSiteSettings(template.settings);
    if (!result.success) throw new Error(result.error.message);
  }
  const categories2 = /* @__PURE__ */ new Map();
  for (const category of template.categories ?? []) {
    const slug = category.name.toLowerCase().replace(/\s+/g, "-");
    const existing = findCategoryBySlugRecord(slug);
    if (existing) {
      categories2.set(slug, existing.id);
      continue;
    }
    const result = await createCategoryAsync({ name: category.name, type: "post", description: category.description, status: "published" });
    if (!result.success) throw new Error(result.error.message);
    categories2.set(slug, result.data.id);
  }
  for (const post of template.posts ?? []) {
    if (findPostBySlugRecord(post.slug)) continue;
    const categorySlugs = Array.isArray(post.categorySlugs) ? post.categorySlugs.filter((value) => typeof value === "string") : [];
    const data = Object.fromEntries(Object.entries(post).filter(([key]) => key !== "categorySlugs"));
    const result = createPost({ ...data, type: "post", status: "published", categoryIds: categorySlugs.map((slug) => categories2.get(slug)).filter((id) => Boolean(id)) }, user.id);
    if (!result.success) throw new Error(result.error.message);
  }
  for (const page of template.pages ?? []) {
    if (findPostBySlugRecord(page.slug)) continue;
    const result = createPost({ ...page, type: "page", status: "published" }, user.id);
    if (!result.success) throw new Error(result.error.message);
  }
  const existingMenus = listMenus$1();
  for (const [position, menu] of (template.menus ?? []).entries()) {
    if (existingMenus.some((item) => item.type === menu.type && item.url === menu.url)) continue;
    const result = createMenu({ ...menu, position, status: "published" });
    if (!result.success) throw new Error(result.error.message);
  }
  console.log(`Template data ready: ${name}`);
}
function resetSuperAdminPassword() {
  assertSecureSeedEnvironment();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12 || password.length > 128) {
    throw new Error("ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters are required.");
  }
  const superAdmin = db.select({ id: roles.id }).from(roles).where(eq(roles.slug, "super-admin")).get();
  if (!superAdmin) throw new Error("The super-admin role does not exist. Run beaver seed first.");
  const user = db.select({ id: users.id }).from(users).where(and(eq(users.email, email), eq(users.roleId, superAdmin.id))).get();
  if (!user) throw new Error(`No super-admin user found for ${email}.`);
  const passwordHash = bcrypt.hashSync(password, 12);
  const now = getCurrentTimestamp();
  db.transaction((tx) => {
    tx.update(users).set({ password: passwordHash, updatedAt: now }).where(eq(users.id, user.id)).run();
    tx.delete(adminRefreshSessions).where(eq(adminRefreshSessions.userId, user.id)).run();
  });
  return { email };
}
const BCRYPT_COST = 12;
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
const MAX_ROLE_ROWS = 1e3;
function findRoleByIdRecord(id) {
  return db.select().from(roles).where(eq(roles.id, id)).get();
}
function findRoleBySlugRecord(slug) {
  return db.select().from(roles).where(eq(roles.slug, slug)).get();
}
function listRolesWithUserCountRecords(filters) {
  const conditions = [];
  const search2 = filters?.search?.slice(0, 100);
  if (search2) {
    conditions.push(or(
      like(roles.name, `%${search2}%`),
      like(roles.slug, `%${search2}%`)
    ));
  }
  let orderColumn = asc(roles.name);
  if (filters?.sortBy) {
    const column = filters.sortBy === "name" ? roles.name : filters.sortBy === "createdAt" ? roles.createdAt : null;
    if (column) {
      orderColumn = filters.sortOrder === "asc" ? asc(column) : desc(column);
    }
  }
  const baseQuery = db.select().from(roles).orderBy(orderColumn);
  const roleRows = conditions.length > 0 ? baseQuery.where(and(...conditions)).limit(MAX_ROLE_ROWS).all() : baseQuery.limit(MAX_ROLE_ROWS).all();
  return roleRows.map((role) => {
    const countResult = db.select({ value: count() }).from(users).where(eq(users.roleId, role.id)).get();
    return { ...role, userCount: countResult?.value ?? 0 };
  });
}
function getRoleNameRecord(roleId) {
  const row = db.select({ name: roles.name }).from(roles).where(eq(roles.id, roleId)).get();
  return row?.name ?? null;
}
function listAllPermissionRecords() {
  return db.select().from(permissions).all();
}
function createRoleRecord(input) {
  db.insert(roles).values({
    id: input.id,
    name: sanitizeText(input.name),
    slug: input.slug.toLowerCase(),
    description: input.description ? sanitizeText(input.description) : null,
    isSystem: 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
  }).run();
  for (const permissionId of input.permissionIds) {
    db.insert(rolePermissions).values({
      id: generateId(),
      roleId: input.id,
      permissionId,
      createdAt: input.createdAt
    }).run();
  }
  return findRoleByIdRecord(input.id);
}
function updateRoleRecord(id, input) {
  const updates = { updatedAt: input.updatedAt };
  if (input.name !== void 0) updates.name = sanitizeText(input.name);
  if (input.slug !== void 0) updates.slug = input.slug.toLowerCase();
  if (input.description !== void 0) updates.description = input.description ? sanitizeText(input.description) : null;
  db.update(roles).set(updates).where(eq(roles.id, id)).run();
  if (input.permissionIds !== void 0) {
    db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).run();
    for (const permissionId of input.permissionIds) {
      db.insert(rolePermissions).values({
        id: generateId(),
        roleId: id,
        permissionId,
        createdAt: input.updatedAt
      }).run();
    }
  }
  return findRoleByIdRecord(id) ?? null;
}
function deleteRoleRecord(id) {
  db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).run();
  return db.delete(roles).where(eq(roles.id, id)).run().changes > 0;
}
function getRolePermissionIdsRecord(roleId) {
  return db.select({ permissionId: rolePermissions.permissionId }).from(rolePermissions).where(eq(rolePermissions.roleId, roleId)).all().map((row) => row.permissionId);
}
function getRolePermissionSlugsRecord(roleId) {
  return db.select({ slug: permissions.slug }).from(rolePermissions).innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id)).where(eq(rolePermissions.roleId, roleId)).all().map((row) => row.slug);
}
function getPermissionSlugsRecord(permissionIds) {
  if (permissionIds.length === 0) return [];
  return db.select({ id: permissions.id, slug: permissions.slug }).from(permissions).where(inArray(permissions.id, [...new Set(permissionIds)])).all();
}
async function loadAdminActor(userId) {
  const user = findUserByIdRecord(userId);
  if (!user) return null;
  const role = user.roleId ? findRoleByIdRecord(user.roleId) : void 0;
  return {
    id: user.id,
    roleId: user.roleId,
    isSystemRole: role?.isSystem === 1,
    permissions: new Set(await getUserPermissions(user.id))
  };
}
function hasAdminPermission(actor, permission) {
  return actor.isSystemRole || actor.permissions.has(permission);
}
function hasAnyAdminPermission(actor, permissions2) {
  return actor.isSystemRole || permissions2.some((permission) => actor.permissions.has(permission));
}
function permissionsWithinActor(actor, permissionSlugs) {
  return actor.isSystemRole || permissionSlugs.every((permission) => actor.permissions.has(permission));
}
function canAssignRole(actor, roleId) {
  if (roleId === void 0 || roleId === null) return true;
  const role = findRoleByIdRecord(roleId);
  if (!role) return false;
  if (role.isSystem === 1) return actor.isSystemRole;
  return permissionsWithinActor(actor, getRolePermissionSlugsRecord(role.id));
}
function canManageExistingRole(actor, roleId) {
  const role = findRoleByIdRecord(roleId);
  if (!role || role.isSystem === 1) return false;
  if (actor.isSystemRole) return true;
  return permissionsWithinActor(actor, getRolePermissionSlugsRecord(role.id));
}
function canAssignPermissionIds(actor, permissionIds) {
  const uniqueIds = [...new Set(permissionIds)];
  const rows = getPermissionSlugsRecord(uniqueIds);
  if (rows.length !== uniqueIds.length) return false;
  return permissionsWithinActor(actor, rows.map((row) => row.slug));
}
function canManageSensitiveUserFields(actor, targetUserId) {
  return actor.id === targetUserId || hasAdminPermission(actor, "users.manage");
}
function getUser(id) {
  const user = findSafeUserByIdRecord(id);
  if (!user) return serviceNotFound("User");
  return serviceSuccess(user, "OK");
}
function getUserByEmail(email) {
  const user = findUserByEmailRecord(email);
  if (!user) return serviceNotFound("User");
  return serviceSuccess(user, "OK");
}
function listUsersPaginated(filters = {}) {
  const result = listUsersPaginatedRecord(filters);
  return serviceSuccess(result, "OK");
}
async function createUser(data, actorId) {
  const actor = await loadAdminActor(actorId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.create", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  if (!canAssignRole(actor, data.roleId)) return serviceForbidden("You cannot assign this role.");
  const existing = findUserByEmailRecord(data.email);
  if (existing) return serviceConflict("email", "A user with this email already exists.");
  const id = generateId();
  const now = getCurrentTimestamp();
  const passwordHash = await hashPassword(data.password);
  const created = createUserRecord({
    id,
    name: data.name,
    email: data.email,
    passwordHash,
    roleId: data.roleId ?? null,
    createdAt: now,
    updatedAt: now
  });
  return serviceSuccess(created, "User created.");
}
async function updateUser(id, data, currentUserId) {
  const actor = await loadAdminActor(currentUserId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.edit", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = findUserByIdRecord(id);
  if (!existing) return serviceNotFound("User");
  const isSelf = id === currentUserId;
  const changesSensitiveFields = data.email !== void 0 || data.password !== void 0 || data.roleId !== void 0;
  if (!isSelf && changesSensitiveFields) {
    if (!canManageSensitiveUserFields(actor, id) || !canAssignRole(actor, existing.roleId)) {
      return serviceForbidden("You cannot manage this user.");
    }
  }
  if (data.email !== void 0 && data.email !== existing.email) {
    const conflict = findUserByEmailRecord(data.email);
    if (conflict) return serviceConflict("email", "A user with this email already exists.");
  }
  if (data.roleId !== void 0) {
    if (isSelf) return serviceForbidden("You cannot change your own role.");
    if (!canAssignRole(actor, data.roleId)) return serviceForbidden("You cannot assign this role.");
  }
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.email !== void 0) updateData.email = data.email;
  if (data.password !== void 0) updateData.passwordHash = await hashPassword(data.password);
  if (data.roleId !== void 0) updateData.roleId = data.roleId;
  const updated = updateUserRecord(id, updateData);
  if (!updated) return serviceNotFound("User");
  if (data.email !== void 0 || data.password !== void 0 || data.roleId !== void 0) {
    deleteRefreshSessionsForUser(id);
  }
  return serviceSuccess(updated, "User updated.");
}
async function deleteUser(id, currentUserId) {
  const actor = await loadAdminActor(currentUserId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.delete", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = findUserByIdRecord(id);
  if (!existing) return serviceNotFound("User");
  if (id === currentUserId) return serviceForbidden("You cannot delete your own account.");
  if (!canAssignRole(actor, existing.roleId)) return serviceForbidden("You cannot manage this user.");
  deleteUserRecord(id);
  return serviceSuccess(null, "User deleted.");
}
async function duplicateUser(id, currentUserId) {
  const actor = await loadAdminActor(currentUserId);
  if (!actor || !hasAnyAdminPermission(actor, ["users.create", "users.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = findUserByIdRecord(id);
  if (!existing) return serviceNotFound("User");
  if (!canAssignRole(actor, existing.roleId)) return serviceForbidden("You cannot assign this role.");
  const newId = generateId();
  const now = getCurrentTimestamp();
  let newEmail = `duplicated_${existing.email}`;
  if (findUserByEmailRecord(newEmail)) {
    const ts = now.toString(36).slice(-4);
    newEmail = `duplicated_${ts}_${existing.email}`;
  }
  try {
    const created = createUserRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      email: newEmail,
      passwordHash: existing.password,
      // duplicate password hash
      roleId: existing.roleId,
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
  for (const id of ids) {
    const result = await deleteUser(id, currentUserId);
    results.push({ id, success: result.success, error: !result.success ? result.error.message : void 0 });
  }
  return serviceSuccess(results, "Bulk delete completed.");
}
async function bulkDuplicateUsers(ids, currentUserId) {
  const results = [];
  for (const id of ids) {
    const result = await duplicateUser(id, currentUserId);
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id });
    } else {
      results.push({ id, success: false });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
const loginSchema = z.object({
  email: z.string().max(254, "Email is too long").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});
const DUMMY_PASSWORD_HASH = "$2b$12$o0uJ9XsFOcfthEY.ALXOH.hYe9WJIhl6AFPTnQ5gOOJ5OMaarBZN2";
async function handlePasswordLogin(body) {
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
  if (!isWithinRateLimit("login:global", 100, 15 * 60 * 1e3)) {
    return {
      success: false,
      status: 429,
      message: "Too many requests. Please try again later."
    };
  }
  if (!isWithinRateLimit(`login:email:${normalizedEmail}`, 5, 15 * 60 * 1e3)) {
    return {
      success: false,
      status: 429,
      message: "Too many requests. Please try again later."
    };
  }
  const userResult = getUserByEmail(email);
  const isValid = await verifyPassword(password, userResult.success ? userResult.data.password : DUMMY_PASSWORD_HASH);
  if (!userResult.success || !isValid) {
    return {
      success: false,
      status: 401,
      message: "Invalid credentials."
    };
  }
  const safeUser = { ...userResult.data };
  Reflect.deleteProperty(safeUser, "password");
  return {
    success: true,
    status: 200,
    message: "Login successful.",
    user: safeUser
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
async function requireAnyPermission(session2, permissions2) {
  if (!session2?.user) return adminUnauthorized();
  const authorised = await canAny(session2.user.id, permissions2);
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
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  type: z.string().min(1).max(64).regex(slugRegex, "Type must contain only lowercase alphanumeric characters and hyphens").default("post"),
  status: publishStatusEnum.default("published"),
  description: emptyToNull,
  image: imageUrlSimpleSchema
});
const updateCategorySchema = createCategorySchema.partial();
const builtInContentTypes = ["post", "page"];
function isKnownContentType(type) {
  return builtInContentTypes.includes(type) || getServerContentTypeRegistry().contentTypes.some((contentType) => contentType.slug === type);
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
    parsedIds.ids.map(async (id) => {
      const category = findCategoryByIdRecord(id);
      return category && canCategory(session2.user.id, category.type, action);
    })
  );
  return allowed.every(Boolean) ? { ids } : { perm: adminError(INSUFFICIENT$1, 403), ids };
}
async function handleListCategories(session2, filters) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const type = filters?.type ?? "post";
  if (!await canCategory(session2.user.id, type, "view")) return adminError(INSUFFICIENT$1, 403);
  const result = listCategories({ ...filters, type });
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
async function handleGetCategory(session2, id) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const category = findCategoryByIdRecord(id);
  if (!category) return adminError(CATEGORY_NOT_FOUND, 404);
  if (!await canCategory(session2.user.id, category.type, "view")) return adminError(INSUFFICIENT$1, 403);
  return adminSuccess(category);
}
async function handleUpdateCategory(session2, id, body) {
  const parsed = parseWithSchema(updateCategorySchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const existing = findCategoryByIdRecord(id);
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
  const result = await updateCategory(id, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicateCategory(session2, id) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = findCategoryByIdRecord(id);
  if (!existing || !await canCategory(session2.user.id, existing.type, "manage"))
    return adminError(INSUFFICIENT$1, 403);
  const result = duplicateCategory(id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteCategory(session2, id) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = findCategoryByIdRecord(id);
  if (!existing || !await canCategory(session2.user.id, existing.type, "manage"))
    return adminError(INSUFFICIENT$1, 403);
  const result = deleteCategory(id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleBulkDeleteCategories(session2, ids) {
  const { perm } = await guardBulkCategory(session2, ids, "manage");
  if (perm) return perm;
  const result = bulkDeleteCategories(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkDuplicateCategories(session2, ids) {
  const { perm } = await guardBulkCategory(session2, ids, "manage");
  if (perm) return perm;
  const result = bulkDuplicateCategories(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkUpdateCategoryStatus(session2, ids, status2) {
  const action = status2 === "published" ? "publish" : "unpublish";
  const { perm } = await guardBulkCategory(session2, ids, action);
  if (perm) return perm;
  const result = bulkUpdateCategoryStatus(ids, status2);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
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
const INSUFFICIENT = "Insufficient permissions.";
async function canPost(userId, type, action) {
  return isKnownContentType(type) && can(userId, contentPermission(type, action));
}
async function canEditPost(userId, id) {
  const result = getPost(id);
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
    parsedIds.ids.map(async (id) => {
      const post = getPost(id);
      return post.success && canPost(session2.user.id, post.data.type, action);
    })
  );
  return allowed.every(Boolean) ? null : adminError(INSUFFICIENT, 403);
}
async function handleListPosts(session2, filters) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const type = filters.type ?? "post";
  if (!await canPost(session2.user.id, type, "view")) return adminError(INSUFFICIENT, 403);
  const result = listPosts({ ...filters, type });
  return result.success ? adminSuccess(result.data) : mapServiceError(result);
}
async function handleCreatePost(session2, body) {
  const parsed = parseWithSchema(createPostSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const perm = await guardPost(session2, parsed.data.type, "create");
  if (perm) return perm;
  const result = createPost(parsed.data, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetPost(session2, id) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const result = getPost(id);
  if (!result.success) return adminError(result.error.message, 404);
  if (!await canPost(session2.user.id, result.data.type, "view")) return adminError(INSUFFICIENT, 403);
  return adminSuccess(result.data);
}
async function handleUpdatePost(session2, id, body) {
  if (!await canEditPost(session2?.user?.id ?? "", id)) return adminError(INSUFFICIENT, 403);
  const parsed = parseWithSchema(updatePostSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const existing = getPost(id);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (parsed.data.type !== void 0 && parsed.data.type !== existing.data.type)
    return adminError("Content type cannot be changed.", 422);
  if (parsed.data.status === "published" && existing.data.status !== "published" && !await canPost(session2.user.id, existing.data.type, "publish"))
    return adminError(INSUFFICIENT, 403);
  if (parsed.data.status === "draft" && existing.data.status === "published" && !await canPost(session2.user.id, existing.data.type, "unpublish"))
    return adminError(INSUFFICIENT, 403);
  const result = updatePost(id, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicatePost(session2, id) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = getPost(id);
  if (!existing.success || !await canPost(session2.user.id, existing.data.type, "create") || !await canEditPost(session2.user.id, id)) {
    return adminError(INSUFFICIENT, 403);
  }
  const result = duplicatePost(id, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeletePost(session2, id) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const existing = getPost(id);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (!await canPost(session2.user.id, existing.data.type, "delete")) return adminError(INSUFFICIENT, 403);
  const result = deletePost(id);
  return result.success ? adminSuccess(null, result.message) : mapServiceError(result);
}
async function handleBulkDeletePosts(session2, ids) {
  const perm = await guardBulkPost(session2, ids, "delete");
  if (perm) return perm;
  const result = bulkDeletePosts(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkPublishPosts(session2, ids) {
  const perm = await guardBulkPost(session2, ids, "publish");
  if (perm) return perm;
  const result = bulkPublishPosts(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkUnpublishPosts(session2, ids) {
  const perm = await guardBulkPost(session2, ids, "unpublish");
  if (perm) return perm;
  const result = bulkUnpublishPosts(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkDuplicatePosts(session2, ids) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const allowed = await Promise.all(
    parsedIds.ids.map(async (id) => {
      const post = getPost(id);
      return post.success && await canPost(session2.user.id, post.data.type, "create") && await canEditPost(session2.user.id, id);
    })
  );
  if (!allowed.every(Boolean)) return adminError(INSUFFICIENT, 403);
  const result = bulkDuplicatePosts(parsedIds.ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  email: z.string().max(254, "Email is too long").email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters").max(128, "Password must be at most 128 characters"),
  roleId: z.string().regex(ulidRegex, "Invalid role ID format").optional()
});
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  email: z.string().max(254, "Email is too long").email("Invalid email address").optional(),
  password: z.string().min(12, "Password must be at least 12 characters").max(128, "Password must be at most 128 characters").optional(),
  roleId: z.string().regex(ulidRegex, "Invalid role ID format").nullable().optional()
});
const USER_CREATE_PERMS = ["users.create", "users.manage"];
const USER_EDIT_PERMS = ["users.edit", "users.manage"];
async function handleListUsers(session2, filters) {
  const perm = await requirePermission(session2, "users.view");
  if (perm) return perm;
  const result = listUsersPaginated(filters ?? {});
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
async function handleGetUser(session2, id) {
  const perm = await requirePermission(session2, "users.view");
  if (perm) return perm;
  const result = getUser(id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404);
}
async function handleUpdateUser(session2, id, body) {
  const perm = await requireAnyPermission(session2, USER_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(updateUserSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await updateUser(id, parsed.data, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicateUser(session2, id) {
  const perm = await requireAnyPermission(session2, USER_CREATE_PERMS);
  if (perm) return perm;
  const result = await duplicateUser(id, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteUser(session2, id) {
  const perm = await requireAnyPermission(session2, ["users.delete", "users.manage"]);
  if (perm) return perm;
  const result = await deleteUser(id, session2.user.id);
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
function generateRoleSlug(name) {
  return slugify(name) || "role";
}
function listRolesService(filters) {
  const rolesWithCount = listRolesWithUserCountRecords(filters);
  const enriched = rolesWithCount.map((role) => ({
    ...role,
    permissionIds: getRolePermissionIdsRecord(role.id)
  }));
  return serviceSuccess(enriched, "Roles retrieved.");
}
function getRole(id) {
  const role = findRoleByIdRecord(id);
  if (!role) return serviceNotFound("Role");
  return serviceSuccess({ ...role, permissionIds: getRolePermissionIdsRecord(id) }, "Role retrieved.");
}
async function syncPermissions$1(actorId) {
  const actor = await loadAdminActor(actorId);
  if (!actor || !hasAnyAdminPermission(actor, ["roles.manage"])) return serviceForbidden("Insufficient permissions.");
  const result = syncPermissionRecords(getPermissionDefinitions());
  return serviceSuccess(result, "Permissions synced.");
}
async function createRole(data, actorId) {
  const actor = await loadAdminActor(actorId);
  if (!actor || !hasAnyAdminPermission(actor, ["roles.create", "roles.manage"])) return serviceForbidden("Insufficient permissions.");
  if (!canAssignPermissionIds(actor, data.permissionIds)) return serviceForbidden("You cannot assign these permissions.");
  const slug = data.slug ?? generateRoleSlug(data.name);
  const existing = findRoleBySlugRecord(slug);
  if (existing) return serviceConflict("slug", "A role with this slug already exists.");
  const id = generateId();
  const now = getCurrentTimestamp();
  const created = createRoleRecord({
    id,
    name: data.name,
    slug,
    description: data.description ?? null,
    permissionIds: [...new Set(data.permissionIds)],
    createdAt: now,
    updatedAt: now
  });
  return serviceSuccess(created, "Role created.");
}
async function updateRole(id, data, actorId) {
  const actor = await loadAdminActor(actorId);
  if (!actor || !hasAnyAdminPermission(actor, ["roles.edit", "roles.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = findRoleByIdRecord(id);
  if (!existing) return serviceNotFound("Role");
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be modified.");
  if (!canManageExistingRole(actor, id)) return serviceForbidden("You cannot manage this role.");
  if (data.permissionIds !== void 0 && !canAssignPermissionIds(actor, data.permissionIds)) {
    return serviceForbidden("You cannot assign these permissions.");
  }
  if (data.name !== void 0) {
    const newSlug = generateRoleSlug(data.name);
    const conflict = findRoleBySlugRecord(newSlug);
    if (conflict && conflict.id !== id) return serviceConflict("slug", "A role with this slug already exists.");
  }
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) {
    updateData.name = data.name;
    updateData.slug = generateRoleSlug(data.name);
  }
  if (data.description !== void 0) updateData.description = data.description;
  if (data.permissionIds !== void 0) updateData.permissionIds = [...new Set(data.permissionIds)];
  const updated = updateRoleRecord(id, updateData);
  if (!updated) return serviceNotFound("Role");
  deleteRefreshSessionsForRole(id);
  return serviceSuccess(updated, "Role updated.");
}
async function deleteRole(id, actorId) {
  const actor = await loadAdminActor(actorId);
  if (!actor || !hasAnyAdminPermission(actor, ["roles.delete", "roles.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = findRoleByIdRecord(id);
  if (!existing) return serviceNotFound("Role");
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be deleted.");
  if (actor.roleId === id) return serviceForbidden("You cannot delete your own role.");
  if (!canManageExistingRole(actor, id)) return serviceForbidden("You cannot manage this role.");
  deleteRefreshSessionsForRole(id);
  deleteRoleRecord(id);
  return serviceSuccess(null, "Role deleted.");
}
async function duplicateRole(id, actorId) {
  const actor = await loadAdminActor(actorId);
  if (!actor || !hasAnyAdminPermission(actor, ["roles.create", "roles.manage"])) return serviceForbidden("Insufficient permissions.");
  const existing = findRoleByIdRecord(id);
  if (!existing) return serviceNotFound("Role");
  if (!canManageExistingRole(actor, id)) return serviceForbidden("You cannot duplicate this role.");
  const newId = generateId();
  const now = getCurrentTimestamp();
  let newSlug = `${existing.slug}-copy`;
  let counter = 1;
  while (findRoleBySlugRecord(newSlug)) {
    newSlug = `${existing.slug}-copy-${counter}`;
    counter++;
  }
  try {
    const created = createRoleRecord({
      id: newId,
      name: `${existing.name} (Copy)`,
      slug: newSlug,
      description: existing.description ? `${existing.description} (Copy)` : null,
      permissionIds: getRolePermissionIdsRecord(existing.id),
      createdAt: now,
      updatedAt: now
    });
    return serviceSuccess(created, "Role duplicated.");
  } catch {
    return { success: false, error: { code: "db_error", message: "Failed to duplicate role." } };
  }
}
async function bulkDeleteRoles(ids, actorId) {
  const results = [];
  for (const id of ids) {
    const result = await deleteRole(id, actorId);
    results.push({ id, success: result.success, error: !result.success ? result.error.message : void 0 });
  }
  return serviceSuccess(results, "Bulk delete completed.");
}
async function bulkDuplicateRoles(ids, actorId) {
  const results = [];
  for (const id of ids) {
    const result = await duplicateRole(id, actorId);
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id });
    } else {
      results.push({ id, success: false });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
const createRoleSchema = z.object({
  // Required: non-empty, max 100 characters
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  // Optional: auto-generated from name if not provided; lowercase alphanumeric + hyphens
  slug: z.string().regex(slugRegex, "Slug must contain only lowercase alphanumeric characters and hyphens").optional(),
  // Optional: empty → null transform (Req 9.9)
  description: emptyToNull,
  // Required: array of ULID strings (permission IDs)
  permissionIds: z.array(z.string().regex(ulidRegex, "Invalid permission ID format")).max(100, "Too many permissions").min(1, "At least one permission is required")
});
const updateRoleSchema = z.object({
  // Optional: non-empty if provided, max 100 characters
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  // Optional: empty → null transform (Req 9.9)
  description: emptyToNull,
  // Optional: array of ULID strings (permission IDs)
  permissionIds: z.array(z.string().regex(ulidRegex, "Invalid permission ID format")).max(100, "Too many permissions").optional()
});
const ROLE_EDIT_PERMS = ["roles.edit", "roles.manage"];
async function handleListRoles(session2, filters) {
  const perm = await requirePermission(session2, "roles.view");
  if (perm) return perm;
  const rolesResult = listRolesService(filters);
  return adminSuccess({
    roles: rolesResult.success ? rolesResult.data : [],
    permissions: listAllPermissionRecords()
  });
}
async function handleSyncPermissions(session2) {
  const perm = await requirePermission(session2, "roles.manage");
  if (perm) return perm;
  const result = await syncPermissions$1(session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleCreateRole(session2, body) {
  const perm = await requireAnyPermission(session2, ["roles.create", "roles.manage"]);
  if (perm) return perm;
  const parsed = parseWithSchema(createRoleSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await createRole(parsed.data, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetRole(session2, id) {
  const perm = await requirePermission(session2, "roles.view");
  if (perm) return perm;
  const result = getRole(id);
  if (!result.success) return adminError(result.error.message, 404);
  return adminSuccess({ role: result.data, permissions: listAllPermissionRecords() });
}
async function handleUpdateRole(session2, id, body) {
  const perm = await requireAnyPermission(session2, ROLE_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(updateRoleSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await updateRole(id, parsed.data, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicateRole(session2, id) {
  const perm = await requireAnyPermission(session2, ["roles.create", "roles.manage"]);
  if (perm) return perm;
  const result = await duplicateRole(id, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteRole(session2, id) {
  const perm = await requireAnyPermission(session2, ["roles.delete", "roles.manage"]);
  if (perm) return perm;
  const result = await deleteRole(id, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleBulkDeleteRoles(session2, ids) {
  const perm = await requireAnyPermission(session2, ["roles.delete", "roles.manage"]);
  if (perm) return perm;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const result = await bulkDeleteRoles(parsedIds.ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkDuplicateRoles(session2, ids) {
  const perm = await requireAnyPermission(session2, ["roles.create", "roles.manage"]);
  if (perm) return perm;
  const parsedIds = parseBulkIds(ids);
  if (!parsedIds.success) return adminError(parsedIds.message, 400);
  const result = await bulkDuplicateRoles(parsedIds.ids, session2.user.id);
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
  return adminSuccess(getSiteSettings());
}
async function handleUpdateSettings(session2, body) {
  const perm = await requirePermission(session2, "settings.manage");
  if (perm) return perm;
  const parsed = parseWithSchema(updateSettingsSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = updateSiteSettings(parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function updateProfile(userId, data) {
  const existing = findUserByIdRecord(userId);
  if (!existing) return serviceNotFound("User");
  if (data.email !== void 0 && data.email !== existing.email) {
    const conflict = findUserByEmailRecord(data.email);
    if (conflict) return serviceConflict("email", "A user with this email already exists.");
  }
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.email !== void 0) updateData.email = data.email;
  if (data.password !== void 0) updateData.passwordHash = await hashPassword(data.password);
  const updated = updateUserRecord(userId, updateData);
  if (!updated) return serviceNotFound("User");
  if (data.email !== void 0 || data.password !== void 0) {
    deleteRefreshSessionsForUser(userId);
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
const MENU_EDIT_PERMS = ["menus.edit", "menus.manage"];
async function handleListMenus(session2) {
  const perm = await requirePermission(session2, "menus.view");
  if (perm) return perm;
  const result = listMenus();
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleCreateMenu(session2, body) {
  const perm = await requirePermission(session2, "menus.create");
  if (perm) return perm;
  const parsed = parseWithSchema(createMenuSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  if (parsed.data.status === "published" && !await can(session2.user.id, "menus.publish")) return adminError("Insufficient permissions.", 403);
  const result = createMenu(parsed.data);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetMenu(session2, id) {
  const perm = await requirePermission(session2, "menus.view");
  if (perm) return perm;
  const result = getMenu(id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404);
}
async function handleUpdateMenu(session2, id, body) {
  const perm = await requireAnyPermission(session2, MENU_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(updateMenuSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const existing = getMenu(id);
  if (!existing.success) return adminError(existing.error.message, 404);
  if (parsed.data.status === "published" && existing.data.status !== "published" && !await can(session2.user.id, "menus.publish")) return adminError("Insufficient permissions.", 403);
  if (parsed.data.status === "draft" && existing.data.status === "published" && !await can(session2.user.id, "menus.unpublish")) return adminError("Insufficient permissions.", 403);
  const result = updateMenu(id, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteMenu(session2, id) {
  const perm = await requirePermission(session2, "menus.delete");
  if (perm) return perm;
  const result = deleteMenu(id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleReorderMenus(session2, body) {
  const perm = await requireAnyPermission(session2, MENU_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(reorderMenusSchema, body, "Invalid reorder data.");
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = reorderMenus(parsed.data);
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
function generateMediaPath(id, extension) {
  return `storage/${id}.${extension}`;
}
function generateThumbnailPath(id) {
  return `storage/${id}_thumb.webp`;
}
function getExtensionFromMimeType(mimeType) {
  return MIME_TO_EXTENSION[mimeType] ?? "";
}
function getUploadDir() {
  return process.env.UPLOAD_DIR || "./public";
}
const MAX_FILTER_TEXT_LENGTH = 100;
function findMediaByIdRecord(id) {
  return db.select().from(media).where(eq(media.id, id)).get();
}
function listMediaRecords(filters) {
  const { page, perPage, offset } = clampPagination(filters);
  const conditions = [];
  const search2 = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH);
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
      mimeType.endsWith("/*") ? like(media.mimeType, mimeType.replace("*", "%")) : eq(media.mimeType, mimeType)
    );
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  let query = db.select().from(media);
  if (whereClause) query = query.where(whereClause);
  const totalQuery = db.select({ value: count() }).from(media);
  const totalRows = whereClause ? totalQuery.where(whereClause).all() : totalQuery.all();
  const total = totalRows[0]?.value ?? 0;
  const data = query.orderBy(desc(media.createdAt)).limit(perPage).offset(offset).all();
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
function createMediaRecord$1(input) {
  db.insert(media).values(input).run();
  return findMediaByIdRecord(input.id);
}
function updateMediaRecord(id, input) {
  db.update(media).set(input).where(eq(media.id, id)).run();
  return findMediaByIdRecord(id) ?? null;
}
function deleteMediaRecord(id) {
  return db.delete(media).where(eq(media.id, id)).run().changes > 0;
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
function listMediaService(filters = {}) {
  const result = listMediaRecords(filters);
  return serviceSuccess(result, "OK");
}
function getMedia(id) {
  const item = findMediaByIdRecord(id);
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
  return createMediaRecord({
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
function createMediaRecord(params) {
  const id = params.id ?? generateId();
  const now = getCurrentTimestamp();
  const record = createMediaRecord$1({
    id,
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
function updateMedia(id, data) {
  const existing = findMediaByIdRecord(id);
  if (!existing) return serviceNotFound("Media");
  const now = getCurrentTimestamp();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.alt !== void 0) updateData.alt = data.alt;
  if (data.caption !== void 0) updateData.caption = data.caption;
  if (data.folder !== void 0) updateData.folder = data.folder;
  const updated = updateMediaRecord(id, updateData);
  if (!updated) return serviceNotFound("Media");
  return serviceSuccess(updated, "Media updated.");
}
function deleteMedia(id) {
  const existing = findMediaByIdRecord(id);
  if (!existing) return serviceNotFound("Media");
  deleteMediaRecord(id);
  return serviceSuccess(null, "Media deleted.");
}
async function processUploadedFile(buffer, mimeType, id) {
  const fileId = id ?? generateId();
  const extension = getExtensionFromMimeType(mimeType);
  const relativePath = generateMediaPath(fileId, extension);
  const uploadDir = getUploadDir();
  const absolutePath = path.resolve(uploadDir, relativePath);
  const dir = path.dirname(absolutePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(absolutePath, buffer);
  let width = null;
  let height = null;
  let thumbnailUrl = null;
  if (isImageMimeType(mimeType) && mimeType !== "image/svg+xml") {
    try {
      const metadata = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      const thumbRelativePath = generateThumbnailPath(fileId);
      const thumbAbsolutePath = path.resolve(uploadDir, thumbRelativePath);
      await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).resize(300, 300, { fit: "cover" }).webp({ quality: 80 }).toFile(thumbAbsolutePath);
      if (mimeType !== "image/gif") {
        await Promise.all(
          [640, 1280].filter((responsiveWidth) => width !== null && width > responsiveWidth).map((responsiveWidth) => sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).resize({ width: responsiveWidth, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.resolve(uploadDir, relativePath.replace(/\.[^.]+$/, `_w${responsiveWidth}.webp`))))
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
    const uploadRoot = path.resolve(getUploadDir());
    const fileId = match[1];
    const candidates = /* @__PURE__ */ new Set([
      relativePath,
      `storage/${fileId}_thumb.webp`,
      `storage/${fileId}_w640.webp`,
      `storage/${fileId}_w1280.webp`
    ]);
    for (const candidate of candidates) {
      const filePath = path.resolve(uploadRoot, candidate);
      if (filePath === uploadRoot || !filePath.startsWith(`${uploadRoot}${path.sep}`)) continue;
      try {
        await unlink(filePath);
      } catch {
      }
    }
  } catch {
  }
}
async function handleListMedia(session2, filters) {
  const perm = await requirePermission(session2, "media.view");
  if (perm) return perm;
  const result = listMediaService(filters);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleGetMedia(session2, id) {
  const perm = await requirePermission(session2, "media.view");
  if (perm) return perm;
  if (!id) return adminError("Media id is required.", 400);
  const result = getMedia(id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 404);
}
async function handleUpdateMedia(session2, id, body) {
  if (!id) return adminError("Media id is required.", 400);
  const perm = await requirePermission(session2, "media.edit");
  if (perm) return perm;
  const parsed = parseWithSchema(updateMediaSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = updateMedia(id, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteMedia(session2, id) {
  if (!id) return adminError("Media id is required.", 400);
  const perm = await requirePermission(session2, "media.delete");
  if (perm) return perm;
  const mediaResult = getMedia(id);
  if (!mediaResult.success) return adminError(mediaResult.error.message, 404);
  const result = deleteMedia(id);
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
  for (const id of parsedIds.ids) {
    const mediaResult = getMedia(id);
    if (!mediaResult.success) {
      results.push({ id, success: false });
      continue;
    }
    const deleteResult = deleteMedia(id);
    results.push({ id, success: deleteResult.success });
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
const POST$s = async ({ request, cookies }) => {
  const body = await request.json();
  const result = await handlePasswordLogin(body);
  if (!result.success || !result.user) {
    return Response.json({ success: false, message: result.message }, { status: result.status });
  }
  const permissions2 = await getUserPermissions(result.user.id);
  const sessionId = crypto.randomUUID();
  const accessToken = await signAccessToken({
    sub: result.user.id,
    sessionId,
    email: result.user.email,
    roleId: result.user.roleId,
    permissions: permissions2
  });
  const refreshToken = await signRefreshToken({
    sub: result.user.id,
    sessionId
  });
  saveRefreshSession(sessionId, result.user.id, getRefreshSessionExpiry());
  cookies.set(ADMIN_ACCESS_COOKIE, accessToken, buildAdminAccessCookieOptions());
  cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, buildAdminRefreshCookieOptions());
  return Response.json({
    success: true,
    message: "Login successful.",
    data: {
      user: result.user,
      permissions: permissions2
    }
  });
};
const login = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$s
}, Symbol.toStringTag, { value: "Module" }));
const POST$r = async ({ cookies }) => {
  const refresh2 = readAdminRefreshToken(cookies);
  if (refresh2) {
    try {
      const payload = await verifyRefreshToken(refresh2);
      deleteRefreshSession(payload.sessionId);
    } catch {
    }
  }
  cookies.set(ADMIN_ACCESS_COOKIE, "", { ...buildAdminAccessCookieOptions(), maxAge: 0 });
  cookies.set(ADMIN_REFRESH_COOKIE, "", { ...buildAdminRefreshCookieOptions(), maxAge: 0 });
  return Response.json({ success: true, message: "Logged out." });
};
const logout = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$r
}, Symbol.toStringTag, { value: "Module" }));
const PUT$7 = async ({ request, locals }) => {
  const body = await request.json();
  return handleUpdateProfile(locals.session, body);
};
const profile = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PUT: PUT$7
}, Symbol.toStringTag, { value: "Module" }));
const POST$q = async ({ cookies }) => {
  const session2 = await refreshAdminSession(cookies);
  if (!session2) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }
  return Response.json({ success: true, data: session2 });
};
const refresh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$q
}, Symbol.toStringTag, { value: "Module" }));
const GET$g = async ({ cookies }) => {
  let session2 = await getAdminSession(cookies);
  if (!session2) {
    session2 = await refreshAdminSession(cookies);
  }
  if (!session2) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }
  const roleName = session2.user.roleId ? getRoleNameRecord(session2.user.roleId) : null;
  return Response.json({
    success: true,
    data: {
      user: session2.user,
      permissions: session2.permissions,
      roleName
    }
  });
};
const session = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$g
}, Symbol.toStringTag, { value: "Module" }));
const GET$f = async ({ params, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400);
  return handleGetCategory(locals.session, params.id);
};
const PUT$6 = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400);
  const body = await request.json();
  return handleUpdateCategory(locals.session, params.id, body);
};
const DELETE$5 = async ({ params, locals }) => {
  if (!params.id) return adminError("Category id is required.", 400);
  return handleDeleteCategory(locals.session, params.id);
};
const _id_$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$5,
  GET: GET$f,
  PUT: PUT$6
}, Symbol.toStringTag, { value: "Module" }));
const POST$p = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "Category id is required." }), { status: 400 });
  }
  return handleDuplicateCategory(locals.session, params.id);
};
const duplicate$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$p
}, Symbol.toStringTag, { value: "Module" }));
const POST$o = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDeleteCategories(locals.session, ids);
};
const _delete$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$o
}, Symbol.toStringTag, { value: "Module" }));
const POST$n = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDuplicateCategories(locals.session, ids);
};
const duplicate$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$n
}, Symbol.toStringTag, { value: "Module" }));
const POST$m = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  const status2 = body?.status === "published" || body?.status === "draft" ? body.status : null;
  if (!status2) return Response.json({ success: false, message: "Invalid category status." }, { status: 422 });
  return handleBulkUpdateCategoryStatus(locals.session, ids, status2);
};
const status = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$m
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$4 = /* @__PURE__ */ new Set(["name", "createdAt"]);
const VALID_SORT_ORDER$4 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$e = async ({ request, locals }) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || void 0;
  const search2 = url.searchParams.get("search") || void 0;
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const sortByValid = sortBy && VALID_SORT_BY$4.has(sortBy) ? sortBy : void 0;
  const sortOrderValid = sortOrder && VALID_SORT_ORDER$4.has(sortOrder) ? sortOrder : void 0;
  return handleListCategories(locals.session, { type, search: search2, sortBy: sortByValid, sortOrder: sortOrderValid });
};
const POST$l = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateCategory(locals.session, body);
};
const index$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$e,
  POST: POST$l
}, Symbol.toStringTag, { value: "Module" }));
const GET$d = async ({ locals }) => {
  const permission = await requirePermission(locals.session, "dashboard.view");
  if (permission) return permission;
  const stats = getDashboardStatsRecord();
  return adminSuccess(stats);
};
const dashboard = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$d
}, Symbol.toStringTag, { value: "Module" }));
const GET$c = async ({ params, locals }) => {
  return handleGetMedia(locals.session, params.id);
};
const PUT$5 = async ({ params, request, locals }) => {
  const body = await request.json();
  return handleUpdateMedia(locals.session, params.id, body);
};
const DELETE$4 = async ({ params, locals }) => {
  return handleDeleteMedia(locals.session, params.id);
};
const _id_$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$4,
  GET: GET$c,
  PUT: PUT$5
}, Symbol.toStringTag, { value: "Module" }));
const POST$k = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return handleBulkDeleteMedia(locals.session, ids);
};
const _delete$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$k
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$3 = /* @__PURE__ */ new Set(["name", "createdAt", "size"]);
const VALID_SORT_ORDER$3 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$b = async ({ request, locals }) => {
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
  if (sortBy && VALID_SORT_BY$3.has(sortBy)) filters.sortBy = sortBy;
  if (sortOrder && VALID_SORT_ORDER$3.has(sortOrder)) filters.sortOrder = sortOrder;
  return handleListMedia(locals.session, filters);
};
const POST$j = async ({ request, locals }) => {
  const formData = await request.formData();
  return handleUploadMedia(locals.session, formData);
};
const index$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$b,
  POST: POST$j
}, Symbol.toStringTag, { value: "Module" }));
const POST$i = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    return handleUploadMedia(locals.session, formData);
  } catch {
    return Response.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
};
const upload = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$i
}, Symbol.toStringTag, { value: "Module" }));
const GET$a = async ({ params, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400);
  return handleGetMenu(locals.session, params.id);
};
const PUT$4 = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400);
  const body = await request.json();
  return handleUpdateMenu(locals.session, params.id, body);
};
const DELETE$3 = async ({ params, locals }) => {
  if (!params.id) return adminError("Menu id is required.", 400);
  return handleDeleteMenu(locals.session, params.id);
};
const _id_$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$3,
  GET: GET$a,
  PUT: PUT$4
}, Symbol.toStringTag, { value: "Module" }));
const GET$9 = async ({ locals }) => {
  return handleListMenus(locals.session);
};
const POST$h = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateMenu(locals.session, body);
};
const index$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$9,
  POST: POST$h
}, Symbol.toStringTag, { value: "Module" }));
const POST$g = async ({ request, locals }) => {
  const body = await request.json();
  return handleReorderMenus(locals.session, body);
};
const reorder = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$g
}, Symbol.toStringTag, { value: "Module" }));
const GET$8 = async ({ params, locals }) => {
  return handleGetPost(locals.session, params.id);
};
const PUT$3 = async ({ params, request, locals }) => {
  const body = await request.json();
  return await handleUpdatePost(locals.session, params.id, body);
};
const DELETE$2 = async ({ params, locals }) => {
  return await handleDeletePost(locals.session, params.id);
};
const _id_$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$2,
  GET: GET$8,
  PUT: PUT$3
}, Symbol.toStringTag, { value: "Module" }));
const POST$f = async ({ params, locals }) => {
  return await handleDuplicatePost(locals.session, params.id);
};
const duplicate$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$f
}, Symbol.toStringTag, { value: "Module" }));
const POST$e = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDeletePosts(locals.session, ids);
};
const _delete$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$e
}, Symbol.toStringTag, { value: "Module" }));
const POST$d = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDuplicatePosts(locals.session, ids);
};
const duplicate$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$d
}, Symbol.toStringTag, { value: "Module" }));
const POST$c = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkPublishPosts(locals.session, ids);
};
const publish = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$c
}, Symbol.toStringTag, { value: "Module" }));
const POST$b = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkUnpublishPosts(locals.session, ids);
};
const unpublish = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$b
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$2 = /* @__PURE__ */ new Set(["title", "updatedAt"]);
const VALID_SORT_ORDER$2 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$7 = async ({ request, locals }) => {
  const url = new URL(request.url);
  const filters = {};
  const search2 = url.searchParams.get("search");
  const status2 = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  if (search2) filters.search = search2;
  if (status2) filters.status = status2;
  if (type) filters.type = type;
  if (sortBy && VALID_SORT_BY$2.has(sortBy)) filters.sortBy = sortBy;
  if (sortOrder && VALID_SORT_ORDER$2.has(sortOrder)) filters.sortOrder = sortOrder;
  return handleListPosts(locals.session, filters);
};
const POST$a = async ({ request, locals }) => {
  const body = await request.json();
  return await handleCreatePost(locals.session, body);
};
const index$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$7,
  POST: POST$a
}, Symbol.toStringTag, { value: "Module" }));
const GET$6 = async ({ params, locals }) => {
  if (!params.id) return adminError("Role id is required.", 400);
  return handleGetRole(locals.session, params.id);
};
const PUT$2 = async ({ params, request, locals }) => {
  if (!params.id) return adminError("Role id is required.", 400);
  const body = await request.json();
  return handleUpdateRole(locals.session, params.id, body);
};
const DELETE$1 = async ({ params, locals }) => {
  if (!params.id) return adminError("Role id is required.", 400);
  return handleDeleteRole(locals.session, params.id);
};
const _id_$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE: DELETE$1,
  GET: GET$6,
  PUT: PUT$2
}, Symbol.toStringTag, { value: "Module" }));
const POST$9 = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "Role id is required." }), { status: 400 });
  }
  return handleDuplicateRole(locals.session, params.id);
};
const duplicate$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$9
}, Symbol.toStringTag, { value: "Module" }));
const POST$8 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDeleteRoles(locals.session, ids);
};
const _delete$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$8
}, Symbol.toStringTag, { value: "Module" }));
const POST$7 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDuplicateRoles(locals.session, ids);
};
const duplicate$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$7
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$1 = /* @__PURE__ */ new Set(["name", "createdAt"]);
const VALID_SORT_ORDER$1 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$5 = async ({ request, locals }) => {
  const url = new URL(request.url);
  const search2 = url.searchParams.get("search") || void 0;
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const sortByValid = sortBy && VALID_SORT_BY$1.has(sortBy) ? sortBy : void 0;
  const sortOrderValid = sortOrder && VALID_SORT_ORDER$1.has(sortOrder) ? sortOrder : void 0;
  return handleListRoles(locals.session, { search: search2, sortBy: sortByValid, sortOrder: sortOrderValid });
};
const POST$6 = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateRole(locals.session, body);
};
const index$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$5,
  POST: POST$6
}, Symbol.toStringTag, { value: "Module" }));
const POST$5 = async ({ locals }) => {
  return handleSyncPermissions(locals.session);
};
const syncPermissions = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$5
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
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return handleBulkDeleteUsers(locals.session, ids);
};
const _delete = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$3
}, Symbol.toStringTag, { value: "Module" }));
const POST$2 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
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
  const roleId = url.searchParams.get("roleId") || void 0;
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const sortByValid = sortBy && VALID_SORT_BY.has(sortBy) ? sortBy : void 0;
  const sortOrderValid = sortOrder && VALID_SORT_ORDER.has(sortOrder) ? sortOrder : void 0;
  return handleListUsers(locals.session, { search: search2, roleId, sortBy: sortByValid, sortOrder: sortOrderValid });
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
const GET$1 = ({ params, request }) => {
  const registry = getServerContentTypeRegistry();
  const type = params.type;
  if (!type || !registry.contentTypes.some((contentType) => contentType.slug === type)) {
    return Response.json({ message: "Content type not found." }, { status: 404 });
  }
  const url = new URL(request.url);
  const requestedPage = Number(url.searchParams.get("page") ?? 1);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const result = listPublishedPostsByType(type, page, 24, {
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
  const recipients = getSiteSettings().email_notifications;
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
const GET = ({ request }) => {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (query.length < 2) return Response.json({ data: [] });
  const result = searchPublishedPosts(query, 1, 6);
  return Response.json({ data: result.success ? result.data.data : [] });
};
const search = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
export {
  ADMIN_PATH,
  adminRefreshSessions,
  apiApp,
  categories,
  categoriesRelations,
  beaver as default,
  getMenuTree,
  getPublicCustomFieldFiltersFromSearchParams,
  getPublishedArchiveFilterOptions,
  getPublishedPostByType,
  getSiteSettings,
  listPublishedPostsByTag,
  listPublishedPostsByType,
  media,
  mediaRelations,
  menus,
  menusRelations,
  migrate,
  permissions,
  permissionsRelations,
  postCategories,
  postCategoriesRelations,
  posts,
  postsRelations,
  resetSuperAdminPassword,
  rolePermissions,
  rolePermissionsRelations,
  roles,
  rolesRelations,
  sanitizeHtml,
  searchPublishedPosts,
  seed,
  seedTemplate,
  settings$1 as settings,
  users,
  usersRelations
};
