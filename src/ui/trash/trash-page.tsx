import { Navigate } from "react-router"

export function AdminTrashPage() {
  return <Navigate to="/admin/posts?trash=true" replace />
}
