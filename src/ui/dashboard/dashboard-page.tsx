
import { useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowRight, FileText, type LucideIcon } from "lucide-react"

import { getContentTypeRegistry } from "@zbeaver/beaver/app/registry/content-types"
import { useAdminSession } from "@zbeaver/beaver/ui/auth/session-provider"
import { adminApiGet } from "@zbeaver/beaver/ui/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/core/loading-state"
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSectionCard,
  AdminStatCard,
  AdminStatsGrid,
} from "@zbeaver/beaver/ui/layout/page-shell"

type DashboardStats = {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalMedia: number
  totalUsers: number
  totalCategories: number
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { session } = useAdminSession()
  const isAuthor = session?.user?.role === "author"
  const contentTypes = [
    { label: "Pages", slug: "page" },
    { label: "Posts", slug: "post" },
    ...getContentTypeRegistry().contentTypes.filter(
      (contentType) => contentType.slug !== "page" && contentType.slug !== "post",
    ),
  ]
  async function loadStats() {
    setError(null)
    const data = await adminApiGet<DashboardStats>("/api/admin/dashboard")
    setStats(data)
  }

  useEffect(() => {
    loadStats().catch((e) => setError(e.message))
  }, [])

  if (error) return <main className="p-6"><p className="text-destructive">Error: {error}</p></main>
  if (!stats) return <AdminLoadingState />

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Dashboard"
      />

      <div className="p-4 space-y-4">
        <AdminStatsGrid>
          <AdminStatCard
            label={isAuthor ? "My Content" : "Total Content"}
            value={String(stats.totalPosts)}
            hint={isAuthor ? "Your content across every status" : "All content across every status"}
          />
          <AdminStatCard
            label="Published"
            value={String(stats.publishedPosts)}
            hint="Content visible to visitors"
          />
          <AdminStatCard
            label="Drafts"
            value={String(stats.draftPosts)}
            hint="Content waiting to be finished"
          />
          <AdminStatCard
            label="Media"
            value={String(stats.totalMedia)}
            hint="Uploaded files and images"
          />
          {!isAuthor ? (
            <>
              <AdminStatCard
                label="Users"
                value={String(stats.totalUsers)}
                hint="Registered admin accounts"
              />
              <AdminStatCard
                label="Categories"
                value={String(stats.totalCategories)}
                hint="Content taxonomies"
              />
            </>
          ) : null}
        </AdminStatsGrid>

        <section>
          <AdminSectionCard
            title="Content workspace"
            description="Start, review, and organize the content you can access."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {contentTypes
                .filter((contentType) => session?.permissions.includes(`content.${contentType.slug}.view`))
                .map((contentType) => (
                  <QuickLink
                    key={contentType.slug}
                    to={`/admin/posts/${contentType.slug}`}
                    title={contentType.label}
                    description={`Manage ${contentType.label.toLowerCase()} and their publishing status.`}
                    icon={FileText}
                  />
                ))}
              {contentTypes.every((contentType) => !session?.permissions.includes(`content.${contentType.slug}.view`)) ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  Your role does not currently have access to a content type.
                </p>
              ) : null}
            </div>
          </AdminSectionCard>
        </section>
      </div>
    </AdminPageShell>
  )
}

function QuickLink({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: string
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Link
      to={to}
      className="group rounded-sm border border-border/70 bg-muted/20 p-4 transition hover:border-foreground/15 hover:bg-muted/45"
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-sm bg-background text-foreground ring-1 ring-border/70">
        <Icon className="size-4" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>{title}</span>
          <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}
