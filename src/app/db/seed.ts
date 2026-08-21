import { db } from "./index";
import { permissions, roles, rolePermissions, users } from "./schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateId, getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index";
import { getSeedAdminCredentials } from "@zbeaver/beaver/app/config/security";
import { getPermissionDefinitions, isContentPermissionSlug, type PermissionDefinition } from "@zbeaver/beaver/app/admin/permission-catalog";
import { syncPermissionRecords } from "@zbeaver/beaver/app/repositories/permissions";

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
function getRolePermissionMap(definitions: PermissionDefinition[]): Record<string, string[]> {
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
  }
}

export async function seed() {
  console.log("🌱 Seeding database...");

  const permissionDefinitions = getPermissionDefinitions();
  const rolePermissionMap = getRolePermissionMap(permissionDefinitions);
  const now = getCurrentTimestamp();

  console.log("  → Inserting permissions...");
  const permissionSync = syncPermissionRecords(permissionDefinitions);
  console.log(`  ✓ ${permissionSync.total} permissions ready`);

  db.transaction((tx) => {
    // Fetch actual permission IDs (in case some already existed)
    const existingPermissions = tx
      .select({ id: permissions.id, slug: permissions.slug })
      .from(permissions)
      .all();

    const permissionSlugToId = new Map(
      existingPermissions.map((p) => [p.slug, p.id])
    );

    // ─── Seed Roles ────────────────────────────────────────────────────────────
    console.log("  → Inserting roles...");

    for (const role of DEFAULT_ROLES) {
      tx.insert(roles)
        .values({
          id: generateId(),
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

        tx.insert(rolePermissions)
          .values({
            id: generateId(),
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

    const admin = getSeedAdminCredentials();
    const resolvedAdminEmail = admin.email;
    const resolvedAdminPassword = admin.password;
    const resolvedAdminName = admin.name;

    const hashedPassword = bcrypt.hashSync(resolvedAdminPassword, 12);

    const superAdminRoleId = roleSlugToId.get("super-admin");
    if (!superAdminRoleId) {
      console.warn("  ⚠ Super Admin role not found, skipping user creation");
    } else {
      tx.insert(users)
        .values({
          id: generateId(),
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
