
import { lazy, Suspense, type ReactNode } from "react"
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router"
import { useAdminSession } from "@zbeaver/beaver/ui/auth/session-provider"
import { AdminSidebar } from "@zbeaver/beaver/ui/layout/app-sidebar"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import { SidebarInset, SidebarProvider } from "@zbeaver/beaver/ui/components/ui/sidebar"

import { AdminLoginPage } from "@zbeaver/beaver/ui/auth/login-page"

const ADMIN_PATH = "/admin"

const AdminDashboardPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/dashboard/dashboard-page")
  return { default: mod.AdminDashboardPage }
})

const AdminPostsContentListPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/posts/content-list-page")
  return { default: mod.AdminContentListPage }
})

const AdminUsersPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/users/users-page")
  return { default: mod.AdminUsersPage }
})

const AdminUserCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/users/user-form-page")
  return { default: mod.AdminUserCreatePage }
})

const AdminUserEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/users/user-form-page")
  return { default: mod.AdminUserEditPage }
})

const AdminMediaPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/media/media-page")
  return { default: mod.AdminMediaPage }
})

const AdminCategoriesPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/categories/categories-page")
  return { default: mod.AdminCategoriesPage }
})

const AdminMenusPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/menus/menus-page")
  return { default: mod.AdminMenusPage }
})

const AdminProfilePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/profile/profile-page")
  return { default: mod.AdminProfilePage }
})

const AdminCategoryCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/categories/category-form-page")
  return { default: mod.AdminCategoryCreatePage }
})

const AdminCategoryEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/categories/category-form-page")
  return { default: mod.AdminCategoryEditPage }
})

const AdminPostCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/posts/post-form-page")
  return { default: mod.AdminPostCreatePage }
})

const AdminPostEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/posts/post-form-page")
  return { default: mod.AdminPostEditPage }
})

const AdminPagesContentListPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/pages/content-list-page")
  return { default: mod.AdminContentListPage }
})

const AdminPageCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/pages/page-form-page")
  return { default: mod.AdminPageCreatePage }
})

const AdminPageEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/pages/page-form-page")
  return { default: mod.AdminPageEditPage }
})

const AdminSettingsPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/settings/settings-page")
  return { default: mod.AdminSettingsPage }
})

const AdminActivityLogPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/activity/activity-log-page")
  return { default: mod.AdminActivityLogPage }
})

const AdminTrashPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/trash/trash-page")
  return { default: mod.AdminTrashPage }
})

const AdminForbiddenPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/core/forbidden-page")
  return { default: mod.AdminForbiddenPage }
})

export function AdminRouter() {
  return (
    <Suspense fallback={<AdminLoadingState />}>
      <Routes>
        <Route path={`${ADMIN_PATH}/login`} element={<AdminLoginRoute />} />
        <Route path={ADMIN_PATH} element={<ProtectedAdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="posts" element={<AdminPostsContentListPage />} />
          <Route path="posts/new" element={<AdminPostCreatePage />} />
          <Route path="posts/:id/edit" element={<AdminPostEditRoute />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/new" element={<AdminUserCreatePage />} />
          <Route path="users/:id/edit" element={<AdminUserEditRoute />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="categories/new" element={<AdminCategoryCreatePage />} />
          <Route path="categories/:id/edit" element={<AdminCategoryEditRoute />} />
          <Route path="menus" element={<AdminMenusPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="trash" element={<RequireTrashPermission><AdminTrashPage /></RequireTrashPermission>} />
          <Route path="403" element={<AdminForbiddenPage />} />
          <Route path="posts/page" element={<RequireAdminPermission permission="content.page.view"><AdminPagesContentListPage /></RequireAdminPermission>} />
          <Route path="posts/page/new" element={<RequireAdminPermission permission="content.page.create"><AdminPageCreatePage /></RequireAdminPermission>} />
          <Route path="posts/page/:id/edit" element={<RequireAdminPermission permission="content.page.view"><AdminPageEditRoute /></RequireAdminPermission>} />
          <Route path="posts/:type" element={<AdminPostsContentListPage />} />
          <Route path="posts/:type/new" element={<AdminPostCreatePage />} />
          <Route path="posts/:type/:id/edit" element={<AdminPostEditRoute />} />
          <Route path="categories/:type" element={<AdminCategoriesPage />} />
          <Route path="categories/:type/new" element={<AdminCategoryCreatePage />} />
          <Route path="categories/:type/:id/edit" element={<AdminCategoryEditRoute />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="activity-log" element={<RequireAdminPermission permission="activity-log.view"><AdminActivityLogPage /></RequireAdminPermission>} />
        </Route>
        <Route path="*" element={<Navigate to={ADMIN_PATH} replace />} />
      </Routes>
    </Suspense>
  )
}

function AdminLoginRoute() {
  const { loading, session } = useAdminSession()

  if (loading) return <AdminLoadingState />

  if (session) {
    return <Navigate to={ADMIN_PATH} replace />
  }

  return <AdminLoginPage />
}

function RequireAdminPermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { session } = useAdminSession()
  return session?.permissions.includes(permission)
    ? children
    : <Navigate to={`${ADMIN_PATH}/403`} replace />
}

function RequireTrashPermission({ children }: { children: ReactNode }) {
  const { session } = useAdminSession()
  const allowed = session?.permissions.some((permission) => (
    permission.startsWith("content.")
    && (permission.endsWith(".delete") || permission.endsWith(".delete-own"))
  ))
  return allowed ? children : <Navigate to={`${ADMIN_PATH}/403`} replace />
}

function ProtectedAdminLayout() {
  const { loading, session } = useAdminSession()
  const location = useLocation()
  if (loading) return <AdminLoadingState />

  if (!session) {
    return <Navigate to={`${ADMIN_PATH}/login`} replace />
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        permissions={session.permissions}
        pathname={location.pathname}
        role={session.user.role}
      />
      <SidebarInset>
        <div className="flex min-h-svh flex-1 flex-col bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AdminCategoryEditRoute() {
  const { id } = useParams()

  if (!id) {
    return <Navigate to={`${ADMIN_PATH}/categories`} replace />
  }

  return <AdminCategoryEditPage id={id} />
}

function AdminPostEditRoute() {
  const { id } = useParams()

  if (!id) {
    return <Navigate to={`${ADMIN_PATH}/posts`} replace />
  }

  return <AdminPostEditPage id={id} />
}

function AdminPageEditRoute() {
  const { id } = useParams()

  if (!id) {
    return <Navigate to={`${ADMIN_PATH}/posts/page`} replace />
  }

  return <AdminPageEditPage id={id} />
}

function AdminUserEditRoute() {
  const { id } = useParams()

  if (!id) {
    return <Navigate to={`${ADMIN_PATH}/users`} replace />
  }

  return <AdminUserEditPage id={id} />
}
