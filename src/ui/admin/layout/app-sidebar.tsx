
import { useAdminSession } from "@zbeaver/beaver/ui/admin/auth/admin-session-provider"
import {
  CircleDot,
  LayoutDashboard,
  FileText,
  Image,
  FolderTree,
  Menu,
  Settings,
  Users,
  Shield,
  UserRound,
  LogOut,
  ChevronDown,
  Hash,
  Globe,
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
} from "@zbeaver/beaver/ui/admin/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@zbeaver/beaver/ui/admin/components/ui/collapsible"
import { useNavigate } from "react-router"
import { getContentTypeRegistry } from "@zbeaver/beaver/app/registry/content-types"
import packageJson from "../../../../package.json" with { type: "json" }

interface AdminSidebarProps {
  user: {
    id: string
    name: string
    email: string
    roleId: string | null
  }
  permissions: string[]
  roleName: string | null
  pathname: string
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

const baseNavItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: null },
  { title: "Media", href: "/admin/media", icon: Image, permission: "media.view" },
  { title: "Menus", href: "/admin/menus", icon: Menu, permission: "menus.view" },
  { title: "Users", href: "/admin/users", icon: Users, permission: "users.view" },
  { title: "Roles & Permissions", href: "/admin/roles", icon: Shield, permission: "roles.view" },
  { title: "Settings", href: "/admin/settings", icon: Globe, permission: "settings.manage" },
] as const

export function AdminSidebar({ user, permissions, roleName, pathname }: AdminSidebarProps) {
  const contentTypesForSidebar = [
    { id: "page", name: "page", label: "Pages", slug: "page", icon: "Layout", position: 0 },
    ...getContentTypeRegistry().contentTypes.map((contentType) => ({ ...contentType, id: contentType.slug })),
  ]
  const navigate = useNavigate()
  const { setSession } = useAdminSession()
  const visibleNavItems = baseNavItems.filter(
    (item) => item.permission === null || permissions.includes(item.permission)
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

  function isContentGroupExpanded(slug: string): boolean {
    return isContentTypeActive(slug)
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" })
    setSession(null)
    navigate("/admin/login", { replace: true })
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="gap-3 px-3 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="rounded-sm" onClick={() => navigate("/admin")}>
              <div className="flex aspect-square size-9 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Beaver</span>
                <span className="truncate text-xs text-sidebar-foreground/65">Editorial control center</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                    className="rounded-sm"
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Divider */}
              <SidebarMenuItem className="mt-3 pt-3 border-t border-sidebar-border">
                <SidebarGroupLabel className="px-1 pb-2 text-xs font-semibold tracking-wider text-sidebar-foreground/50">
                  CONTENT
                </SidebarGroupLabel>
              </SidebarMenuItem>

              {/* Content Type Groups */}
              {contentTypesForSidebar.map((ct) => {
                const IconComponent = ct.icon && iconMap[ct.icon] ? iconMap[ct.icon] : FileText
                const hasPostsPerm = permissions.includes(`content.${ct.slug}.view`)
                const hasCatPerm = permissions.includes(`category.${ct.slug}.view`)

                if (!hasPostsPerm && !hasCatPerm) return null

                // Pages are a standalone content type; categories are not part of its navigation.
                if (ct.slug === "page") {
                  if (!hasPostsPerm) return null
                  const isActive = pathname.startsWith(`/admin/posts/${ct.slug}`)
                  return (
                    <SidebarMenuItem key={ct.id}>
                      <SidebarMenuButton
                        tooltip={ct.label}
                        className="rounded-sm"
                        isActive={isActive}
                        onClick={() => navigate(`/admin/posts/${ct.slug}`)}
                      >
                        <IconComponent />
                        <span>{ct.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                // Other types: collapsible with sub-items
                const expanded = isContentGroupExpanded(ct.slug)

                return (
                  <Collapsible key={ct.id} defaultOpen={expanded} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            tooltip={ct.label}
                            className="rounded-sm"
                            isActive={isContentTypeActive(ct.slug)}
                          />
                        }
                      >
                        <IconComponent />
                        <span>{ct.label}</span>
                        <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {hasPostsPerm && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={pathname.startsWith(`/admin/posts/${ct.slug}`) || (!pathname.includes("/") && ct.slug === "post")}
                                className="rounded-sm"
                                onClick={() => navigate(`/admin/posts/${ct.slug}`)}
                              >
                                <FileText className="size-3.5" />
                                <span>{ct.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                          {hasCatPerm && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                isActive={pathname.startsWith(`/admin/categories/${ct.slug}`)}
                                className="rounded-sm"
                                onClick={() => navigate(`/admin/categories/${ct.slug}`)}
                              >
                                <FolderTree className="size-3.5" />
                                <span>Categories</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-sm" onClick={() => navigate("/admin/profile")}>
              <UserRound />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-sm" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-3 pt-3 text-xs text-sidebar-foreground/50">Beaver v{packageJson.version}</p>
      </SidebarFooter>
    </Sidebar>
  )
}
