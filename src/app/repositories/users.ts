import { and, asc, count, desc, eq, like, or } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { roles, users } from "@zbeaver/beaver/app/db/schema"
import { sanitizeText } from "@zbeaver/beaver/pkg/security/sanitize"
import type { UserRecord } from "@zbeaver/beaver/app/models/user"
import { clampPagination } from "@zbeaver/beaver/pkg/utils/pagination"
import { affectedRows } from "@zbeaver/beaver/app/db/query"

export type UserSafe = Omit<UserRecord, "password">
export type UserListItem = UserSafe & { roleName: string | null }
const MAX_FILTER_TEXT_LENGTH = 100

function toSafe(user: UserRecord): UserSafe {
  const safe = { ...user }
  Reflect.deleteProperty(safe, "password")
  return safe as UserSafe
}

export async function findUserByIdRecord(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1).execute()
  return rows[0] as UserRecord | undefined
}

export async function findUserByEmailRecord(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1)
    .execute()
  return rows[0] as UserRecord | undefined
}

export async function listUsersPaginatedRecord(filters: {
  page?: number
  perPage?: number
  search?: string
  roleId?: string
  sortBy?: string
  sortOrder?: string
}) {
  const { page, perPage, offset } = clampPagination(filters)

  const conditions: ReturnType<typeof eq>[] = []
  const search = filters.search?.slice(0, MAX_FILTER_TEXT_LENGTH)
  const roleId = filters.roleId?.slice(0, 128)
  if (search) {
    conditions.push(
      or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)) as ReturnType<typeof eq>,
    )
  }
  if (roleId) {
    conditions.push(eq(users.roleId, roleId))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Count total
  const totalQuery = db.select({ value: count() }).from(users)
  const totalRows = whereClause
    ? await (totalQuery.where(whereClause) as typeof totalQuery).execute()
    : await totalQuery.execute()
  const total = totalRows[0]?.value ?? 0
  const lastPage = Math.max(1, Math.ceil(total / perPage))

  // Build sort
  let orderColumn = desc(users.updatedAt)
  if (filters.sortBy) {
    const column =
      filters.sortBy === "name" ? users.name :
      filters.sortBy === "email" ? users.email :
      filters.sortBy === "createdAt" ? users.createdAt :
      filters.sortBy === "updatedAt" ? users.updatedAt :
      null
    if (column) {
      orderColumn = filters.sortOrder === "asc" ? asc(column) : desc(column)
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
    roleName: roles.name,
  }).from(users).leftJoin(roles, eq(users.roleId, roles.id))
  const paged = await (whereClause ? dataQuery.where(whereClause) : dataQuery)
    .orderBy(orderColumn)
    .limit(perPage)
    .offset(offset)
    .execute() as UserListItem[]

  return {
    data: paged,
    meta: {
      currentPage: page,
      perPage,
      total,
      lastPage,
      from: total > 0 ? offset + 1 : 0,
      to: Math.min(offset + perPage, total),
    },
  }
}

export async function createUserRecord(input: {
  id: string
  name: string
  email: string
  passwordHash: string
  roleId: string | null
  createdAt: number
  updatedAt: number
}) {
  await db.insert(users).values({
    id: input.id,
    name: sanitizeText(input.name),
    email: input.email.toLowerCase().trim(),
    password: input.passwordHash,
    roleId: input.roleId,
    emailVerified: 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }).execute()

  return (await findSafeUserByIdRecord(input.id))!
}

export async function updateUserRecord(id: string, input: {
  name?: string
  email?: string
  passwordHash?: string
  roleId?: string | null
  updatedAt: number
}) {
  const updates: Record<string, unknown> = { updatedAt: input.updatedAt }
  if (input.name !== undefined) updates.name = sanitizeText(input.name)
  if (input.email !== undefined) updates.email = input.email.toLowerCase().trim()
  if (input.passwordHash !== undefined) updates.password = input.passwordHash
  if (input.roleId !== undefined) updates.roleId = input.roleId

  await db.update(users).set(updates).where(eq(users.id, id)).execute()
  return await findSafeUserByIdRecord(id) ?? null
}

export async function deleteUserRecord(id: string) {
  const result = await db.delete(users).where(eq(users.id, id)).execute()
  return affectedRows(result) > 0
}

export async function findSafeUserByIdRecord(id: string) {
  const user = await findUserByIdRecord(id)
  return user ? toSafe(user) : null
}
