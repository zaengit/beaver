
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { adminApiGet } from "@zbeaver/beaver/ui/admin/shared/api-client"
import { AdminLoadingState } from "@zbeaver/beaver/ui/admin/core/admin-loading-state"
import { PostForm } from "@zbeaver/beaver/ui/admin/posts/post-form"

export function AdminPostCreatePage() {
  const { type = "post" } = useParams()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    params.set("type", type)
    adminApiGet<any[]>(`/api/admin/categories?${params.toString()}`).then((data) => {
      setCategories(data)
      setLoading(false)
    })
  }, [type])

  if (loading) return <AdminLoadingState />

  return (
    <>
      <PostForm 
        mode="create" 
        categories={categories} 
        pageTitle={`Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        defaultType={type} />
    </>
  )
}

export function AdminPostEditPage({ id }: { id: string }) {
  const { type = "post" } = useParams()
  const [post, setPost] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApiGet<any>(`/api/admin/posts/${id}`),
      adminApiGet<any[]>("/api/admin/categories"),
    ]).then(([postData, catData]) => {
      setPost(postData)
      setCategories(catData)
      setLoading(false)
    })
  }, [id])

  if (loading) return <AdminLoadingState />
  if (!post) return <main className="p-6">{type.charAt(0).toUpperCase() + type.slice(1)} not found.</main>

  return (
    <>
      <PostForm 
        mode="edit" 
        post={post} 
        categories={categories} 
        pageTitle={`Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        defaultType={type} />
    </>
  )
}
