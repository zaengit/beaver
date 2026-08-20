
import { LoaderCircle } from "lucide-react"
import { Skeleton } from "@zbeaver/beaver/ui/admin/components/ui/skeleton"

export function AdminLoadingState({ className = "p-6" }: { className?: string }) {
  return (
    <main className={`grid min-h-[50vh] place-items-center ${className}`} aria-busy="true">
      <LoaderCircle className="size-7 animate-spin text-muted-foreground" aria-label="Loading" />
    </main>
  )
}

export function AdminTableLoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-4">
        <Skeleton className="h-8 w-full" />
      </td>
    </tr>
  )
}
