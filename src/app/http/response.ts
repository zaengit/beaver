export function redirectResponse(location: string, status = 302) {
  return new Response(null, {
    status,
    headers: { Location: location },
  })
}
