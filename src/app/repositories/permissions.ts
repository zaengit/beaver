import { eq } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { permissions, rolePermissions } from "@zbeaver/beaver/app/db/schema"
import type { PermissionDefinition } from "@zbeaver/beaver/app/admin/permission-catalog"
import { isContentPermissionSlug } from "@zbeaver/beaver/app/admin/permission-catalog"
import { generateId, getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"

export interface SyncPermissionsResult {
  added: number
  updated: number
  removed: number
  total: number
}

export function syncPermissionRecords(definitions: PermissionDefinition[]): SyncPermissionsResult {
  const now = getCurrentTimestamp()

  return db.transaction((tx) => {
    const existing = tx
      .select({ id: permissions.id, slug: permissions.slug })
      .from(permissions)
      .all()
    const existingBySlug = new Map(existing.map((permission) => [permission.slug, permission]))
    const desiredSlugs = new Set(definitions.map((permission) => permission.slug))
    const obsolete = existing.filter((permission) => (
      isContentPermissionSlug(permission.slug) && !desiredSlugs.has(permission.slug)
    ))

    for (const permission of obsolete) {
      tx.delete(rolePermissions).where(eq(rolePermissions.permissionId, permission.id)).run()
      tx.delete(permissions).where(eq(permissions.id, permission.id)).run()
    }

    let added = 0
    let updated = 0
    for (const definition of definitions) {
      const current = existingBySlug.get(definition.slug)
      if (current) {
        tx.update(permissions)
          .set({
            name: definition.name,
            group: definition.group,
            description: definition.name,
            updatedAt: now,
          })
          .where(eq(permissions.id, current.id))
          .run()
        updated++
        continue
      }

      tx.insert(permissions).values({
        id: generateId(),
        name: definition.name,
        slug: definition.slug,
        group: definition.group,
        description: definition.name,
        createdAt: now,
        updatedAt: now,
      }).run()
      added++
    }

    return { added, updated, removed: obsolete.length, total: definitions.length }
  })
}
