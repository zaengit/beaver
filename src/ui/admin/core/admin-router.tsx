
import { lazy, Suspense } from "react"
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router"
import { useAdminSession } from "@zbeaver/beaver/ui/admin/auth/admin-session-provider"
import { AdminSidebar } from "@zbeaver/beaver/ui/admin/layout/app-sidebar"
import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import { SidebarInset, SidebarProvider } from "@zbeaver/beaver/ui/admin/components/ui/sidebar"
import { ADMIN_PATH } from "@zbeaver/beaver/app/admin/admin-path"

import { AdminLoginPage } from "@zbeaver/beaver/ui/admin/auth/admin-login-page"

const AdminDashboardPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/dashboard/admin-dashboard-page")
  return { default: mod.AdminDashboardPage }
})

const AdminPostsContentListPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/posts/admin-content-list-page")
  return { default: mod.AdminContentListPage }
})

const AdminUsersPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/users/admin-users-page")
  return { default: mod.AdminUsersPage }
})

const AdminUserCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/users/admin-user-form-page")
  return { default: mod.AdminUserCreatePage }
})

const AdminUserEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/users/admin-user-form-page")
  return { default: mod.AdminUserEditPage }
})

const AdminMediaPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/media/admin-media-page")
  return { default: mod.AdminMediaPage }
})

const AdminCategoriesPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/categories/admin-categories-page")
  return { default: mod.AdminCategoriesPage }
})

const AdminMenusPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/menus/admin-menus-page")
  return { default: mod.AdminMenusPage }
})

const AdminRolesPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/roles/admin-roles-page")
  return { default: mod.AdminRolesPage }
})

const AdminProfilePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/profile/admin-profile-page")
  return { default: mod.AdminProfilePage }
})

const AdminCategoryCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/categories/admin-category-form-page")
  return { default: mod.AdminCategoryCreatePage }
})

const AdminCategoryEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/categories/admin-category-form-page")
  return { default: mod.AdminCategoryEditPage }
})

const AdminPostCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/posts/admin-post-form-page")
  return { default: mod.AdminPostCreatePage }
})

const AdminPostEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/posts/admin-post-form-page")
  return { default: mod.AdminPostEditPage }
})

const AdminPagesContentListPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/pages/admin-content-list-page")
  return { default: mod.AdminContentListPage }
})

const AdminPageCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/pages/admin-page-form-page")
  return { default: mod.AdminPageCreatePage }
})

const AdminPageEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/pages/admin-page-form-page")
  return { default: mod.AdminPageEditPage }
})

const AdminRoleCreatePage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/roles/admin-role-form-page")
  return { default: mod.AdminRoleCreatePage }
})

const AdminRoleEditPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/roles/admin-role-form-page")
  return { default: mod.AdminRoleEditPage }
})

const AdminSettingsPage = lazy(async () => {
  const mod = await import("@zbeaver/beaver/ui/admin/settings/admin-settings-page")
  return { default: mod.AdminSettingsPage }
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
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="roles/new" element={<AdminRoleCreatePage />} />
          <Route path="roles/:id/edit" element={<AdminRoleEditRoute />} />
          <Route path="posts/page" element={<AdminPagesContentListPage />} />
          <Route path="posts/page/new" element={<AdminPageCreatePage />} />
          <Route path="posts/page/:id/edit" element={<AdminPageEditRoute />} />
          <Route path="posts/:type" element={<AdminPostsContentListPage />} />
          <Route path="posts/:type/new" element={<AdminPostCreatePage />} />
          <Route path="posts/:type/:id/edit" element={<AdminPostEditRoute />} />
          <Route path="categories/:type" element={<AdminCategoriesPage />} />
          <Route path="categories/:type/new" element={<AdminCategoryCreatePage />} />
          <Route path="categories/:type/:id/edit" element={<AdminCategoryEditRoute />} />
          <Route path="settings" element={<AdminSettingsPage />} />
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
        user={session.user}
        permissions={session.permissions}
        roleName={session.roleName}
        pathname={location.pathname}
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

function AdminRoleEditRoute() {
  const { id } = useParams()

  if (!id) {
    return <Navigate to={`${ADMIN_PATH}/roles`} replace />
  }

  return <AdminRoleEditPage id={id} />
}
