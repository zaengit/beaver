import bcrypt from "bcrypt"
import { and, eq } from "drizzle-orm"

import { db } from "@zbeaver/beaver/app/db"
import { adminRefreshSessions, roles, users } from "@zbeaver/beaver/app/db/schema"
import { getCurrentTimestamp } from "@zbeaver/beaver/pkg/utils/index"
import { assertSecureSeedEnvironment } from "@zbeaver/beaver/app/config/security"

export async function resetSuperAdminPassword() {
  assertSecureSeedEnvironment()
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password || password.length < 12 || password.length > 128) {
    throw new Error("ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters are required.")
  }

  const superAdminRows = await db.select({ id: roles.id })
    .from(roles)
    .where(eq(roles.slug, "super-admin"))
    .limit(1)
    .execute()
  const superAdmin = superAdminRows[0]
  if (!superAdmin) throw new Error("The super-admin role does not exist. Run beaver seed first.")

  const userRows = await db.select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), eq(users.roleId, superAdmin.id)))
    .limit(1)
    .execute()
  const user = userRows[0]
  if (!user) throw new Error(`No super-admin user found for ${email}.`)

  const passwordHash = bcrypt.hashSync(password, 12)
  const now = getCurrentTimestamp()
  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ password: passwordHash, updatedAt: now })
      .where(eq(users.id, user.id))
      .execute()
    await tx.delete(adminRefreshSessions)
      .where(eq(adminRefreshSessions.userId, user.id))
      .execute()
  })

  return { email }
}
