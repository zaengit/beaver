// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { AdminContentListPage } from "@zbeaver/beaver/ui/admin/pages/admin-content-list-page"

const { adminApiGet, adminApiPost, navigate } = vi.hoisted(() => ({
  adminApiGet: vi.fn(),
  adminApiPost: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock("@zbeaver/beaver/ui/admin/shared/api-client", () => ({
  adminApiGet,
  adminApiPost,
}))

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router")

  return {
    ...actual,
    Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
    useLocation: () => ({
      pathname: "/admin/posts",
      search: "",
      hash: "",
      state: null,
      key: "test",
    }),
    useNavigate: () => navigate,
    useParams: () => ({ type: "post" }),
  }
})

vi.mock("@zbeaver/beaver/ui/admin/layout/admin-page-shell", () => ({
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

vi.mock("@zbeaver/beaver/ui/admin/components/ui/table", async () => {
  const actual = await vi.importActual<typeof import("@zbeaver/beaver/ui/admin/components/ui/table")>("@zbeaver/beaver/ui/admin/components/ui/table")
  return actual
})

describe("Pages AdminContentListPage", () => {
  beforeEach(() => {
    adminApiGet.mockReset()
    adminApiPost.mockReset()
    navigate.mockReset()
  })

  it("fetches and renders pages", async () => {
    adminApiGet.mockResolvedValue({
      data: [
        {
          id: "page-1",
          title: "Hello World",
          slug: "hello-world",
          status: "draft",
          type: "page",
          updatedAt: 1,
        },
      ],
      meta: { currentPage: 1, lastPage: 1, total: 1, from: 1, to: 1 },
    })

    render(<AdminContentListPage />)

    await waitFor(() => {
      expect(adminApiGet).toHaveBeenCalledWith("/api/admin/posts?type=page")
      expect(screen.getByText("Hello World")).toBeInTheDocument()
      expect(screen.getByText("draft")).toBeInTheDocument()
    })
  })

  it("shows empty state when no pages exist", async () => {
    adminApiGet.mockResolvedValue({ data: [], meta: null })

    render(<AdminContentListPage />)

    await waitFor(() => {
      expect(screen.getByText("No pages found.")).toBeInTheDocument()
    })
  })

  it("creates a page from the title dialog and opens its editor", async () => {
    adminApiGet.mockResolvedValue({ data: [], meta: null })
    adminApiPost.mockResolvedValue({ success: true, message: "ok", data: { id: "page-1" } })

    render(<AdminContentListPage />)

    await screen.findByText("No pages found.")
    fireEvent.click(screen.getByRole("button", { name: "New Page" }))
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "About us" } })
    fireEvent.click(screen.getByRole("button", { name: "Create Page" }))

    await waitFor(() => {
      expect(adminApiPost).toHaveBeenCalledWith("/api/admin/posts", {
        title: "About us",
        type: "page",
        status: "draft",
      })
      expect(navigate).toHaveBeenCalledWith("/admin/posts/page/page-1/edit")
    })
  })
})
