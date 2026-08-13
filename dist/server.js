import { existsSync, readFileSync, mkdirSync, writeFileSync, renameSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";
import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { createHash } from "node:crypto";
import { ulid } from "ulidx";
import { relations, or, like, eq, and, count, desc, asc, gt, inArray, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import sanitizeHtmlLibrary from "sanitize-html";
import sharp from "sharp";
import { jwtVerify, SignJWT } from "jose";
import { unlink } from "fs/promises";
import path from "path";
import fs from "fs";
import { z } from "zod";
import nodemailer from "nodemailer";
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
    throw new Error("zadm adminPath must be a single URL segment, such as panel-rahasia.");
  }
  return `/${segment}`;
}
function resolveRegistry(value, defaultFile, optionName) {
  const filePath = value instanceof URL ? fileURLToPath(value) : value ? resolve(process.cwd(), value) : fileURLToPath(new URL(defaultFile, import.meta.url));
  if (!filePath.endsWith(".json")) {
    throw new Error(`zadm ${optionName} must point to a JSON file.`);
  }
  if (!existsSync(filePath)) {
    throw new Error(`zadm ${optionName} does not exist: ${filePath}`);
  }
  return filePath;
}
function readRegistry(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}
function zadm(options = {}) {
  const adminPath = normalizePath(options.adminPath);
  const registries = {
    "@content-type-registry": resolveRegistry(options.contentTypeRegistry, "./registry/content-types.json", "contentTypeRegistry"),
    "@section-registry": resolveRegistry(options.sectionRegistry, "./registry/sections.json", "sectionRegistry"),
    "@menu-group-registry": resolveRegistry(options.menuGroupRegistry, "./registry/menu-groups.json", "menuGroupRegistry")
  };
  process.env.ZADM_CONTENT_TYPE_REGISTRY_PATH = registries["@content-type-registry"];
  process.env.ZADM_SECTION_REGISTRY_PATH = registries["@section-registry"];
  process.env.ZADM_MENU_GROUP_REGISTRY_PATH = registries["@menu-group-registry"];
  setContentTypeRegistry(readRegistry(registries["@content-type-registry"]));
  const compatShim = fileURLToPath(new URL("./compat/use-sync-external-store.js", import.meta.url));
  return {
    name: "zadm",
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
            ssr: { noExternal: ["zadm"] },
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
const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
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
  passwordResetTokens: many(passwordResetTokens),
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
  passwordResetTokens,
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
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
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
function sanitizeHtml(html) {
  if (!html) return "";
  return sanitizeHtmlLibrary(html, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "loading"],
      "*": ["class"]
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    exclusiveFilter(frame) {
      return frame.tag === "iframe" && !frame.attribs.src;
    },
    enforceHtmlBoundary: true,
    disallowedTagsMode: "discard"
  });
}
function sanitizeText(text2) {
  if (!text2) return "";
  return sanitizeHtmlLibrary(text2, { allowedTags: [], allowedAttributes: {} }).trim();
}
function toSafe(user) {
  const { password, ...safe } = user;
  return safe;
}
function findUserByIdRecord(id) {
  return db.select().from(users).where(eq(users.id, id)).get();
}
function findUserByEmailRecord(email) {
  return db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
}
function listUsersPaginatedRecord(filters) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(100, Math.max(1, filters.perPage ?? 20));
  const offset = (page - 1) * perPage;
  const conditions = [];
  if (filters.search) {
    conditions.push(
      or(like(users.name, `%${filters.search}%`), like(users.email, `%${filters.search}%`))
    );
  }
  if (filters.roleId) {
    conditions.push(eq(users.roleId, filters.roleId));
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
  const dataQuery = db.select().from(users);
  const paged = (whereClause ? dataQuery.where(whereClause) : dataQuery).orderBy(orderColumn).limit(perPage).offset(offset).all();
  return {
    data: paged.map(toSafe),
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
async function getUserPermissions(userId) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { roleId: true }
  });
  if (!user?.roleId) return [];
  const rolePerms = await db.query.rolePermissions.findMany({
    where: eq(rolePermissions.roleId, user.roleId),
    with: { permission: true }
  });
  return rolePerms.map((rolePermission) => rolePermission.permission.slug);
}
async function can(userId, permission) {
  return (await getUserPermissions(userId)).includes(permission);
}
async function canAny(userId, permissions2) {
  const userPermissions = await getUserPermissions(userId);
  return permissions2.some((permission) => userPermissions.includes(permission));
}
const ADMIN_ACCESS_COOKIE = "admin_access_token";
const ADMIN_REFRESH_COOKIE = "admin_refresh_token";
const secure = process.env.NODE_ENV === "production";
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
const encoder = new TextEncoder();
function getJwtSecret(name) {
  const value = process.env[name];
  if (value && value.length >= 32) return encoder.encode(value);
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be set to a random value of at least 32 characters in production.`);
  }
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
  const result = await jwtVerify(token, getAccessSecret());
  return result.payload;
}
async function verifyRefreshToken(token) {
  const result = await jwtVerify(token, getRefreshSecret());
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
function getCurrentTimestamp$1() {
  return Math.floor(Date.now() / 1e3);
}
function saveRefreshSession(sessionId, userId, expiresAt) {
  db.insert(adminRefreshSessions).values({
    id: sessionId,
    userId,
    expiresAt,
    createdAt: getCurrentTimestamp$1()
  }).run();
}
function deleteRefreshSession(sessionId) {
  db.delete(adminRefreshSessions).where(eq(adminRefreshSessions.id, sessionId)).run();
}
function consumeRefreshSession(sessionId) {
  const now = getCurrentTimestamp$1();
  const row = db.delete(adminRefreshSessions).where(and(eq(adminRefreshSessions.id, sessionId), gt(adminRefreshSessions.expiresAt, now))).returning({ userId: adminRefreshSessions.userId, expiresAt: adminRefreshSessions.expiresAt }).get();
  return row ?? null;
}
async function getAdminSession(cookies) {
  const access = readAdminAccessToken(cookies);
  if (!access) return null;
  try {
    const payload = await verifyAccessToken(access);
    const user = findSafeUserByIdRecord(payload.sub);
    if (!user) return null;
    return { user, permissions: payload.permissions };
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
      email: user.email,
      roleId: user.roleId,
      permissions: permissions2
    });
    const nextRefresh = await signRefreshToken({
      sub: user.id,
      sessionId: nextSessionId
    });
    saveRefreshSession(nextSessionId, user.id, Date.now() + 30 * 24 * 60 * 60 * 1e3);
    cookies.set(ADMIN_ACCESS_COOKIE, nextAccess, buildAdminAccessCookieOptions());
    cookies.set(ADMIN_REFRESH_COOKIE, nextRefresh, buildAdminRefreshCookieOptions());
    return { user, permissions: permissions2 };
  } catch {
    return null;
  }
}
const RATE_LIMITS = /* @__PURE__ */ new Map();
function applySecurityHeaders(context) {
  context.header("X-Content-Type-Options", "nosniff");
  context.header("X-Frame-Options", "SAMEORIGIN");
  context.header("Referrer-Policy", "strict-origin-when-cross-origin");
  context.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  context.header("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com; script-src 'self' 'unsafe-inline' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'");
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
    if (size > maximum) return "Request body is too large.";
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
    return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  }
  return "unknown";
}
function isWithinRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const current = RATE_LIMITS.get(key);
  if (!current || current.resetAt <= now) {
    RATE_LIMITS.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
const PUBLIC_PATHS = /* @__PURE__ */ new Set(["/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/session"]);
function readCookie(request, name) {
  const value = request.headers.get("cookie")?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1);
  return value ? { value } : void 0;
}
function requiredPermission(pathname, method) {
  const rest = pathname.slice("/api/admin".length);
  const read = method === "GET" || method === "HEAD";
  if (rest.startsWith("/users")) {
    if (read) return "users.view";
    if (rest.includes("/bulk/delete") || method === "DELETE") return "users.delete";
    if (rest.includes("duplicate") || method === "POST") return "users.create";
    return "users.edit";
  }
  if (rest.startsWith("/roles")) {
    if (read) return "roles.view";
    if (rest.includes("/bulk/delete") || method === "DELETE") return "roles.delete";
    if (rest.includes("duplicate") || method === "POST") return "roles.create";
    return "roles.edit";
  }
  if (rest.startsWith("/categories") || rest.startsWith("/posts")) return null;
  if (rest.startsWith("/menus")) {
    if (read) return "menus.view";
    if (method === "DELETE") return "menus.delete";
    if (method === "POST" && rest === "/menus") return "menus.create";
    return "menus.edit";
  }
  if (rest.startsWith("/media")) return read ? "media.view" : null;
  if (rest === "/settings") return "settings.manage";
  return null;
}
const adminSecurity = async (context, next) => {
  const request = context.req.raw;
  const pathname = new URL(request.url).pathname;
  const method = request.method;
  if (pathname === "/api/admin/auth/login" && method === "POST") {
    const client = clientAddress(request);
    if (!isWithinRateLimit(`${pathname}:${client}`, 10, 15 * 60 * 1e3)) return context.json({ success: false, message: "Too many requests. Please try again later." }, 429);
  }
  if (PUBLIC_PATHS.has(pathname)) return next();
  const session2 = await getAdminSession({ get: (name) => readCookie(request, name), set: () => void 0 });
  if (!session2) return context.json({ success: false, message: "Unauthorized." }, 401);
  const permission = requiredPermission(pathname, method);
  if (permission && (!session2.permissions.includes(permission) || !await can(session2.user.id, permission))) {
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
  .../* @__PURE__ */ Object.assign({ "./admin/auth/login.ts": () => Promise.resolve().then(() => login), "./admin/auth/logout.ts": () => Promise.resolve().then(() => logout), "./admin/auth/profile.ts": () => Promise.resolve().then(() => profile), "./admin/auth/refresh.ts": () => Promise.resolve().then(() => refresh), "./admin/auth/session.ts": () => Promise.resolve().then(() => session), "./admin/categories/[id].ts": () => Promise.resolve().then(() => _id_$5), "./admin/categories/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$7), "./admin/categories/bulk/delete.ts": () => Promise.resolve().then(() => _delete$4), "./admin/categories/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$6), "./admin/categories/bulk/status.ts": () => Promise.resolve().then(() => status), "./admin/categories/index.ts": () => Promise.resolve().then(() => index$5), "./admin/dashboard.ts": () => Promise.resolve().then(() => dashboard), "./admin/media/[id].ts": () => Promise.resolve().then(() => _id_$4), "./admin/media/bulk/delete.ts": () => Promise.resolve().then(() => _delete$3), "./admin/media/index.ts": () => Promise.resolve().then(() => index$4), "./admin/media/upload.ts": () => Promise.resolve().then(() => upload), "./admin/menus/[id].ts": () => Promise.resolve().then(() => _id_$3), "./admin/menus/index.ts": () => Promise.resolve().then(() => index$3), "./admin/menus/reorder.ts": () => Promise.resolve().then(() => reorder), "./admin/middleware.ts": () => Promise.resolve().then(() => middleware), "./admin/posts/[id].ts": () => Promise.resolve().then(() => _id_$2), "./admin/posts/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$5), "./admin/posts/bulk/delete.ts": () => Promise.resolve().then(() => _delete$2), "./admin/posts/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$4), "./admin/posts/bulk/publish.ts": () => Promise.resolve().then(() => publish), "./admin/posts/bulk/unpublish.ts": () => Promise.resolve().then(() => unpublish), "./admin/posts/index.ts": () => Promise.resolve().then(() => index$2), "./admin/roles/[id].ts": () => Promise.resolve().then(() => _id_$1), "./admin/roles/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$3), "./admin/roles/bulk/delete.ts": () => Promise.resolve().then(() => _delete$1), "./admin/roles/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate$2), "./admin/roles/index.ts": () => Promise.resolve().then(() => index$1), "./admin/settings.ts": () => Promise.resolve().then(() => settings), "./admin/users/[id].ts": () => Promise.resolve().then(() => _id_), "./admin/users/[id]/duplicate.ts": () => Promise.resolve().then(() => duplicate$1), "./admin/users/bulk/delete.ts": () => Promise.resolve().then(() => _delete), "./admin/users/bulk/duplicate.ts": () => Promise.resolve().then(() => duplicate), "./admin/users/index.ts": () => Promise.resolve().then(() => index) }),
  .../* @__PURE__ */ Object.assign({ "./public/archive/[type].ts": () => Promise.resolve().then(() => _type_), "./public/contact.ts": () => Promise.resolve().then(() => contact), "./public/search.ts": () => Promise.resolve().then(() => search) }),
  .../* @__PURE__ */ Object.assign({})
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
apiApp.use("*", async (context, next) => {
  applySecurityHeaders(context);
  const request = context.req.raw;
  if (!isReadRequest(request.method)) {
    const pathname = new URL(request.url).pathname;
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
function clampPagination(filters) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(100, Math.max(1, filters.perPage ?? 20));
  const offset = (page - 1) * perPage;
  return { page, perPage, offset };
}
function buildPaginationMeta(page, perPage, total, offset) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total > 0 ? offset + 1 : 0;
  const to = Math.min(offset + perPage, total);
  return { currentPage: page, perPage, total, lastPage, from, to };
}
function generateUlid() {
  const ts = Date.now().toString(32).padStart(10, "0").toUpperCase();
  const rand = Array.from(
    { length: 16 },
    () => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]
  ).join("");
  return ts + rand;
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
  if (filters.search) {
    conditions.push(like(posts.title, `%${filters.search}%`));
  }
  if (filters.type) {
    conditions.push(eq(posts.type, filters.type));
  }
  if (filters.status) {
    conditions.push(eq(posts.status, filters.status));
  }
  if (filters.authorId) {
    conditions.push(eq(posts.authorId, filters.authorId));
  }
  if (filters.categoryId) {
    const matchingPostIds = db.select({ postId: postCategories.postId }).from(postCategories).where(eq(postCategories.categoryId, filters.categoryId)).all().map((row) => row.postId);
    if (matchingPostIds.length === 0) {
      return { data: [], meta: buildPaginationMeta(page, perPage, 0, offset) };
    }
    conditions.push(inArray(posts.id, matchingPostIds));
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
  const clampedPage = Math.max(1, page);
  const clampedPerPage = Math.min(100, Math.max(1, perPage));
  const offset = (clampedPage - 1) * clampedPerPage;
  const conditions = [eq(posts.type, type), eq(posts.status, "published")];
  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(or(like(posts.title, pattern), like(posts.excerpt, pattern), like(posts.description, pattern)));
  }
  if (filters.category) {
    const category = db.select({ id: categories.id }).from(categories).where(and(or(eq(categories.slug, filters.category), eq(categories.id, filters.category)), eq(categories.status, "published"))).get();
    if (!category) return { data: [], meta: buildPaginationMeta(clampedPage, clampedPerPage, 0, offset) };
    const matchingPostIds = db.select({ postId: postCategories.postId }).from(postCategories).where(eq(postCategories.categoryId, category.id)).all().map((row) => row.postId);
    if (matchingPostIds.length === 0) return { data: [], meta: buildPaginationMeta(clampedPage, clampedPerPage, 0, offset) };
    conditions.push(inArray(posts.id, matchingPostIds));
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
  const categoryOptions = db.selectDistinct({ name: categories.name, slug: categories.slug }).from(categories).innerJoin(postCategories, eq(categories.id, postCategories.categoryId)).innerJoin(posts, eq(postCategories.postId, posts.id)).where(and(eq(posts.type, type), eq(posts.status, "published"), eq(categories.status, "published"))).orderBy(asc(categories.name)).all();
  const tagRows = db.select({ tags: posts.tags }).from(posts).where(and(eq(posts.type, type), eq(posts.status, "published"))).all();
  const tags = [...new Set(tagRows.flatMap(({ tags: tags2 }) => {
    try {
      const value = tags2 ? JSON.parse(tags2) : [];
      return Array.isArray(value) ? value.filter((tag) => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
  }))].sort((a, b) => a.localeCompare(b));
  return { categories: categoryOptions, tags, customFields: [] };
}
function searchPublishedPostRecords(query, page = 1, perPage = 12) {
  const clampedPage = Math.max(1, page);
  const clampedPerPage = Math.min(100, Math.max(1, perPage));
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
  const clampedPage = Math.max(1, page);
  const clampedPerPage = Math.min(100, Math.max(1, perPage));
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
      id: generateUlid(),
      postId,
      categoryId,
      createdAt: now
    }).run();
  }
}
let loadedPath;
function getServerContentTypeRegistry() {
  const registryPath = process.env.ZADM_CONTENT_TYPE_REGISTRY_PATH;
  if (registryPath && registryPath !== loadedPath) {
    setContentTypeRegistry(JSON.parse(readFileSync(registryPath, "utf8")));
    loadedPath = registryPath;
  }
  return getContentTypeRegistry();
}
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
const cacheDirectory = process.env.PUBLIC_CACHE_DIR || join(process.cwd(), ".cache", "public-data");
const defaultTtlMs = Number(process.env.PUBLIC_CACHE_TTL_SECONDS || 300) * 1e3;
function cachePath(key) {
  const filename = createHash("sha256").update(key).digest("hex");
  return join(cacheDirectory, `${filename}.json`);
}
function getCachedPublicData(key, loader, ttlMs = defaultTtlMs) {
  const path2 = cachePath(key);
  try {
    if (existsSync(path2)) {
      const entry = JSON.parse(readFileSync(path2, "utf8"));
      if (entry.expiresAt > Date.now()) return entry.value;
    }
  } catch {
  }
  const value = loader();
  try {
    mkdirSync(dirname(path2), { recursive: true });
    const tempPath = `${path2}.${process.pid}.tmp`;
    writeFileSync(tempPath, JSON.stringify({ expiresAt: Date.now() + ttlMs, value }), "utf8");
    renameSync(tempPath, path2);
  } catch {
  }
  return value;
}
function invalidatePublicDataCache() {
  try {
    rmSync(cacheDirectory, { recursive: true, force: true });
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
function updatePost(id, data, _userId) {
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
  } catch (err) {
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
  } catch (err) {
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
  const post = getCachedPublicData(`post:published:${type}:${slug}`, () => findPublishedByTypeAndSlugRecord(type, slug));
  if (!post) return serviceNotFound("Post");
  return serviceSuccess(post, "OK");
}
function listPublishedPostsByType(type, page = 1, perPage = 12, filters = {}) {
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
  const cacheKey = [type, page, perPage, normalizedFilters.search?.toLowerCase() ?? "", normalizedFilters.category?.toLowerCase() ?? "", normalizedFilters.tag?.toLowerCase() ?? "", customFieldCacheKey, normalizedFilters.sortBy ?? "", normalizedFilters.sortOrder ?? ""].join(":");
  return serviceSuccess(getCachedPublicData(`posts:published:${cacheKey}`, () => listPublishedPostRecordsByType(type, page, perPage, normalizedFilters)), "OK");
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
  return (registry.templates.find((template) => template.id === contentType.detailTemplate && template.kind === "detail")?.fieldSlots ?? []).flatMap((field) => ["text", "number", "boolean", "select", "date"].includes(field.type) ? [{ name: field.key, label: field.label, type: field.type, options: [] }] : []);
}
function getPublicCustomFieldFiltersFromSearchParams(type, searchParams) {
  const allowedNames = new Set(getPublicCustomFieldFilters(type).map((field) => field.name));
  return Object.fromEntries([...searchParams.entries()].flatMap(([key, value]) => key.startsWith("field_") && allowedNames.has(key.slice(6)) ? [[key.slice(6), value]] : []));
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
  if (!normalizedQuery) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK");
  }
  const result = getCachedPublicData(
    `posts:published:search:${normalizedQuery.toLowerCase()}:${page}:${perPage}`,
    () => searchPublishedPostRecords(normalizedQuery, page, perPage)
  );
  return serviceSuccess(result, "OK");
}
function listPublishedPostsByTag(tag, page = 1, perPage = 12) {
  const normalizedTag = tag.trim().slice(0, 100);
  if (!normalizedTag) {
    return serviceSuccess({ data: [], meta: { currentPage: 1, perPage, total: 0, lastPage: 1, from: 0, to: 0 } }, "OK");
  }
  return serviceSuccess(
    getCachedPublicData(
      `posts:published:tag:${normalizedTag.toLowerCase()}:${page}:${perPage}`,
      () => listPublishedPostRecordsByTag(normalizedTag, page, perPage)
    ),
    "OK"
  );
}
function findMenuById(id) {
  return db.select().from(menus).where(eq(menus.id, id)).get();
}
function listMenus$1(type, publishedOnly = false) {
  const query = db.select().from(menus);
  const condition = type ? eq(menus.type, type) : void 0;
  const where = publishedOnly ? condition ? and(condition, eq(menus.status, "published")) : eq(menus.status, "published") : condition;
  return (where ? query.where(where) : query).all();
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
  const sortTree = (tree) => tree.sort((a, b) => a.position - b.position).map((node) => ({
    ...node,
    children: sortTree(node.children)
  }));
  return sortTree(roots);
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
  const id = generateId();
  const now = getCurrentTimestamp$1();
  const record = createMenuRecord({
    id,
    title: data.title,
    url: data.url,
    type: data.type ?? "custom",
    position: data.position ?? 0,
    cssClass: data.cssClass,
    target: data.target,
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
  const now = getCurrentTimestamp$1();
  const updateData = { updatedAt: now };
  if (data.title !== void 0) updateData.title = data.title;
  if (data.url !== void 0) updateData.url = data.url;
  if (data.type !== void 0) updateData.type = data.type;
  if (data.position !== void 0) updateData.position = data.position;
  if (data.cssClass !== void 0) updateData.cssClass = data.cssClass;
  if (data.target !== void 0) updateData.target = data.target;
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
  reorderMenuTree(flattenTree(data.tree));
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
  const now = getCurrentTimestamp$1();
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
function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1e3);
}
const DEFAULT_PERMISSIONS = [
  ...["post", "page", "article", "project", "product", "portfolio"].flatMap((type) => [
    { slug: `content.${type}.view`, name: `View ${type} content`, group: type },
    { slug: `content.${type}.create`, name: `Create ${type} content`, group: type },
    { slug: `content.${type}.edit`, name: `Edit any ${type} content`, group: type },
    { slug: `content.${type}.edit-own`, name: `Edit own ${type} content`, group: type },
    { slug: `content.${type}.delete`, name: `Delete ${type} content`, group: type },
    { slug: `content.${type}.publish`, name: `Publish ${type} content`, group: type },
    { slug: `content.${type}.unpublish`, name: `Unpublish ${type} content`, group: type },
    { slug: `category.${type}.view`, name: `View ${type} categories`, group: type },
    { slug: `category.${type}.manage`, name: `Manage ${type} categories`, group: type },
    { slug: `category.${type}.publish`, name: `Publish ${type} categories`, group: type },
    { slug: `category.${type}.unpublish`, name: `Unpublish ${type} categories`, group: type }
  ]),
  // media group
  { slug: "media.view", name: "View media library", group: "media" },
  { slug: "media.upload", name: "Upload new media", group: "media" },
  { slug: "media.edit", name: "Edit media metadata", group: "media" },
  { slug: "media.delete", name: "Delete media files", group: "media" },
  // menus group
  { slug: "menus.view", name: "View menus", group: "menus" },
  { slug: "menus.create", name: "Create menus", group: "menus" },
  { slug: "menus.edit", name: "Edit menus", group: "menus" },
  { slug: "menus.delete", name: "Delete menus", group: "menus" },
  { slug: "menus.publish", name: "Publish menus", group: "menus" },
  { slug: "menus.unpublish", name: "Unpublish menus", group: "menus" },
  // users group
  { slug: "users.view", name: "View users list", group: "users" },
  { slug: "users.create", name: "Create new users", group: "users" },
  { slug: "users.edit", name: "Edit user profiles", group: "users" },
  { slug: "users.delete", name: "Delete users", group: "users" },
  // roles group
  { slug: "roles.view", name: "View roles and permissions", group: "roles" },
  { slug: "roles.create", name: "Create roles", group: "roles" },
  { slug: "roles.edit", name: "Edit roles and assign permissions", group: "roles" },
  { slug: "roles.delete", name: "Delete roles", group: "roles" },
  // settings group
  { slug: "settings.manage", name: "Manage system settings", group: "settings" }
];
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
const ROLE_PERMISSION_MAP = {
  "super-admin": DEFAULT_PERMISSIONS.map((p) => p.slug),
  editor: [
    ...DEFAULT_PERMISSIONS.filter((permission) => permission.slug.startsWith("content.") || permission.slug.startsWith("category.")).map((permission) => permission.slug),
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
async function seed() {
  console.log("🌱 Seeding database...");
  const now = getCurrentTimestamp();
  db.transaction((tx) => {
    console.log("  → Inserting permissions...");
    const permissionRecords = [];
    for (const perm of DEFAULT_PERMISSIONS) {
      const id = ulid();
      tx.insert(permissions).values({
        id,
        name: perm.name,
        slug: perm.slug,
        group: perm.group,
        description: perm.name,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing({ target: permissions.slug }).run();
      permissionRecords.push({ id, slug: perm.slug });
    }
    const existingPermissions = tx.select({ id: permissions.id, slug: permissions.slug }).from(permissions).all();
    const permissionSlugToId = new Map(
      existingPermissions.map((p) => [p.slug, p.id])
    );
    console.log(`  ✓ ${existingPermissions.length} permissions ready`);
    console.log("  → Inserting roles...");
    for (const role of DEFAULT_ROLES) {
      tx.insert(roles).values({
        id: ulid(),
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
    for (const [roleSlug, permSlugs] of Object.entries(ROLE_PERMISSION_MAP)) {
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
          id: ulid(),
          roleId,
          permissionId,
          createdAt: now
        }).run();
        assignmentCount++;
      }
    }
    console.log(`  ✓ ${assignmentCount} role-permission assignments created`);
    console.log("  → Creating super-admin user...");
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;
    if (process.env.NODE_ENV === "production" && (!adminEmail || !adminPassword || !adminName || adminPassword.length < 12)) {
      throw new Error("Production seeding requires ADMIN_EMAIL, ADMIN_NAME, and an ADMIN_PASSWORD of at least 12 characters.");
    }
    const resolvedAdminEmail = adminEmail || "admin@example.com";
    const resolvedAdminPassword = adminPassword || "password123";
    const resolvedAdminName = adminName || "Super Admin";
    const hashedPassword = bcrypt.hashSync(resolvedAdminPassword, 12);
    const superAdminRoleId = roleSlugToId.get("super-admin");
    if (!superAdminRoleId) {
      console.warn("  ⚠ Super Admin role not found, skipping user creation");
    } else {
      tx.insert(users).values({
        id: ulid(),
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
function resetSuperAdminPassword() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters are required.");
  }
  const superAdmin = db.select({ id: roles.id }).from(roles).where(eq(roles.slug, "super-admin")).get();
  if (!superAdmin) throw new Error("The super-admin role does not exist. Run zadm seed first.");
  const user = db.select({ id: users.id }).from(users).where(and(eq(users.email, email), eq(users.roleId, superAdmin.id))).get();
  if (!user) throw new Error(`No super-admin user found for ${email}.`);
  const passwordHash = bcrypt.hashSync(password, 12);
  const now = getCurrentTimestamp$1();
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
function getUser(id) {
  const user = findUserByIdRecord(id);
  if (!user) return serviceNotFound("User");
  const { password, ...safe } = user;
  return serviceSuccess(safe, "OK");
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
async function createUser(data) {
  const existing = findUserByEmailRecord(data.email);
  if (existing) return serviceConflict("email", "A user with this email already exists.");
  const id = generateId();
  const now = getCurrentTimestamp$1();
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
  const existing = findUserByIdRecord(id);
  if (!existing) return serviceNotFound("User");
  if (data.email !== void 0 && data.email !== existing.email) {
    const conflict = findUserByEmailRecord(data.email);
    if (conflict) return serviceConflict("email", "A user with this email already exists.");
  }
  if (data.roleId !== void 0 && id === currentUserId) return serviceForbidden("You cannot change your own role.");
  const now = getCurrentTimestamp$1();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.email !== void 0) updateData.email = data.email;
  if (data.password !== void 0) updateData.passwordHash = await hashPassword(data.password);
  if (data.roleId !== void 0) updateData.roleId = data.roleId;
  const updated = updateUserRecord(id, updateData);
  if (!updated) return serviceNotFound("User");
  return serviceSuccess(updated, "User updated.");
}
function deleteUser(id, currentUserId) {
  const existing = findUserByIdRecord(id);
  if (!existing) return serviceNotFound("User");
  if (id === currentUserId) return serviceForbidden("You cannot delete your own account.");
  deleteUserRecord(id);
  return serviceSuccess(null, "User deleted.");
}
function duplicateUser(id, currentUserId) {
  const existing = findUserByIdRecord(id);
  if (!existing) return serviceNotFound("User");
  const newId = generateId();
  const now = getCurrentTimestamp$1();
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
function bulkDeleteUsers(ids, currentUserId) {
  const results = [];
  for (const id of ids) {
    const result = deleteUser(id, currentUserId);
    results.push({ id, success: result.success, error: !result.success ? result.error.message : void 0 });
  }
  return serviceSuccess(results, "Bulk delete completed.");
}
function bulkDuplicateUsers(ids, currentUserId) {
  const results = [];
  for (const id of ids) {
    const result = duplicateUser(id);
    if (result.success) {
      results.push({ id, success: true, newId: result.data.id });
    } else {
      results.push({ id, success: false });
    }
  }
  return serviceSuccess(results, "Bulk duplicate completed.");
}
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emptyToNull = z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional();
const imageUrlSchema = z.string().max(2048, "Image URL must be at most 2048 characters").refine(
  (val) => {
    if (val.startsWith("http://") || val.startsWith("https://")) {
      return z.string().url().safeParse(val).success;
    }
    return val.startsWith("/");
  },
  "Image must be a valid URL (http/https) or a relative path starting with /"
).nullable().optional();
const featuredImageSchema = z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(imageUrlSchema);
const galleryImageSchema = z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(imageUrlSchema);
const imageUrlSimpleSchema = z.string().transform((val) => val.trim() === "" ? null : val).nullable().optional().pipe(
  z.string().url("Image must be a valid URL").nullable().optional()
);
const publishStatusEnum = z.enum(["draft", "published"]);
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be at most 128 characters"),
  roleId: z.string().regex(ulidRegex, "Invalid role ID format").optional()
});
z.object({
  email: z.string().email("Invalid email address")
});
z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be at most 128 characters")
});
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
  const userResult = getUserByEmail(email);
  if (!userResult.success) {
    return {
      success: false,
      status: 401,
      message: "Invalid credentials."
    };
  }
  const isValid = await verifyPassword(password, userResult.data.password);
  if (!isValid) {
    return {
      success: false,
      status: 401,
      message: "Invalid credentials."
    };
  }
  const { password: _password, ...safeUser } = userResult.data;
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
function listCategoryRecords(filters) {
  const conditions = [];
  if (filters?.type) {
    conditions.push(eq(categories.type, filters.type));
  }
  if (filters?.search) {
    conditions.push(like(categories.name, `%${filters.search}%`));
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
  return (conditions.length > 0 ? query.where(and(...conditions)) : query).all();
}
function categorySlugExistsRecord(slug, excludeId) {
  const rows = db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).all();
  return excludeId ? rows.some((row) => row.id !== excludeId) : rows.length > 0;
}
function createCategoryRecord(input) {
  db.insert(categories).values(input).run();
  return {
    id: input.id,
    name: input.name,
    slug: input.slug,
    type: input.type,
    description: input.description,
    image: input.image,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
  };
}
function updateCategoryRecord(id, input) {
  const updates = { updatedAt: input.updatedAt };
  if (input.name !== void 0) updates.name = input.name;
  if (input.slug !== void 0) updates.slug = input.slug;
  if (input.type !== void 0) updates.type = input.type;
  if (input.description !== void 0) updates.description = input.description;
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
  const now = getCurrentTimestamp$1();
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
  const now = getCurrentTimestamp$1();
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
  const now = getCurrentTimestamp$1();
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
  const now = getCurrentTimestamp$1();
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
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  type: z.string().default("post"),
  status: publishStatusEnum.default("published"),
  description: emptyToNull,
  image: imageUrlSimpleSchema
});
const updateCategorySchema = createCategorySchema.partial();
const builtInContentTypes = ["post", "page"];
[
  ...builtInContentTypes,
  ...getServerContentTypeRegistry().contentTypes.map((contentType) => contentType.slug)
];
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
  if (unauth) return { unauth, ids };
  if (ids.length === 0) return { perm: adminError("At least one category id is required.", 400), ids };
  const allowed = await Promise.all(
    ids.map(async (id) => {
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
const sectionSchema = z.object({
  id: z.string().min(1, "Section id is required"),
  type: z.string().min(1, "Section type is required"),
  caption: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  alt_image: z.string().nullable().optional(),
  bg_color: z.string().nullable().optional(),
  bg_image: z.string().nullable().optional(),
  style_css: z.string().nullable().optional(),
  style_css_inline: z.string().nullable().optional(),
  style_id: z.string().nullable().optional(),
  alignment: z.string().nullable().optional(),
  limit: z.number().int().min(0).nullable().optional(),
  sort: z.number().int().min(0).optional(),
  sort_by: z.string().nullable().optional(),
  sort_order: z.enum(["asc", "desc"]).nullable().optional(),
  category: z.string().nullable().optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string()
  })).nullable().optional(),
  item: z.array(
    z.object({
      caption: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      text: z.string().nullable().optional(),
      image: z.string().nullable().optional(),
      alt_image: z.string().nullable().optional(),
      video: z.string().nullable().optional(),
      map: z.string().nullable().optional(),
      question: z.string().nullable().optional(),
      answer: z.string().nullable().optional(),
      icon: z.string().nullable().optional(),
      form_inquiry: z.boolean().nullable().optional(),
      embed: z.string().nullable().optional(),
      bg_color: z.string().nullable().optional(),
      bg_image: z.string().nullable().optional(),
      links: z.array(z.object({
        label: z.string(),
        url: z.string()
      })).nullable().optional(),
      style_css: z.string().nullable().optional(),
      style_css_inline: z.string().nullable().optional(),
      style_id: z.string().nullable().optional()
    })
  ).nullable().optional()
});
const tagSchema = z.string().min(1, "Tag must not be empty").max(50, "Tag must be at most 50 characters");
const createPostSchema = z.object({
  // Required
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  // Optional with validation
  slug: z.string().max(100, "Slug must be at most 100 characters").regex(slugRegex, "Slug must contain only lowercase alphanumeric characters and hyphens").optional(),
  type: z.string().default("post"),
  status: publishStatusEnum.default("draft"),
  publishedAt: z.number().int().positive().nullable().optional(),
  // Optional string fields with empty-to-null transform (Req 9.9)
  excerpt: emptyToNull,
  description: z.string().optional(),
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
  categoryIds: z.array(z.string().regex(ulidRegex, "Invalid category ID format")).optional(),
  // Custom field values: record of arbitrary values (Req 20.3)
  customFieldValues: z.record(z.string(), z.unknown()).optional()
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
  if (ids.length === 0) return adminError("At least one post id is required.", 400);
  const allowed = await Promise.all(
    ids.map(async (id) => {
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
  const result = updatePost(id, parsed.data, session2.user.id);
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
  if (ids.length === 0) return adminError("At least one post id is required.", 400);
  const allowed = await Promise.all(
    ids.map(async (id) => {
      const post = getPost(id);
      return post.success && await canPost(session2.user.id, post.data.type, "create") && await canEditPost(session2.user.id, id);
    })
  );
  if (!allowed.every(Boolean)) return adminError(INSUFFICIENT, 403);
  const result = bulkDuplicatePosts(ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be at most 128 characters"),
  roleId: z.string().regex(ulidRegex, "Invalid role ID format").optional()
});
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be at most 128 characters").optional(),
  roleId: z.string().regex(ulidRegex, "Invalid role ID format").nullable().optional()
});
const USER_CREATE_PERMS = ["users.create", "users.manage"];
const USER_EDIT_PERMS = ["users.edit", "users.manage"];
async function handleListUsers(filters) {
  const result = listUsersPaginated(filters ?? {});
  return result.success ? adminSuccess(result.data) : adminError(result.error.message, 500);
}
async function handleCreateUser(session2, body) {
  const perm = await requireAnyPermission(session2, USER_CREATE_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(createUserSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await createUser(parsed.data);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleGetUser(id) {
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
  const result = duplicateUser(id, session2.user.id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteUser(session2, id) {
  const perm = await requirePermission(session2, "users.manage");
  if (perm) return perm;
  const result = deleteUser(id, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
function handleBulkDeleteUsers(session2, ids) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  if (ids.length === 0) return adminError("At least one user id is required.", 400);
  const result = bulkDeleteUsers(ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
function handleBulkDuplicateUsers(session2, ids) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  if (ids.length === 0) return adminError("At least one user id is required.", 400);
  const result = bulkDuplicateUsers(ids, session2.user.id);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
function findRoleByIdRecord(id) {
  return db.select().from(roles).where(eq(roles.id, id)).get();
}
function findRoleBySlugRecord(slug) {
  return db.select().from(roles).where(eq(roles.slug, slug)).get();
}
function listRolesWithUserCountRecords(filters) {
  const conditions = [];
  if (filters?.search) {
    conditions.push(or(
      like(roles.name, `%${filters.search}%`),
      like(roles.slug, `%${filters.search}%`)
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
  const roleRows = conditions.length > 0 ? baseQuery.where(and(...conditions)).all() : baseQuery.all();
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
function createRole(data) {
  const slug = data.slug ?? generateRoleSlug(data.name);
  const existing = findRoleBySlugRecord(slug);
  if (existing) return serviceConflict("slug", "A role with this slug already exists.");
  const id = generateId();
  const now = getCurrentTimestamp$1();
  const created = createRoleRecord({
    id,
    name: data.name,
    slug,
    description: data.description ?? null,
    permissionIds: data.permissionIds,
    createdAt: now,
    updatedAt: now
  });
  return serviceSuccess(created, "Role created.");
}
function updateRole(id, data) {
  const existing = findRoleByIdRecord(id);
  if (!existing) return serviceNotFound("Role");
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be modified.");
  if (data.name !== void 0) {
    const newSlug = generateRoleSlug(data.name);
    const conflict = findRoleBySlugRecord(newSlug);
    if (conflict && conflict.id !== id) return serviceConflict("slug", "A role with this slug already exists.");
  }
  const now = getCurrentTimestamp$1();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) {
    updateData.name = data.name;
    updateData.slug = generateRoleSlug(data.name);
  }
  if (data.description !== void 0) updateData.description = data.description;
  if (data.permissionIds !== void 0) updateData.permissionIds = data.permissionIds;
  const updated = updateRoleRecord(id, updateData);
  if (!updated) return serviceNotFound("Role");
  return serviceSuccess(updated, "Role updated.");
}
function deleteRole(id) {
  const existing = findRoleByIdRecord(id);
  if (!existing) return serviceNotFound("Role");
  if (existing.isSystem === 1) return serviceForbidden("System roles cannot be deleted.");
  deleteRoleRecord(id);
  return serviceSuccess(null, "Role deleted.");
}
function duplicateRole(id) {
  const existing = findRoleByIdRecord(id);
  if (!existing) return serviceNotFound("Role");
  const newId = generateId();
  const now = getCurrentTimestamp$1();
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
function bulkDeleteRoles(ids) {
  const results = [];
  for (const id of ids) {
    const result = deleteRole(id);
    results.push({ id, success: result.success, error: !result.success ? result.error.message : void 0 });
  }
  return serviceSuccess(results, "Bulk delete completed.");
}
function bulkDuplicateRoles(ids) {
  const results = [];
  for (const id of ids) {
    const result = duplicateRole(id);
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
  permissionIds: z.array(z.string().regex(ulidRegex, "Invalid permission ID format")).min(1, "At least one permission is required")
});
const updateRoleSchema = z.object({
  // Optional: non-empty if provided, max 100 characters
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
  // Optional: empty → null transform (Req 9.9)
  description: emptyToNull,
  // Optional: array of ULID strings (permission IDs)
  permissionIds: z.array(z.string().regex(ulidRegex, "Invalid permission ID format")).optional()
});
z.object({
  // Required: valid ULID
  userId: z.string().regex(ulidRegex, "Invalid user ID format"),
  // Required: valid ULID
  roleId: z.string().regex(ulidRegex, "Invalid role ID format")
});
const ROLE_EDIT_PERMS = ["roles.edit", "roles.manage"];
function handleListRoles(filters) {
  const rolesResult = listRolesService(filters);
  return adminSuccess({
    roles: rolesResult.success ? rolesResult.data : [],
    permissions: listAllPermissionRecords()
  });
}
async function handleCreateRole(session2, body) {
  const perm = await requirePermission(session2, "roles.create");
  if (perm) return perm;
  const parsed = parseWithSchema(createRoleSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = createRole(parsed.data);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
function handleGetRole(id) {
  const result = getRole(id);
  if (!result.success) return adminError(result.error.message, 404);
  return adminSuccess({ role: result.data, permissions: listAllPermissionRecords() });
}
async function handleUpdateRole(session2, id, body) {
  const perm = await requireAnyPermission(session2, ROLE_EDIT_PERMS);
  if (perm) return perm;
  const parsed = parseWithSchema(updateRoleSchema, body);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = updateRole(id, parsed.data);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleDuplicateRole(session2, id) {
  const perm = await requirePermission(session2, "roles.create");
  if (perm) return perm;
  const result = duplicateRole(id);
  return result.success ? adminCreated(result.data, result.message) : mapServiceError(result);
}
async function handleDeleteRole(session2, id) {
  const perm = await requirePermission(session2, "roles.delete");
  if (perm) return perm;
  const result = deleteRole(id);
  return result.success ? adminSuccess(result.data, result.message) : mapServiceError(result);
}
async function handleBulkDeleteRoles(session2, ids) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  if (ids.length === 0) return adminError("At least one role id is required.", 400);
  const result = bulkDeleteRoles(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
async function handleBulkDuplicateRoles(session2, ids) {
  const unauth = requireAuth(session2);
  if (unauth) return unauth;
  if (ids.length === 0) return adminError("At least one role id is required.", 400);
  const result = bulkDuplicateRoles(ids);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().url().min(1, "URL is required"),
  icon: z.string().optional()
});
const openHoursSchema = z.object({
  day: z.string().min(1, "Day is required"),
  open: z.string().min(1, "Open time is required"),
  close: z.string().min(1, "Close time is required")
});
const updateSettingsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  maintenance_mode: z.boolean().optional(),
  timezone: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  links: z.array(socialLinkSchema).optional(),
  open_hours: z.array(openHoursSchema).optional(),
  custom_css: z.string().optional(),
  custom_javascript: z.string().optional(),
  translate_countries: z.array(z.string()).optional(),
  email_notifications: z.string().optional()
});
function handleGetSettings() {
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
  const now = getCurrentTimestamp$1();
  const updateData = { updatedAt: now };
  if (data.name !== void 0) updateData.name = data.name;
  if (data.email !== void 0) updateData.email = data.email;
  if (data.password !== void 0) updateData.passwordHash = await hashPassword(data.password);
  const updated = updateUserRecord(userId, updateData);
  if (!updated) return serviceNotFound("User");
  return serviceSuccess(updated, "Profile updated.");
}
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name must be between 1 and 100 characters.").max(100).optional(),
  email: z.string().email("Invalid email address.").optional(),
  password: z.string().min(8, "Password must be between 8 and 128 characters.").max(128).optional()
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
  url: z.string().min(1, "URL is required"),
  // Required: menu type (Req 7.1)
  type: menuTypeEnum,
  // Optional: non-negative integer, defaults to 0 (Req 7.1)
  position: z.number().int().min(0, "Position must be a non-negative integer").default(0),
  // Optional: parent menu item ID (ULID)
  parentId: z.string().regex(ulidRegex, "Parent ID must be a valid ULID").nullable().optional(),
  // Optional: empty → null (Req 9.9)
  cssClass: emptyToNull,
  // Optional: empty → null (Req 9.9)
  target: emptyToNull,
  image: emptyToNull,
  status: publishStatusEnum.default("published")
});
const updateMenuSchema = createMenuSchema.partial();
const menuTreeItemSchema = z.lazy(
  () => z.object({
    id: z.string().regex(ulidRegex, "Menu item ID must be a valid ULID"),
    parentId: z.string().regex(ulidRegex, "Parent ID must be a valid ULID").nullable(),
    position: z.number().int().min(0, "Position must be a non-negative integer"),
    children: z.array(menuTreeItemSchema)
  })
);
const reorderMenusSchema = z.object({
  type: menuTypeEnum,
  tree: z.array(menuTreeItemSchema)
});
const MENU_EDIT_PERMS = ["menus.edit", "menus.manage"];
function handleListMenus() {
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
function findMediaByIdRecord(id) {
  return db.select().from(media).where(eq(media.id, id)).get();
}
function listMediaRecords(filters) {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(100, Math.max(1, filters.perPage ?? 20));
  const conditions = [];
  if (filters.search) {
    conditions.push(like(media.name, `%${filters.search}%`));
  }
  if (filters.folder !== void 0) {
    conditions.push(filters.folder === null ? eq(media.folder, null) : eq(media.folder, filters.folder));
  }
  if (filters.mimeType && filters.mimeType !== "all") {
    conditions.push(
      filters.mimeType.endsWith("/*") ? like(media.mimeType, filters.mimeType.replace("*", "%")) : eq(media.mimeType, filters.mimeType)
    );
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
  let query = db.select().from(media);
  if (whereClause) query = query.where(whereClause);
  const totalQuery = db.select({ id: media.id }).from(media);
  const total = whereClause ? totalQuery.where(whereClause).all().length : totalQuery.all().length;
  const data = query.orderBy(desc(media.createdAt)).limit(perPage).offset((page - 1) * perPage).all();
  return {
    data,
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage: Math.max(1, Math.ceil(total / perPage)),
      from: total === 0 ? 0 : (page - 1) * perPage + 1,
      to: Math.min(page * perPage, total)
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
  if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)) {
    try {
      const metadata = await sharp(buffer, { failOn: "error" }).metadata();
      if (!metadata.format) return { valid: false, error: "The uploaded image is invalid." };
    } catch {
      return { valid: false, error: "The uploaded image is invalid." };
    }
  }
  if (mimeType === "application/pdf" && !buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    return { valid: false, error: "The uploaded PDF is invalid." };
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
function validateFileUpload(file) {
  return validateFile(file);
}
async function uploadMediaForUser(formData, userId, metadata) {
  const file = formData.get("file");
  if (!file || file.size === 0) {
    return { success: false, error: { code: "validation", message: "No file provided." } };
  }
  const fileCheck = validateFileUpload(file);
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
    file.type,
    file.name
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
  const now = getCurrentTimestamp$1();
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
  const now = getCurrentTimestamp$1();
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
async function processUploadedFile(buffer, mimeType, fileName, id) {
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
      const metadata = await sharp(buffer).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      const thumbRelativePath = generateThumbnailPath(fileId);
      const thumbAbsolutePath = path.resolve(uploadDir, thumbRelativePath);
      await sharp(buffer).resize(300, 300, { fit: "cover" }).webp({ quality: 80 }).toFile(thumbAbsolutePath);
      if (mimeType !== "image/gif") {
        await Promise.all(
          [640, 1280].filter((responsiveWidth) => width !== null && width > responsiveWidth).map((responsiveWidth) => sharp(buffer).resize({ width: responsiveWidth, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.resolve(uploadDir, relativePath.replace(/\.[^.]+$/, `_w${responsiveWidth}.webp`))))
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
  name: z.string().optional(),
  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull,
  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull,
  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull
});
const updateMediaSchema = z.object({
  // Optional name, but must be non-empty if provided
  name: z.string().min(1, "Name must not be empty").optional(),
  // Optional alt text: empty → null (Req 9.9)
  alt: emptyToNull,
  // Optional caption: empty → null (Req 9.9)
  caption: emptyToNull,
  // Optional virtual folder: empty → null (Req 9.9)
  folder: emptyToNull
});
async function deleteFileIfExists(fileUrl) {
  if (!fileUrl) return;
  try {
    const filePath = path.join(getUploadDir(), fileUrl.replace(/^\//, ""));
    await unlink(filePath);
  } catch {
  }
}
function handleListMedia(filters) {
  const result = listMediaService(filters);
  return result.success ? adminSuccess(result.data, result.message) : adminError(result.error.message, 500);
}
function handleGetMedia(id) {
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
  if (ids.length === 0) return adminError("At least one media id is required.", 400);
  const results = [];
  for (const id of ids) {
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
  const metadata = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "file") metadata[key] = value;
  }
  const parsed = parseWithSchema(uploadMediaSchema, metadata);
  if (!parsed.success) return adminError(parsed.message, 422, parsed.fieldErrors);
  const result = await uploadMediaForUser(formData, session2.user.id, parsed.data);
  return result.success ? adminSuccess(result.data, "Media uploaded.") : mapServiceError(result);
}
const POST$r = async ({ request, cookies }) => {
  const body = await request.json();
  const result = await handlePasswordLogin(body);
  if (!result.success || !result.user) {
    return Response.json({ success: false, message: result.message }, { status: result.status });
  }
  const permissions2 = await getUserPermissions(result.user.id);
  const sessionId = crypto.randomUUID();
  const accessToken = await signAccessToken({
    sub: result.user.id,
    email: result.user.email,
    roleId: result.user.roleId,
    permissions: permissions2
  });
  const refreshToken = await signRefreshToken({
    sub: result.user.id,
    sessionId
  });
  saveRefreshSession(sessionId, result.user.id, Date.now() + 30 * 24 * 60 * 60 * 1e3);
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
  POST: POST$r
}, Symbol.toStringTag, { value: "Module" }));
const POST$q = async ({ cookies }) => {
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
  POST: POST$q
}, Symbol.toStringTag, { value: "Module" }));
const PUT$7 = async ({ request, locals }) => {
  const body = await request.json();
  return handleUpdateProfile(locals.session, body);
};
const profile = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PUT: PUT$7
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
const POST$o = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "Category id is required." }), { status: 400 });
  }
  return handleDuplicateCategory(locals.session, params.id);
};
const duplicate$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$o
}, Symbol.toStringTag, { value: "Module" }));
const POST$n = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDeleteCategories(locals.session, ids);
};
const _delete$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$n
}, Symbol.toStringTag, { value: "Module" }));
const POST$m = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDuplicateCategories(locals.session, ids);
};
const duplicate$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$m
}, Symbol.toStringTag, { value: "Module" }));
const POST$l = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  const status2 = body?.status === "published" || body?.status === "draft" ? body.status : null;
  if (!status2) return Response.json({ success: false, message: "Invalid category status." }, { status: 422 });
  return handleBulkUpdateCategoryStatus(locals.session, ids, status2);
};
const status = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$l
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
const POST$k = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateCategory(locals.session, body);
};
const index$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$e,
  POST: POST$k
}, Symbol.toStringTag, { value: "Module" }));
const GET$d = async () => {
  const stats = getDashboardStatsRecord();
  return adminSuccess(stats);
};
const dashboard = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$d
}, Symbol.toStringTag, { value: "Module" }));
const GET$c = async ({ params }) => {
  return handleGetMedia(params.id);
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
const POST$j = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return handleBulkDeleteMedia(locals.session, ids);
};
const _delete$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$j
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$3 = /* @__PURE__ */ new Set(["name", "createdAt", "size"]);
const VALID_SORT_ORDER$3 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$b = async ({ request }) => {
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
  return handleListMedia(filters);
};
const POST$i = async ({ request, locals }) => {
  const formData = await request.formData();
  return handleUploadMedia(locals.session, formData);
};
const index$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$b,
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
const GET$9 = async () => {
  return handleListMenus();
};
const POST$g = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateMenu(locals.session, body);
};
const index$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$9,
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
const POST$e = async ({ params, locals }) => {
  return await handleDuplicatePost(locals.session, params.id);
};
const duplicate$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$e
}, Symbol.toStringTag, { value: "Module" }));
const POST$d = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDeletePosts(locals.session, ids);
};
const _delete$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$d
}, Symbol.toStringTag, { value: "Module" }));
const POST$c = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDuplicatePosts(locals.session, ids);
};
const duplicate$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$c
}, Symbol.toStringTag, { value: "Module" }));
const POST$b = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkPublishPosts(locals.session, ids);
};
const publish = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$b
}, Symbol.toStringTag, { value: "Module" }));
const POST$a = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkUnpublishPosts(locals.session, ids);
};
const unpublish = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$a
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
const POST$9 = async ({ request, locals }) => {
  const body = await request.json();
  return await handleCreatePost(locals.session, body);
};
const index$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$7,
  POST: POST$9
}, Symbol.toStringTag, { value: "Module" }));
const GET$6 = async ({ params }) => {
  if (!params.id) return adminError("Role id is required.", 400);
  return handleGetRole(params.id);
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
const POST$8 = async ({ params, locals }) => {
  if (!params.id) {
    return new Response(JSON.stringify({ success: false, message: "Role id is required." }), { status: 400 });
  }
  return handleDuplicateRole(locals.session, params.id);
};
const duplicate$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$8
}, Symbol.toStringTag, { value: "Module" }));
const POST$7 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDeleteRoles(locals.session, ids);
};
const _delete$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$7
}, Symbol.toStringTag, { value: "Module" }));
const POST$6 = async ({ request, locals }) => {
  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => typeof id === "string") : [];
  return await handleBulkDuplicateRoles(locals.session, ids);
};
const duplicate$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST: POST$6
}, Symbol.toStringTag, { value: "Module" }));
const VALID_SORT_BY$1 = /* @__PURE__ */ new Set(["name", "createdAt"]);
const VALID_SORT_ORDER$1 = /* @__PURE__ */ new Set(["asc", "desc"]);
const GET$5 = async ({ request }) => {
  const url = new URL(request.url);
  const search2 = url.searchParams.get("search") || void 0;
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const sortByValid = sortBy && VALID_SORT_BY$1.has(sortBy) ? sortBy : void 0;
  const sortOrderValid = sortOrder && VALID_SORT_ORDER$1.has(sortOrder) ? sortOrder : void 0;
  return handleListRoles({ search: search2, sortBy: sortByValid, sortOrder: sortOrderValid });
};
const POST$5 = async ({ request, locals }) => {
  const body = await request.json();
  return handleCreateRole(locals.session, body);
};
const index$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET: GET$5,
  POST: POST$5
}, Symbol.toStringTag, { value: "Module" }));
const GET$4 = async () => {
  return handleGetSettings();
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
const GET$3 = async ({ params }) => {
  if (!params.id) return adminError("User id is required.", 400);
  return handleGetUser(params.id);
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
const GET$2 = async ({ request }) => {
  const url = new URL(request.url);
  const search2 = url.searchParams.get("search") || void 0;
  const roleId = url.searchParams.get("roleId") || void 0;
  const sortBy = url.searchParams.get("sortBy");
  const sortOrder = url.searchParams.get("sortOrder");
  const sortByValid = sortBy && VALID_SORT_BY.has(sortBy) ? sortBy : void 0;
  const sortOrderValid = sortOrder && VALID_SORT_ORDER.has(sortOrder) ? sortOrder : void 0;
  return handleListUsers({ search: search2, roleId, sortBy: sortByValid, sortOrder: sortOrderValid });
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
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5e3),
  turnstileToken: z.string().trim().min(1).max(2048).optional()
});
function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}
async function verifyTurnstile(token, request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.CONTACT_TURNSTILE_REQUIRED === "true" ? "Turnstile is not configured." : null;
  if (!token) return "Turnstile verification is required.";
  try {
    const body = new URLSearchParams({ secret, response: token });
    const remoteIp = clientAddress(request);
    if (remoteIp !== "unknown") body.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
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
  const turnstileError = await verifyTurnstile(parsed.data.turnstileToken, request);
  if (turnstileError) {
    return Response.json({ success: false, message: turnstileError }, { status: process.env.CONTACT_TURNSTILE_REQUIRED === "true" && !process.env.TURNSTILE_SECRET_KEY ? 503 : 403 });
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
  zadm as default,
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
  passwordResetTokens,
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
  searchPublishedPosts,
  seed,
  settings$1 as settings,
  users,
  usersRelations
};
