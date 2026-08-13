import { describe, expect, it } from "vitest"

describe("menus repository module", () => {
  it("exports the expected CRUD surface", async () => {
    const repository = await import("./menus")

    expect(typeof repository.findMenuById).toBe("function")
    expect(typeof repository.listMenus).toBe("function")
    expect(typeof repository.createMenuRecord).toBe("function")
    expect(typeof repository.updateMenuRecord).toBe("function")
    expect(typeof repository.deleteMenuRecord).toBe("function")
    expect(typeof repository.reorderMenuTree).toBe("function")
  })
})
