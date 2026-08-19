
import { useEffect, useState } from "react"
import { adminApiGet } from "@zaenpm/beaver/ui/admin/shared/api-client"
import { AdminLoadingState } from "@zaenpm/beaver/ui/admin/core/admin-loading-state"
import { MediaForm } from "@zaenpm/beaver/ui/admin/media/media-form"

export function AdminMediaEditPage({ id }: { id: string }) {
  const [media, setMedia] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApiGet<any>(`/api/admin/media/${id}`).then((data) => {
      setMedia(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <AdminLoadingState />
  if (!media) return <main className="p-6">Media not found.</main>

  return (
    <>
      <MediaForm
        mode="edit"
        media={media}
        pageTitle="Edit Media"
      />
    </>
  )
}
