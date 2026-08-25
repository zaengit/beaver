
import type { ReactNode } from "react"
import { SidebarTrigger } from "@zbeaver/beaver/ui/components/ui/sidebar"
import { Separator } from "@zbeaver/beaver/ui/components/ui/separator"

import { cn } from "@zbeaver/beaver/pkg/utils/ui"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@zbeaver/beaver/ui/components/ui/card"

export function AdminPageShell({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
  return (
    <main className={cn("flex min-h-full flex-1 flex-col bg-background", className)}>
      {children}
    </main>
  )
}

export function AdminPageHeader({
  title,
  search,
  actions,
}: {
  title: string
  search?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background">
      <div className="flex min-w-0 items-center gap-2 px-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="min-w-0 truncate text-sm font-medium text-foreground">
          {title}
        </h1>
      </div>
      {(search || actions) ? (
        <div className="ml-auto flex items-center gap-2 px-3">
          {search}
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export function AdminStatsGrid({
  children,
}: {
  children: ReactNode
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {children}
    </section>
  )
}

export function AdminStatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader className="gap-2">
        <CardDescription className="text-xs uppercase tracking-[0.2em]">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {hint}
      </CardContent>
    </Card>
  )
}

export function AdminSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("bg-card shadow-sm", className)}>
      <CardHeader className="border-b border-border/70">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="">{children}</CardContent>
    </Card>
  )
}
