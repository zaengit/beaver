
import { useEffect, useState } from "react"

import { AdminLoadingState } from "@zaenpm/beaver/ui/admin/core/admin-loading-state"
import { PageForm, type PageData } from "@zaenpm/beaver/ui/admin/pages/page-form"
import { adminApiGet } from "@zaenpm/beaver/ui/admin/shared/api-client"

export function AdminPageCreatePage() {
  return <PageForm mode="create" />
}

export function AdminPageEditPage({ id }: { id: string }) {
  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApiGet<PageData>(`/api/admin/posts/${id}`).then((data) => {
      setPage(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <AdminLoadingState />
  if (!page) return <main className="p-6">Page not found.</main>

  return <PageForm mode="edit" page={page} />
}
