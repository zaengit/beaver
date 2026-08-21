// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { AdminSidebar } from "@zbeaver/beaver/ui/admin/layout/app-sidebar"

const { navigateMock, setSessionMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  setSessionMock: vi.fn(),
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock("@zbeaver/beaver/ui/admin/auth/admin-session-provider", () => ({
  useAdminSession: () => ({
    setSession: setSessionMock,
  }),
}))

vi.mock("@zbeaver/beaver/ui/admin/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenuSub: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuSubItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuSubButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}))

describe("AdminSidebar", () => {
  beforeEach(() => {
    navigateMock.mockReset()
    setSessionMock.mockReset()
    vi.restoreAllMocks()
  })

  it("clears the admin session before redirecting to login on logout", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(
      <MemoryRouter>
        <AdminSidebar
          permissions={["posts.view"]}
          pathname="/admin"
        />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole("button", { name: /logout/i }))

    await waitFor(() => {
      expect(setSessionMock).toHaveBeenCalledWith(null)
      expect(navigateMock).toHaveBeenCalledWith("/admin/login", { replace: true })
    })
  })

  it("shows Pages as a direct link even when page category permission exists", () => {
    render(
      <MemoryRouter>
        <AdminSidebar
          permissions={["content.page.view", "category.page.view"]}
          pathname="/admin/posts/page"
        />
      </MemoryRouter>
    )

    expect(screen.getAllByRole("button", { name: "Pages" })).toHaveLength(1)
    expect(screen.queryByRole("button", { name: "Categories" })).toBeNull()
  })

  it("shows the installed Beaver version in the admin sidebar footer", () => {
    render(
      <MemoryRouter>
        <AdminSidebar
          permissions={["posts.view"]}
          pathname="/admin"
        />
      </MemoryRouter>
    )

    expect(screen.getByText(/^Beaver v\d+\.\d+\.\d+$/)).toBeInTheDocument()
  })
})
