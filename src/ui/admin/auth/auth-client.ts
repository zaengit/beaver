
export async function fetchAdminSession() {
  const response = await fetch("/api/admin/auth/session", {
    credentials: "include",
  })
  if (!response.ok) return null
  const body = await response.json()
  return body.data
}
