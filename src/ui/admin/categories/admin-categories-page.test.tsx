// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { render, screen, waitFor } from "@testing-library/react"

import { AdminCategoriesPage } from "@zaenpm/beaver/ui/admin/categories/admin-categories-page"

const { adminApiGet } = vi.hoisted(() => ({
  adminApiGet: vi.fn(),
}))

vi.mock("@zaenpm/beaver/ui/admin/shared/api-client", () => ({
  adminApiGet,
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")

  return {
    ...actual,
    Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
    useLocation: () => ({
      pathname: "/admin/categories",
      search: "",
      hash: "",
      state: null,
      key: "test",
    }),
    useNavigate: () => vi.fn(),
    useParams: () => ({ type: "post" }),
  }
})

vi.mock("@zaenpm/beaver/ui/admin/layout/admin-page-shell", () => ({
  AdminPageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AdminPageHeader: ({
    title,
    search,
    actions,
  }: {
    title: string
    search?: React.ReactNode
    actions?: React.ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {search}
      {actions}
    </div>
  ),
}))

vi.mock("@zaenpm/beaver/ui/admin/components/ui/table", async () => {
  const actual = await vi.importActual<typeof import("@zaenpm/beaver/ui/admin/components/ui/table")>("@zaenpm/beaver/ui/admin/components/ui/table")
  return actual
})

describe("AdminCategoriesPage", () => {
  beforeEach(() => {
    adminApiGet.mockReset()
  })

  it("re-fetches categories after a successful action", async () => {
    adminApiGet.mockResolvedValue([
      {
        id: "cat-1",
        name: "News",
        slug: "news",
        type: "post",
        updatedAt: 1,
      },
    ])

    render(<AdminCategoriesPage />)

    await waitFor(() => {
      expect(adminApiGet).toHaveBeenCalledTimes(1)
      expect(adminApiGet).toHaveBeenCalledWith("/api/admin/categories?type=post")
    })
  })

  it("shows empty state when no categories exist", async () => {
    adminApiGet.mockResolvedValue([])

    render(<AdminCategoriesPage />)

    await waitFor(() => {
      expect(screen.getByText("No categories found.")).toBeInTheDocument()
    })
  })
})
