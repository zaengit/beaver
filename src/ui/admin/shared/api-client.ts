export interface AdminApiSuccess<T> {
  success: true
  message: string
  data: T
}

export interface AdminApiFailure {
  success: false
  message: string
  data?: null
  errors?: Record<string, string[]>
}

export type AdminApiResult<T> = AdminApiSuccess<T> | AdminApiFailure

let refreshRequest: Promise<boolean> | null = null
let unauthorizedHandler: (() => void) | null = null

/**
 * Registers the active admin session owner. A terminal 401 means both the
 * access token and its refresh fallback are no longer usable, so the owner
 * must clear its session and let the router render the login route.
 */
export function setAdminUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch("/api/admin/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

async function adminApiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<AdminApiResult<T>> {
  const headers = new Headers(init.headers)
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData

  if (init.body && !isFormData && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    credentials: "include",
  }

  let response = await fetch(path, requestInit)

  // An access token may expire while a tab is inactive. Refresh it once, then
  // repeat the original request with the newly-issued cookie.
  if (response.status === 401 && await refreshAccessToken()) {
    response = await fetch(path, requestInit)
  }

  // Do this only after the one permitted refresh/retry. Clearing the React
  // session makes ProtectedAdminLayout redirect to the configured login path.
  if (response.status === 401) {
    unauthorizedHandler?.()
  }

  const fallbackError: AdminApiFailure = {
    success: false,
    message: `Request failed: ${response.status}`,
  }

  const body = await response.json().catch(() => fallbackError)
  if (typeof body?.success === "boolean") {
    return body as AdminApiResult<T>
  }

  if (response.ok) {
    return {
      success: true,
      message: "OK",
      data: body as T,
    }
  }

  return fallbackError
}

export async function adminApiGet<T>(path: string): Promise<T> {
  const result = await adminApiRequest<T>(path)
  if (!result.success) {
    throw new Error(result.message)
  }

  return result.data
}

export function adminApiPost<T>(path: string, body?: unknown) {
  return adminApiRequest<T>(path, {
    method: "POST",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

export function adminApiPut<T>(path: string, body?: unknown) {
  return adminApiRequest<T>(path, {
    method: "PUT",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

export function adminApiDelete<T>(path: string) {
  return adminApiRequest<T>(path, {
    method: "DELETE",
  })
}
