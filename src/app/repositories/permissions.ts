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

export async function syncPermissionRecords(definitions: PermissionDefinition[]): Promise<SyncPermissionsResult> {
  const now = getCurrentTimestamp()

  return await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: permissions.id, slug: permissions.slug })
      .from(permissions)
      .execute()
    const existingBySlug = new Map<string, { id: string; slug: string }>(existing.map((permission: { id: string; slug: string }) => [permission.slug, permission]))
    const desiredSlugs = new Set(definitions.map((permission) => permission.slug))
    const obsolete = (existing as Array<{ id: string; slug: string }>).filter((permission) => (
      isContentPermissionSlug(permission.slug) && !desiredSlugs.has(permission.slug)
    ))

    for (const permission of obsolete) {
      await tx.delete(rolePermissions).where(eq(rolePermissions.permissionId, permission.id)).execute()
      await tx.delete(permissions).where(eq(permissions.id, permission.id)).execute()
    }

    let added = 0
    let updated = 0
    for (const definition of definitions) {
      const current = existingBySlug.get(definition.slug)
      if (current) {
        await tx.update(permissions)
          .set({
            name: definition.name,
            group: definition.group,
            description: definition.name,
            updatedAt: now,
          })
          .where(eq(permissions.id, current.id))
          .execute()
        updated++
        continue
      }

      await tx.insert(permissions).values({
        id: generateId(),
        name: definition.name,
        slug: definition.slug,
        group: definition.group,
        description: definition.name,
        createdAt: now,
        updatedAt: now,
      }).execute()
      added++
    }

    return { added, updated, removed: obsolete.length, total: definitions.length }
  })
}
