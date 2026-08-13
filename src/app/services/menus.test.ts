import { beforeEach, describe, expect, it, vi } from "vitest"

const reorderMenuTree = vi.fn()

vi.mock("zadm/app/repositories/menus", async () => {
  const actual = await vi.importActual<typeof import("zadm/app/repositories/menus")>("zadm/app/repositories/menus")
  return {
    ...actual,
    reorderMenuTree,
  }
})

describe("reorderMenus", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("persists both position and parentId for nested items", async () => {
    const { reorderMenus } = await import("./menus")

    const result = reorderMenus({
      type: "navbar",
      tree: [
        {
          id: "01KRJWYM85B78JTT95VEVE55VH",
          parentId: null,
          position: 0,
          children: [
            {
              id: "01KRJWYM8BV3WHDMMY3TJPZD7B",
              parentId: "01KRJWYM85B78JTT95VEVE55VH",
              position: 0,
              children: [],
            },
          ],
        },
      ],
    })

    expect(result.success).toBe(true)
    expect(reorderMenuTree).toHaveBeenCalledWith([
      {
        id: "01KRJWYM85B78JTT95VEVE55VH",
        parentId: null,
        position: 0,
      },
      {
        id: "01KRJWYM8BV3WHDMMY3TJPZD7B",
        parentId: "01KRJWYM85B78JTT95VEVE55VH",
        position: 0,
      },
    ])
  })
})
