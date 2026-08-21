import { and, asc, count, desc, eq, like, or } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { roles, users } from "@zbeaver/beaver/app/db/schema"
import { sanitizeText } from "@zbeaver/beaver/pkg/security/sanitize"
import type { UserRecord } from "@zbeaver/beaver/app/models/user"
import { clampPagination } from "@zbeaver/beaver/pkg/utils/pagination"

export type UserSafe = Omit<UserRecord, "password">
export type UserListItem = UserSafe & { roleName: string | null }
const MAX_FILTER_TEXT_LENGTH = 100

function toSafe(user: UserRecord): UserSafe {
  const safe = { ...user }
  Reflect.deleteProperty(safe, "password")
  return safe as UserSafe
}

export function findUserByIdRecord(id: string) {
  return db.select().from(users).where(eq(users.id, id)).get() as UserRecord | undefined
}

export function findUserByEmailRecord(email: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .get() as UserRecord | undefined
}

export function listUsersPaginatedRecord(filters: {
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
    ? (totalQuery.where(whereClause) as typeof totalQuery).all()
    : totalQuery.all()
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
  const paged = (whereClause ? dataQuery.where(whereClause) : dataQuery)
    .orderBy(orderColumn)
    .limit(perPage)
    .offset(offset)
    .all() as UserListItem[]

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

export function createUserRecord(input: {
  id: string
  name: string
  email: string
  passwordHash: string
  roleId: string | null
  createdAt: number
  updatedAt: number
}) {
  db.insert(users).values({
    id: input.id,
    name: sanitizeText(input.name),
    email: input.email.toLowerCase().trim(),
    password: input.passwordHash,
    roleId: input.roleId,
    emailVerified: 0,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  }).run()

  return findSafeUserByIdRecord(input.id)!
}

export function updateUserRecord(id: string, input: {
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

  db.update(users).set(updates).where(eq(users.id, id)).run()
  return findSafeUserByIdRecord(id) ?? null
}

export function deleteUserRecord(id: string) {
  return db.delete(users).where(eq(users.id, id)).run().changes > 0
}

export function findSafeUserByIdRecord(id: string) {
  const user = findUserByIdRecord(id)
  return user ? toSafe(user) : null
}
