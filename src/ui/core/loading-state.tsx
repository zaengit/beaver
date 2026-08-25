
import { LoaderCircle } from "lucide-react"

export function AdminLoadingState({ className = "p-6" }: { className?: string }) {
  return (
    <main className={`grid min-h-[50vh] place-items-center ${className}`} aria-busy="true">
      <LoaderCircle className="size-7 animate-spin text-muted-foreground" aria-label="Loading" />
    </main>
  )
}
