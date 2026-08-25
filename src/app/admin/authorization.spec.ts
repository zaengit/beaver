import { describe, expect, it } from "vitest"

import { canAssignRole, type AdminActor } from "./authorization"

function actor(role: AdminActor["role"]): AdminActor {
  return {
    id: `${role ?? "invalid"}-1`,
    role,
    isSuperAdmin: role === "super-admin",
    permissions: new Set(),
  }
}

describe("static role assignment", () => {
  it("allows Super Admin to assign database-backed roles but never persist Super Admin", async () => {
    const superAdmin = actor("super-admin")

    await expect(canAssignRole(superAdmin, "admin")).resolves.toBe(true)
    await expect(canAssignRole(superAdmin, "editor")).resolves.toBe(true)
    await expect(canAssignRole(superAdmin, "author")).resolves.toBe(true)
    await expect(canAssignRole(superAdmin, "super-admin")).resolves.toBe(false)
  })

  it("lets Admin assign Admin, Editor, and Author", async () => {
    const admin = actor("admin")

    await expect(canAssignRole(admin, "admin")).resolves.toBe(true)
    await expect(canAssignRole(admin, "editor")).resolves.toBe(true)
    await expect(canAssignRole(admin, "author")).resolves.toBe(true)
    await expect(canAssignRole(admin, "super-admin")).resolves.toBe(false)
  })

  it("only lets Editor assign Editor or Author, and Author assign Author", async () => {
    const editor = actor("editor")
    const author = actor("author")

    await expect(canAssignRole(editor, "editor")).resolves.toBe(true)
    await expect(canAssignRole(editor, "author")).resolves.toBe(true)
    await expect(canAssignRole(editor, "admin")).resolves.toBe(false)

    await expect(canAssignRole(author, "author")).resolves.toBe(true)
    await expect(canAssignRole(author, "editor")).resolves.toBe(false)
  })
})
