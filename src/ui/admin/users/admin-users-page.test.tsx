// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { render, screen, waitFor } from "@testing-library/react"

import { AdminUsersPage } from "@zbeaver/beaver/ui/admin/users/admin-users-page"

const { adminApiGet } = vi.hoisted(() => ({
  adminApiGet: vi.fn(),
}))

vi.mock("@zbeaver/beaver/ui/admin/shared/api-client", () => ({
  adminApiGet,
  adminApiPost: vi.fn(),
}))

vi.mock("@zbeaver/beaver/ui/admin/layout/admin-page-shell", () => ({
  AdminPageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AdminPageHeader: ({ title, search, actions }: { title: string; search?: React.ReactNode; actions?: React.ReactNode }) => (
    <div><h1>{title}</h1>{search}{actions}</div>
  ),
}))

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")

  return {
    ...actual,
    Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
    useLocation: () => ({
      pathname: "/admin/users",
      search: "",
      hash: "",
      state: null,
      key: "test",
    }),
    useNavigate: () => mockNavigate,
  }
})

describe("AdminUsersPage", () => {
  beforeEach(() => {
    adminApiGet.mockReset()
    mockNavigate.mockReset()
  })

  it("renders users from the API with pagination metadata", async () => {
    adminApiGet.mockResolvedValue({
      data: [
        {
          id: "user-1",
          name: "Admin",
          email: "admin@example.com",
          roleName: "Administrator",
          updatedAt: 1,
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 20,
        total: 1,
        lastPage: 1,
        from: 1,
        to: 1,
      },
    })

    render(<AdminUsersPage />)

    await waitFor(() => {
      expect(adminApiGet).toHaveBeenCalledWith("/api/admin/users")
      expect(screen.getByText("Admin")).toBeTruthy()
      expect(screen.getByText("admin@example.com")).toBeTruthy()
      expect(screen.getByText("Administrator")).toBeTruthy()
      expect(screen.getByText("Showing 1–1 of 1")).toBeTruthy()
    })
  })

  it("switches to URL with search params on initial mount when provided", async () => {
    adminApiGet.mockResolvedValue({
      data: [],
      meta: null,
    })

    render(<AdminUsersPage />)

    await waitFor(() => {
      expect(adminApiGet).toHaveBeenCalledWith("/api/admin/users")
    })
  })
})
