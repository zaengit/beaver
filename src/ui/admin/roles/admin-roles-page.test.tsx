// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { AdminRolesPage } from "@zaenpm/beaver/ui/admin/roles/admin-roles-page"

const { adminApiGet, adminApiPost } = vi.hoisted(() => ({
  adminApiGet: vi.fn(),
  adminApiPost: vi.fn(),
}))

vi.mock("@zaenpm/beaver/ui/admin/shared/api-client", () => ({
  adminApiGet,
  adminApiPost,
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")

  return {
    ...actual,
    Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
    useLocation: () => ({
      pathname: "/admin/roles",
      search: "",
      hash: "",
      state: null,
      key: "test",
    }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock("@zaenpm/beaver/ui/admin/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button">toggle</button>,
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSidebar: () => ({ open: true, setOpen: vi.fn() }),
}))

describe("AdminRolesPage", () => {
  beforeEach(() => {
    adminApiGet.mockReset()
    adminApiPost.mockReset()
  })

  it("re-fetches roles after a successful action", async () => {
    adminApiGet.mockResolvedValue({
      roles: [
        {
          id: "role-1",
          name: "Admin",
          slug: "admin",
          userCount: 1,
        },
      ],
      meta: null,
    })

    render(<AdminRolesPage />)

    await waitFor(() => {
      expect(adminApiGet).toHaveBeenCalledTimes(1)
      expect(adminApiGet).toHaveBeenCalledWith("/api/admin/roles")
    })

    adminApiPost.mockResolvedValue({ success: true })
    fireEvent.click(screen.getByLabelText("Select Admin"))
    fireEvent.click(screen.getByRole("button", { name: "Duplicate" }))

    await waitFor(() => {
      expect(adminApiGet).toHaveBeenCalledTimes(2)
      expect(adminApiGet).toHaveBeenLastCalledWith("/api/admin/roles")
    })
    expect(adminApiPost).toHaveBeenCalledWith("/api/admin/roles/bulk/duplicate", { ids: ["role-1"] })
  })
})
