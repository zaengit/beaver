import { describe, expect, it } from "vitest"

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "zadm/app/admin/jwt"

describe("admin jwt helpers", () => {
  it("signs and verifies access and refresh tokens", async () => {
    const access = await signAccessToken({
      sub: "user_123",
      email: "admin@example.com",
      roleId: "role_123",
      permissions: ["posts.view"],
    })
    const refresh = await signRefreshToken({
      sub: "user_123",
      sessionId: "session_123",
    })

    const accessPayload = await verifyAccessToken(access)
    const refreshPayload = await verifyRefreshToken(refresh)

    expect(accessPayload.sub).toBe("user_123")
    expect(accessPayload.permissions).toEqual(["posts.view"])
    expect(refreshPayload.sessionId).toBe("session_123")
  })
})
