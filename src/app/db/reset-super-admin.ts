import bcrypt from "bcrypt"
import { and, eq } from "drizzle-orm"

import { db } from "@zaenpm/beaver/app/db"
import { adminRefreshSessions, roles, users } from "@zaenpm/beaver/app/db/schema"
import { getCurrentTimestamp } from "@zaenpm/beaver/pkg/utils/index"

export function resetSuperAdminPassword() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password || password.length < 12) {
    throw new Error("ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters are required.")
  }

  const superAdmin = db.select({ id: roles.id })
    .from(roles)
    .where(eq(roles.slug, "super-admin"))
    .get()
  if (!superAdmin) throw new Error("The super-admin role does not exist. Run beaver seed first.")

  const user = db.select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), eq(users.roleId, superAdmin.id)))
    .get()
  if (!user) throw new Error(`No super-admin user found for ${email}.`)

  const passwordHash = bcrypt.hashSync(password, 12)
  const now = getCurrentTimestamp()
  db.transaction((tx) => {
    tx.update(users)
      .set({ password: passwordHash, updatedAt: now })
      .where(eq(users.id, user.id))
      .run()
    tx.delete(adminRefreshSessions)
      .where(eq(adminRefreshSessions.userId, user.id))
      .run()
  })

  return { email }
}
