import { and, asc, count, desc, eq, like, or, type SQL } from "drizzle-orm"

import { db } from "zadm/app/db"
import { permissions as permissionsTable, rolePermissions, roles, users } from "zadm/app/db/schema"
import type { RoleRecord } from "zadm/app/models/role"
import { sanitizeText } from "zadm/pkg/security/sanitize"
import { generateId } from "zadm/pkg/utils/index"

export type RoleRow = RoleRecord
export type PermissionRow = typeof permissionsTable.$inferSelect

export function findRoleByIdRecord(id: string) {
  return db.select().from(roles).where(eq(roles.id, id)).get() as RoleRow | undefined
}

export function findRoleBySlugRecord(slug: string) {
  return db.select().from(roles).where(eq(roles.slug, slug)).get() as RoleRow | undefined
}

export function listRoleRecords() {
  return db.select().from(roles).all() as RoleRow[]
}

export function listRolesWithUserCountRecords(filters?: { search?: string; sortBy?: string; sortOrder?: string }) {
  const conditions: SQL<unknown>[] = []
  if (filters?.search) {
    conditions.push(or(
      like(roles.name, `%${filters.search}%`),
      like(roles.slug, `%${filters.search}%`),
    ) as SQL<unknown>)
  }

  // Build sort
  let orderColumn = asc(roles.name)
  if (filters?.sortBy) {
    const column =
      filters.sortBy === "name" ? roles.name :
      filters.sortBy === "createdAt" ? roles.createdAt :
      null
    if (column) {
      orderColumn = filters.sortOrder === "asc" ? asc(column) : desc(column)
    }
  }

  const baseQuery = db.select().from(roles).orderBy(orderColumn)
  const roleRows = conditions.length > 0
    ? (baseQuery.where(and(...conditions)).all() as RoleRow[])
    : (baseQuery.all() as RoleRow[])

  return roleRows.map((role) => {
    const countResult = db
      .select({ value: count() })
      .from(users)
      .where(eq(users.roleId, role.id))
      .get() as { value: number } | undefined
    return { ...role, userCount: countResult?.value ?? 0 }
  })
}

export function getRoleNameRecord(roleId: string) {
  const row = db.select({ name: roles.name }).from(roles).where(eq(roles.id, roleId)).get() as { name: string } | undefined
  return row?.name ?? null
}

export function listAllPermissionRecords() {
  return db.select().from(permissionsTable).all() as PermissionRow[]
}

export function listPermissionGroupsRecord() {
  const grouped: Record<string, PermissionRow[]> = {}
  for (const permission of listAllPermissionRecords()) {
    const group = permission.group ?? "general"
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(permission)
  }
  return grouped
}

export function createRoleRecord(input: {
  id: string
  name: string
  slug: string
  description: string | null
  permissionIds: string[]
  createdAt: number
  updatedAt: number
}) {
  db.insert(roles).values({
    id: input.id,
    name: sanitizeText(input.name),
    slug: input.slug.toLowerCase(),
    description: input.description ? sanitizeText(input.description) : null,
    isSystem: 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }).run()

  for (const permissionId of input.permissionIds) {
    db.insert(rolePermissions).values({
      id: generateId(),
      roleId: input.id,
      permissionId,
      createdAt: input.createdAt,
    }).run()
  }

  return findRoleByIdRecord(input.id)!
}

export function updateRoleRecord(id: string, input: {
  name?: string
  slug?: string
  description?: string | null
  permissionIds?: string[]
  updatedAt: number
}) {
  const updates: Record<string, unknown> = { updatedAt: input.updatedAt }
  if (input.name !== undefined) updates.name = sanitizeText(input.name)
  if (input.slug !== undefined) updates.slug = input.slug.toLowerCase()
  if (input.description !== undefined) updates.description = input.description ? sanitizeText(input.description) : null

  db.update(roles).set(updates).where(eq(roles.id, id)).run()

  if (input.permissionIds !== undefined) {
    db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).run()
    for (const permissionId of input.permissionIds) {
      db.insert(rolePermissions).values({
        id: generateId(),
        roleId: id,
        permissionId,
        createdAt: input.updatedAt,
      }).run()
    }
  }

  return findRoleByIdRecord(id) ?? null
}

export function deleteRoleRecord(id: string) {
  db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).run()
  return db.delete(roles).where(eq(roles.id, id)).run().changes > 0
}

export function getRolePermissionIdsRecord(roleId: string) {
  return (
    db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))
      .all() as { permissionId: string }[]
  ).map((row) => row.permissionId)
}
