// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { render, screen, waitFor } from "@testing-library/react"

import { AdminContentListPage } from "zadm/ui/admin/posts/admin-content-list-page"

const { adminApiGet } = vi.hoisted(() => ({
  adminApiGet: vi.fn(),
}))

vi.mock("zadm/ui/admin/shared/api-client", () => ({
  adminApiGet,
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
    useNavigate: () => vi.fn(),
    useParams: () => ({ type: "post" }),
  }
})

vi.mock("zadm/ui/admin/layout/admin-page-shell", () => ({
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

vi.mock("zadm/ui/admin/components/ui/table", async () => {
  const actual = await vi.importActual<typeof import("zadm/ui/admin/components/ui/table")>("zadm/ui/admin/components/ui/table")
  return actual
})

describe("Posts AdminContentListPage", () => {
  beforeEach(() => {
    adminApiGet.mockReset()
  })

  it("fetches and renders posts", async () => {
    adminApiGet.mockResolvedValue({
      data: [
        {
          id: "post-1",
          title: "Hello World",
          slug: "hello-world",
          status: "draft",
          type: "post",
          updatedAt: 1,
        },
      ],
      meta: { currentPage: 1, lastPage: 1, total: 1, from: 1, to: 1 },
    })

    render(<AdminContentListPage />)

    await waitFor(() => {
      expect(adminApiGet).toHaveBeenCalledWith("/api/admin/posts?type=post")
      expect(screen.getByText("Hello World")).toBeInTheDocument()
      expect(screen.getByText("draft")).toBeInTheDocument()
    })
  })

  it("shows empty state when no posts exist", async () => {
    adminApiGet.mockResolvedValue({ data: [], meta: null })

    render(<AdminContentListPage />)

    await waitFor(() => {
      expect(screen.getByText("No content found.")).toBeInTheDocument()
    })
  })
})
