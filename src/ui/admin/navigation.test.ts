import { afterEach, describe, expect, it, vi } from "vitest"

describe("navigation helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("builds a URL from a pathname and record params", async () => {
    const { buildNavigationUrl } = await import("./navigation")

    expect(
      buildNavigationUrl("/admin/posts", {
        search: "draft post",
        status: "draft",
        page: 2,
      }),
    ).toBe("/admin/posts?search=draft+post&status=draft&page=2")
  })

  it("omits empty params when building URLs", async () => {
    const { buildNavigationUrl } = await import("./navigation")

    expect(
      buildNavigationUrl("/admin/categories", {
        type: "all",
        search: "",
        page: undefined,
        roleId: null,
      }),
    ).toBe("/admin/categories")
  })

  it("navigates with the browser location API", async () => {
    const assign = vi.fn()
    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:4321",
        assign,
      },
    })

    const { navigateTo } = await import("./navigation")
    navigateTo("/admin/media")

    expect(assign).toHaveBeenCalledWith("/admin/media")
  })

  it("uses history navigation for internal admin SPA routes", async () => {
    const assign = vi.fn()
    const pushState = vi.fn()
    const dispatchEvent = vi.fn()

    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:4321",
        assign,
      },
      history: {
        state: { idx: 0, keep: "value" },
        pushState,
      },
      dispatchEvent,
    })
    vi.stubGlobal("PopStateEvent", class {
      type: string
      constructor(type: string) {
        this.type = type
      }
    })

    const { navigateTo } = await import("./navigation")
    navigateTo("/admin/posts?page=2")

    expect(pushState).toHaveBeenCalledWith(
      { idx: 1, keep: "value" },
      "",
      "/admin/posts?page=2",
    )
    expect(dispatchEvent).toHaveBeenCalledTimes(1)
    expect(assign).not.toHaveBeenCalled()
  })

  it("uses history replaceState for internal admin replace navigation", async () => {
    const assign = vi.fn()
    const pushState = vi.fn()
    const replaceState = vi.fn()
    const dispatchEvent = vi.fn()

    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:4321",
        assign,
      },
      history: {
        state: { idx: 3, keep: "value" },
        pushState,
        replaceState,
      },
      dispatchEvent,
    })
    vi.stubGlobal("PopStateEvent", class {
      type: string
      constructor(type: string) {
        this.type = type
      }
    })

    const { navigateTo } = await import("./navigation")
    navigateTo("/admin/login", { replace: true })

    expect(replaceState).toHaveBeenCalledWith(
      { idx: 3, keep: "value" },
      "",
      "/admin/login",
    )
    expect(dispatchEvent).toHaveBeenCalledTimes(1)
    expect(assign).not.toHaveBeenCalled()
  })

  it("reloads the current page", async () => {
    const reload = vi.fn()
    vi.stubGlobal("window", {
      location: {
        reload,
      },
    })

    const { reloadPage } = await import("./navigation")
    reloadPage()

    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("reads the current window search params", async () => {
    vi.stubGlobal("window", {
      location: {
        search: "?search=hero&page=3",
      },
    })

    const { getCurrentSearchParams } = await import("./navigation")

    expect(getCurrentSearchParams().toString()).toBe("search=hero&page=3")
  })
})
