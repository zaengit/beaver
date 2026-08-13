import { describe, expect, it } from "vitest"

import { AdminApp } from "zadm/ui/admin/core/admin-app"

describe("AdminApp module path", () => {
  it("exports AdminApp from the core directory", () => {
    expect(AdminApp).toBeTypeOf("function")
  })
})
