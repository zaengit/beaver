import { db } from "./index";
import { permissions, roles, rolePermissions, users } from "./schema";
import { ulid } from "ulidx";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
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
    { slug: `category.${type}.unpublish`, name: `Unpublish ${type} categories`, group: type },
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
  { slug: "settings.manage", name: "Manage system settings", group: "settings" },
] as const;

const DEFAULT_ROLES = [
  {
    name: "Super Admin",
    slug: "super-admin",
    description: "Full system access. Cannot be deleted or modified.",
    isSystem: 1,
  },
  {
    name: "Editor",
    slug: "editor",
    description: "Can manage all content, media, categories, and menus.",
    isSystem: 0,
  },
  {
    name: "Author",
    slug: "author",
    description: "Can create and edit own posts, view and upload media.",
    isSystem: 0,
  },
  {
    name: "Viewer",
    slug: "viewer",
    description: "Read-only access to posts, media, and categories.",
    isSystem: 0,
  },
] as const;

// Permission slugs assigned to each role
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
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
    "menus.unpublish",
  ],
  author: [
    "content.post.view",
    "content.post.create",
    "content.post.edit-own",
    "media.view",
    "media.upload",
  ],
  viewer: [
    "content.post.view",
    "media.view",
    "category.post.view",
  ],
};

export async function seed() {
  console.log("🌱 Seeding database...");

  const now = getCurrentTimestamp();

  // Use a transaction for atomicity
  db.transaction((tx) => {
    // ─── Seed Permissions ──────────────────────────────────────────────────────
    console.log("  → Inserting permissions...");

    const permissionRecords: Array<{ id: string; slug: string }> = [];

    for (const perm of DEFAULT_PERMISSIONS) {
      const id = ulid();
      tx.insert(permissions)
        .values({
          id,
          name: perm.name,
          slug: perm.slug,
          group: perm.group,
          description: perm.name,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: permissions.slug })
        .run();

      permissionRecords.push({ id, slug: perm.slug });
    }

    // Fetch actual permission IDs (in case some already existed)
    const existingPermissions = tx
      .select({ id: permissions.id, slug: permissions.slug })
      .from(permissions)
      .all();

    const permissionSlugToId = new Map(
      existingPermissions.map((p) => [p.slug, p.id])
    );

    console.log(`  ✓ ${existingPermissions.length} permissions ready`);

    // ─── Seed Roles ────────────────────────────────────────────────────────────
    console.log("  → Inserting roles...");

    for (const role of DEFAULT_ROLES) {
      tx.insert(roles)
        .values({
          id: ulid(),
          name: role.name,
          slug: role.slug,
          description: role.description,
          isSystem: role.isSystem,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: roles.slug })
        .run();
    }

    // Fetch actual role IDs
    const existingRoles = tx
      .select({ id: roles.id, slug: roles.slug })
      .from(roles)
      .all();

    const roleSlugToId = new Map(
      existingRoles.map((r) => [r.slug, r.id])
    );

    console.log(`  ✓ ${existingRoles.length} roles ready`);

    // ─── Seed Role Permissions ─────────────────────────────────────────────────
    console.log("  → Assigning permissions to roles...");

    // Clear existing role_permissions for default roles to ensure correct state
    for (const role of DEFAULT_ROLES) {
      const roleId = roleSlugToId.get(role.slug);
      if (roleId) {
        tx.delete(rolePermissions)
          .where(sql`${rolePermissions.roleId} = ${roleId}`)
          .run();
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

        tx.insert(rolePermissions)
          .values({
            id: ulid(),
            roleId,
            permissionId,
            createdAt: now,
          })
          .run();

        assignmentCount++;
      }
    }

    console.log(`  ✓ ${assignmentCount} role-permission assignments created`);

    // ─── Seed Super Admin User ───────────────────────────────────────────────────
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
      tx.insert(users)
        .values({
          id: ulid(),
          name: resolvedAdminName,
          email: resolvedAdminEmail,
          password: hashedPassword,
          roleId: superAdminRoleId,
          emailVerified: 1,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: users.email })
        .run();

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
