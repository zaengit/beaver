import { describe, expect, it } from "vitest"

import { AdminApp } from "@zbeaver/beaver/ui/admin/core/admin-app"

describe("AdminApp module path", () => {
  it("exports AdminApp from the core directory", () => {
    expect(AdminApp).toBeTypeOf("function")
  })
})
