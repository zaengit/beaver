import { beforeEach, describe, expect, it, vi } from "vitest"

const { findUserByIdRecordMock } = vi.hoisted(() => ({
  findUserByIdRecordMock: vi.fn(),
}))

vi.mock("@zbeaver/beaver/app/repositories/users", () => ({
  findUserByIdRecord: findUserByIdRecordMock,
}))

import { getPermissionDefinitions } from "./permission-catalog"
import { can, canAny, getUserPermissions } from "./permissions"

describe("static role capability matrix", () => {
  beforeEach(() => {
    findUserByIdRecordMock.mockReset()
    findUserByIdRecordMock.mockImplementation(async (id: string) => ({ id, role: id }))
  })

  it("gives Super Admin and Admin every registered capability", async () => {
    const registered = getPermissionDefinitions().map(({ slug }) => slug)

    await expect(getUserPermissions("super-admin")).resolves.toEqual(registered)
    await expect(getUserPermissions("admin")).resolves.toEqual(registered)
  })

  it("lets Super Admin use capabilities that are not in the catalog", async () => {
    await expect(can("super-admin", "future.capability")).resolves.toBe(true)
    await expect(canAny("super-admin", ["future.capability"])).resolves.toBe(true)
  })

  it("lets Editor manage all content, categories, media upload, and the dashboard", async () => {
    const permissions = await getUserPermissions("editor")

    expect(permissions).toEqual(expect.arrayContaining([
      "dashboard.view",
      "content.post.view",
      "content.post.edit",
      "content.page.edit",
      "category.post.manage",
      "category.page.manage",
      "media.view",
      "media.upload",
    ]))
    expect(permissions).not.toEqual(expect.arrayContaining([
      "users.view",
      "menus.view",
      "settings.manage",
      "media.delete",
    ]))
  })

  it("limits Author to their own post actions and read-only post categories", async () => {
    const permissions = await getUserPermissions("author")

    expect(permissions).toEqual(expect.arrayContaining([
      "dashboard.view",
      "content.post.view",
      "content.post.create",
      "content.post.edit-own",
      "content.post.delete-own",
      "content.post.publish-own",
      "content.post.unpublish-own",
      "category.post.view",
      "media.view",
      "media.upload",
    ]))
    expect(permissions).not.toEqual(expect.arrayContaining([
      "content.post.edit",
      "content.post.delete",
      "content.post.publish",
      "content.page.view",
      "category.post.manage",
      "users.view",
      "menus.view",
      "settings.manage",
      "media.delete",
    ]))
  })

  it("returns no capabilities for a missing or invalid role", async () => {
    findUserByIdRecordMock.mockResolvedValue({ id: "unknown", role: "viewer" })

    await expect(getUserPermissions("unknown")).resolves.toEqual([])
    await expect(can("unknown", "dashboard.view")).resolves.toBe(false)
  })
})
