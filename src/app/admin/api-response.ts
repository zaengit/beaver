export function adminSuccess<T>(data: T, message = "OK") {
  return Response.json({ success: true, data, message })
}

export function adminCreated<T>(data: T, message = "Created") {
  return Response.json({ success: true, data, message }, { status: 201 })
}

export function adminError(
  message: string,
  status = 400,
  errors?: Record<string, string[]>,
) {
  return Response.json({ success: false, message, ...(errors ? { errors } : {}) }, { status })
}

export function adminUnauthorized(message = "Unauthorized.") {
  return adminError(message, 401)
}
