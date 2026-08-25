
import { useAdminSession } from "@zbeaver/beaver/ui/auth/session-provider"
import {
  CircleDot,
  LayoutDashboard,
  FileText,
  Image,
  FolderTree,
  Menu,
  Settings,
  Users,
  UserRound,
  LogOut,
  Hash,
  Globe,
  History,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
} from "@zbeaver/beaver/ui/components/ui/sidebar"
import { useNavigate } from "react-router"
import { getContentTypeRegistry } from "@zbeaver/beaver/app/registry/content-types"
import type { StaticRole } from "@zbeaver/beaver/pkg/types/roles"
import packageJson from "../../../package.json" with { type: "json" }

interface AdminSidebarProps {
  permissions: string[]
  pathname: string
  role: StaticRole
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText: FileText,
  Layout: LayoutDashboard,
  Image: Image,
  FolderTree: FolderTree,
  Settings: Settings,
  Star: CircleDot,
  Bookmark: CircleDot,
  Tag: Hash,
  Hash: Hash,
  Bell: CircleDot,
}

const workspaceNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "dashboard.view" },
  { title: "Media", href: "/admin/media", icon: Image, permission: "media.view" },
  { title: "Menus", href: "/admin/menus", icon: Menu, permission: "menus.view" },
] as const

const administrationNavItems = [
  { title: "Users", href: "/admin/users", icon: Users, permission: "users.view" },
  { title: "Activity Log", href: "/admin/activity-log", icon: History, permission: "activity-log.view" },
  { title: "Settings", href: "/admin/settings", icon: Globe, permission: "settings.manage" },
] as const

export function AdminSidebar({ permissions, pathname, role }: AdminSidebarProps) {
  const contentTypesForSidebar = [
    { id: "page", name: "page", label: "Pages", slug: "page", icon: "Layout", position: 0 },
    ...getContentTypeRegistry().contentTypes.map((contentType) => ({ ...contentType, id: contentType.slug })),
  ]
  const navigate = useNavigate()
  const { setSession } = useAdminSession()
  const visibleWorkspaceNavItems = workspaceNavItems.filter(
    (item) => item.permission === null || permissions.includes(item.permission)
  )
  const visibleAdministrationNavItems = administrationNavItems.filter(
    (item) => item.permission === null || permissions.includes(item.permission)
  )
  const canShowCategoryNavigation = role !== "author"
  const visibleContentTypes = contentTypesForSidebar.filter(
    (contentType) =>
      permissions.includes(`content.${contentType.slug}.view`) ||
      (canShowCategoryNavigation && permissions.includes(`category.${contentType.slug}.view`))
  )

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin"
    return pathname === href || pathname.startsWith(href + "/")
  }

  function isContentTypeActive(slug: string): boolean {
    return (
      pathname.startsWith(`/admin/posts/${slug}`) ||
      (slug !== "page" && pathname.startsWith(`/admin/categories/${slug}`))
    )
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" })
    setSession(null)
    navigate("/admin/login", { replace: true })
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-3 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="rounded-md" onClick={() => navigate("/admin")}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 text-left leading-none">
                <span className="truncate font-semibold">Beaver</span>
                <span className="truncate text-xs text-sidebar-foreground/65">
                  v{packageJson.version}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleWorkspaceNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className="rounded-md font-medium"
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {visibleContentTypes.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {visibleContentTypes.map((ct) => {
                  const IconComponent = ct.icon && iconMap[ct.icon] ? iconMap[ct.icon] : FileText
                  const hasPostsPerm = permissions.includes(`content.${ct.slug}.view`)
                  const hasCatPerm = canShowCategoryNavigation && permissions.includes(`category.${ct.slug}.view`)

                  // Pages are a standalone content type; categories are not part of its navigation.
                  if (ct.slug === "page") {
                    if (!hasPostsPerm) return null
                    const pageIsActive = pathname.startsWith(`/admin/posts/${ct.slug}`)
                    return (
                      <SidebarMenuItem key={ct.id}>
                        <SidebarMenuButton
                          tooltip={ct.label}
                          className="rounded-md font-medium"
                          isActive={pageIsActive}
                          onClick={() => navigate(`/admin/posts/${ct.slug}`)}
                        >
                          <IconComponent />
                          <span>{ct.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  return (
                    <SidebarMenuItem key={ct.id}>
                      <SidebarMenuButton
                        tooltip={ct.label}
                        className="rounded-md font-medium"
                        isActive={isContentTypeActive(ct.slug)}
                        onClick={() => navigate(`/admin/posts/${ct.slug}`)}
                      >
                        <IconComponent />
                        <span>{ct.label}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {hasPostsPerm && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              href={`/admin/posts/${ct.slug}`}
                              isActive={pathname.startsWith(`/admin/posts/${ct.slug}`)}
                              className="rounded-md"
                              onClick={(event) => {
                                event.preventDefault()
                                navigate(`/admin/posts/${ct.slug}`)
                              }}
                            >
                              <FileText className="size-3.5" />
                              <span>{ct.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                        {hasCatPerm && (
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              href={`/admin/categories/${ct.slug}`}
                              isActive={pathname.startsWith(`/admin/categories/${ct.slug}`)}
                              className="rounded-md"
                              onClick={(event) => {
                                event.preventDefault()
                                navigate(`/admin/categories/${ct.slug}`)
                              }}
                            >
                              <FolderTree className="size-3.5" />
                              <span>Categories</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {visibleAdministrationNavItems.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {visibleAdministrationNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                      className="rounded-md font-medium"
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-md" onClick={() => navigate("/admin/profile")}>
              <UserRound />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-md" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
