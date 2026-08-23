import { and, asc, count, desc, eq, inArray, like, or, type SQL } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { permissions as permissionsTable, rolePermissions, roles, users } from "@zbeaver/beaver/app/db/schema"
import type { RoleRecord } from "@zbeaver/beaver/app/models/role"
import { sanitizeText } from "@zbeaver/beaver/pkg/security/sanitize"
import { generateId } from "@zbeaver/beaver/pkg/utils/index"
import { affectedRows } from "@zbeaver/beaver/app/db/query"

export type RoleRow = RoleRecord
type PermissionRow = typeof permissionsTable.$inferSelect
const MAX_ROLE_ROWS = 1_000

export async function findRoleByIdRecord(id: string) {
  const rows = await db.select().from(roles).where(eq(roles.id, id)).limit(1).execute()
  return rows[0] as RoleRow | undefined
}

export async function findRoleBySlugRecord(slug: string) {
  const rows = await db.select().from(roles).where(eq(roles.slug, slug)).limit(1).execute()
  return rows[0] as RoleRow | undefined
}

export async function listRolesWithUserCountRecords(filters?: { search?: string; sortBy?: string; sortOrder?: string }) {
  const conditions: SQL<unknown>[] = []
  const search = filters?.search?.slice(0, 100)
  if (search) {
    conditions.push(or(
      like(roles.name, `%${search}%`),
      like(roles.slug, `%${search}%`),
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
    ? await baseQuery.where(and(...conditions)).limit(MAX_ROLE_ROWS).execute() as RoleRow[]
    : await baseQuery.limit(MAX_ROLE_ROWS).execute() as RoleRow[]

  return await Promise.all(roleRows.map(async (role) => {
    const countRows = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.roleId, role.id))
      .limit(1)
      .execute() as { value: number }[]
    return { ...role, userCount: countRows[0]?.value ?? 0 }
  }))
}

export async function getRoleNameRecord(roleId: string) {
  const rows = await db.select({ name: roles.name }).from(roles).where(eq(roles.id, roleId)).limit(1).execute() as { name: string }[]
  return rows[0]?.name ?? null
}

export async function listAllPermissionRecords() {
  return await db.select().from(permissionsTable).execute() as PermissionRow[]
}

export async function createRoleRecord(input: {
  id: string
  name: string
  slug: string
  description: string | null
  permissionIds: string[]
  createdAt: number
  updatedAt: number
}) {
  await db.insert(roles).values({
    id: input.id,
    name: sanitizeText(input.name),
    slug: input.slug.toLowerCase(),
    description: input.description ? sanitizeText(input.description) : null,
    isSystem: 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }).execute()

  for (const permissionId of input.permissionIds) {
    await db.insert(rolePermissions).values({
      id: generateId(),
      roleId: input.id,
      permissionId,
      createdAt: input.createdAt,
    }).execute()
  }

  return (await findRoleByIdRecord(input.id))!
}

export async function updateRoleRecord(id: string, input: {
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

  await db.update(roles).set(updates).where(eq(roles.id, id)).execute()

  if (input.permissionIds !== undefined) {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).execute()
    for (const permissionId of input.permissionIds) {
      await db.insert(rolePermissions).values({
        id: generateId(),
        roleId: id,
        permissionId,
        createdAt: input.updatedAt,
      }).execute()
    }
  }

  return await findRoleByIdRecord(id) ?? null
}

export async function deleteRoleRecord(id: string) {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).execute()
  const result = await db.delete(roles).where(eq(roles.id, id)).execute()
  return affectedRows(result) > 0
}

export async function getRolePermissionIdsRecord(roleId: string) {
  const rows = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId))
      .execute() as { permissionId: string }[]
  return rows.map((row) => row.permissionId)
}

export async function getRolePermissionSlugsRecord(roleId: string) {
  const rows = await db
    .select({ slug: permissionsTable.slug })
    .from(rolePermissions)
    .innerJoin(permissionsTable, eq(rolePermissions.permissionId, permissionsTable.id))
    .where(eq(rolePermissions.roleId, roleId))
    .execute()
  return rows.map((row: { slug: string }) => row.slug)
}

export async function getPermissionSlugsRecord(permissionIds: string[]) {
  if (permissionIds.length === 0) return []
  return await db
    .select({ id: permissionsTable.id, slug: permissionsTable.slug })
    .from(permissionsTable)
    .where(inArray(permissionsTable.id, [...new Set(permissionIds)]))
    .execute()
}
