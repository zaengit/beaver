import { describe, expect, it } from "vitest"

import {
  handleGetMedia,
  handleGetMenu,
  handleGetRole,
  handleGetSettings,
  handleGetUser,
  handleListMedia,
  handleListMenus,
  handleListRoles,
  handleSyncPermissions,
  handleListUsers,
} from "@zbeaver/beaver/app/handlers"

describe("admin read handlers", () => {
  it("reject unauthenticated direct calls even without router middleware", async () => {
    const responses = await Promise.all([
      handleListUsers(null),
      handleGetUser(null, "user-1"),
      handleListRoles(null),
      handleSyncPermissions(null),
      handleGetRole(null, "role-1"),
      handleListMenus(null),
      handleGetMenu(null, "menu-1"),
      handleListMedia(null, {}),
      handleGetMedia(null, "media-1"),
      handleGetSettings(null),
    ])

    expect(responses.map((response) => response.status)).toEqual(Array(10).fill(401))
  })
})
