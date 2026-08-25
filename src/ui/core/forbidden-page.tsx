import { Link } from "react-router"

import { buttonVariants } from "@zbeaver/beaver/ui/components/ui/button"
import { cn } from "@zbeaver/beaver/pkg/utils/ui"

export function AdminForbiddenPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-6xl font-semibold tracking-tight">403</p>
        <h1 className="text-2xl font-semibold">Forbidden</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Link to="/admin" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
