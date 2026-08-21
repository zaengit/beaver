// @vitest-environment jsdom
/// <reference types="vitest/globals" />

import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router"

import { AdminRouter } from "@zbeaver/beaver/ui/admin/core/admin-router"

const sessionState = vi.hoisted(() => ({
  loading: false,
  session: null as null | {
    user: {
      id: string
      name: string
      email: string
      roleId: string | null
      emailVerified: number
      createdAt: number
      updatedAt: number
    }
    permissions: string[]
    roleName: string | null
  },
}))

vi.mock("@zbeaver/beaver/ui/admin/auth/admin-session-provider", () => ({
  useAdminSession: () => sessionState,
}))

vi.mock("@zbeaver/beaver/ui/admin/auth/admin-login-page", () => ({
  AdminLoginPage: () => <div>login-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/dashboard/admin-dashboard-page", () => ({
  AdminDashboardPage: () => <div>dashboard-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/posts/admin-content-list-page", () => ({
  AdminContentListPage: () => <div>posts-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/users/admin-users-page", () => ({
  AdminUsersPage: () => <div>users-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/media/admin-media-page", () => ({
  AdminMediaPage: () => <div>media-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/categories/admin-categories-page", () => ({
  AdminCategoriesPage: () => <div>categories-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/menus/admin-menus-page", () => ({
  AdminMenusPage: () => <div>menus-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/roles/admin-roles-page", () => ({
  AdminRolesPage: () => <div>roles-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/posts/admin-post-form-page", () => ({
  AdminPostCreatePage: () => <div>post-create-page</div>,
  AdminPostEditPage: ({ id }: { id: string }) => <div>post-edit-page-{id}</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/pages/admin-content-list-page", () => ({
  AdminContentListPage: () => <div>pages-page</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/pages/admin-page-form-page", () => ({
  AdminPageCreatePage: () => <div>page-create-page</div>,
  AdminPageEditPage: ({ id }: { id: string }) => <div>page-edit-page-{id}</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/roles/admin-role-form-page", () => ({
  AdminRoleCreatePage: () => <div>role-create-page</div>,
  AdminRoleEditPage: ({ id }: { id: string }) => <div>role-edit-page-{id}</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/layout/app-sidebar", () => ({
  AdminSidebar: () => <div>sidebar-shell</div>,
}))

vi.mock("@zbeaver/beaver/ui/admin/components/ui/sidebar", () => ({
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button">toggle</button>,
}))

function renderAdminRouter(initialPathname: string) {
  window.history.replaceState(null, "", initialPathname)

  return render(
    <MemoryRouter initialEntries={[initialPathname]}>
      <AdminRouter />
    </MemoryRouter>
  )
}

describe("AdminRouter", () => {
  beforeEach(() => {
    sessionState.loading = false
    sessionState.session = null
  })

  it("redirects unauthenticated protected routes to login", async () => {
    renderAdminRouter("/admin/posts")

    await waitFor(() => {
      expect(screen.getByText("login-page")).toBeTruthy()
    })
  })

  it("redirects authenticated users away from login to dashboard", async () => {
    sessionState.session = {
      user: {
        id: "1",
        name: "Admin",
        email: "admin@example.com",
        roleId: "role-1",
        emailVerified: 1,
        createdAt: 0,
        updatedAt: 0,
      },
      permissions: ["posts.view"],
      roleName: "Administrator",
    }

    renderAdminRouter("/admin/login")

    await waitFor(() => {
      expect(screen.getByText("dashboard-page")).toBeTruthy()
    })
  })

  it("renders the role create route for authenticated users", async () => {
    sessionState.session = {
      user: {
        id: "1",
        name: "Admin",
        email: "admin@example.com",
        roleId: "role-1",
        emailVerified: 1,
        createdAt: 0,
        updatedAt: 0,
      },
      permissions: ["roles.view", "roles.manage"],
      roleName: "Administrator",
    }

    renderAdminRouter("/admin/roles/new")

    await waitFor(() => {
      expect(screen.getByText("role-create-page")).toBeTruthy()
    })
  })

  it("renders the forbidden page for authenticated users", async () => {
    sessionState.session = {
      user: {
        id: "1",
        name: "Admin",
        email: "admin@example.com",
        roleId: "role-1",
        emailVerified: 1,
        createdAt: 0,
        updatedAt: 0,
      },
      permissions: ["categories.view"],
      roleName: "Viewer",
    }

    renderAdminRouter("/admin/403")

    await waitFor(() => {
      expect(screen.getByText("403")).toBeTruthy()
      expect(screen.getByText("Forbidden")).toBeTruthy()
    })
  })

  it("routes page management to the dedicated page modules", async () => {
    sessionState.session = {
      user: {
        id: "1", name: "Admin", email: "admin@example.com", roleId: "role-1",
        emailVerified: 1, createdAt: 0, updatedAt: 0,
      },
      permissions: ["posts.view", "posts.manage"],
      roleName: "Administrator",
    }

    renderAdminRouter("/admin/posts/page/page-1/edit")

    await waitFor(() => {
      expect(screen.getByText("page-edit-page-page-1")).toBeTruthy()
    })
  })

  it("passes the post ID from a typed post route to its edit page", async () => {
    sessionState.session = {
      user: {
        id: "1", name: "Admin", email: "admin@example.com", roleId: "role-1",
        emailVerified: 1, createdAt: 0, updatedAt: 0,
      },
      permissions: ["posts.view", "posts.manage"],
      roleName: "Administrator",
    }

    renderAdminRouter("/admin/posts/article/article-1/edit")

    await waitFor(() => {
      expect(screen.getByText("post-edit-page-article-1")).toBeTruthy()
    })
  })
})
