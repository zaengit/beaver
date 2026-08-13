
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { adminApiGet } from "zadm/ui/admin/shared/api-client"
import { AdminLoadingState } from "zadm/ui/admin/core/admin-loading-state"
import { CategoryForm } from "zadm/ui/admin/categories/category-form"

export function AdminCategoryCreatePage() {
  const { type = "post" } = useParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <AdminLoadingState />

  return (
    <>
      <CategoryForm
        mode="create"
        pageTitle="Create Category"
        defaultType={type}
      />
    </>
  )
}

export function AdminCategoryEditPage({ id }: { id: string }) {
  const { type = "post" } = useParams()
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApiGet<any>(`/api/admin/categories/${id}`).then((data) => {
      setCategory(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <AdminLoadingState />
  if (!category) return <main className="p-6">Category not found.</main>

  return (
    <>
      <CategoryForm
        mode="edit"
        category={category}
        pageTitle="Edit Category"
        defaultType={type}
      />
    </>
  )
}
