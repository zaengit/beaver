import { describe, expect, it } from "vitest"
import { ADMIN_PATH } from "zadm/app/admin/admin-path"

describe("admin path", () => {
  it("uses the configured public admin path", () => {
    expect(ADMIN_PATH).toMatch(/^\/[A-Za-z0-9_-]+$/)
  })
})
