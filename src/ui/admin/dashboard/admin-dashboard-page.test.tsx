// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { act, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { AdminDashboardPage } from "@zbeaver/beaver/ui/admin/dashboard/admin-dashboard-page"

vi.mock("@zbeaver/beaver/ui/admin/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button">toggle</button>,
}))

vi.mock("@zbeaver/beaver/ui/admin/auth/admin-session-provider", () => ({
  useAdminSession: () => ({
    session: {
      permissions: [
        "content.page.view",
        "content.page.create",
        "content.post.view",
        "content.post.create",
        "media.view",
      ],
    },
  }),
}))

const mockStats = {
  totalPosts: 42,
  publishedPosts: 30,
  draftPosts: 12,
  totalMedia: 88,
  totalUsers: 5,
  totalCategories: 7,
}

function mockFetchSuccess(data: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data }),
  } as Response)
}

function mockFetchFailure(status: number) {
  globalThis.fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ success: false, message: "Server error" }),
  } as Response)
}

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("renders project content routes and role-aware actions after data loads", async () => {
    mockFetchSuccess(mockStats)

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeTruthy()
    })

    expect(screen.getByText("42")).toBeTruthy()
    expect(screen.getByText("30")).toBeTruthy()
    expect(screen.getByText("12")).toBeTruthy()
    expect(screen.getByText("88")).toBeTruthy()
    expect(screen.getByText("5")).toBeTruthy()
    expect(screen.getByText("7")).toBeTruthy()

    expect(screen.getByText("Total Content")).toBeTruthy()
    expect(screen.getByText("Published")).toBeTruthy()
    expect(screen.getByText("Drafts")).toBeTruthy()

    expect(screen.getByRole("link", { name: /^pages /i }).getAttribute("href")).toBe("/admin/posts/page")
    expect(screen.getByText("Content workspace")).toBeTruthy()
    expect(screen.queryByRole("link", { name: /media/i })).toBeNull()
  })

  it("shows loading state while data is pending", async () => {
    // pending promise — never settles
    globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}))

    await act(async () => {
      render(
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>,
      )
    })

    const loadingElement = screen.getByRole("main")
    expect(loadingElement.getAttribute("aria-busy")).toBe("true")
  })

  it("shows error state when fetch fails", async () => {
    mockFetchFailure(500)

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeTruthy()
    })
  })
})
