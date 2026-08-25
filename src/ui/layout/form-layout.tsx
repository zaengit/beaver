
import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@zbeaver/beaver/ui/components/ui/card"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"

export function AdminFormLayout({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]", className)}>
      {children}
    </div>
  )
}

export function AdminFormMain({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-w-0 space-y-4", className)}>{children}</div>
}

export function AdminFormSidebar({ children, className }: { children: ReactNode; className?: string }) {
  return <aside className={cn("min-w-0 space-y-4", className)}>{children}</aside>
}

export function AdminFormCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card className={cn("overflow-hidden border-border/60 shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("space-y-5", contentClassName)}>{children}</CardContent>
    </Card>
  )
}
