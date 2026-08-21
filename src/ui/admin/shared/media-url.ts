export function safeAdminImageUrl(value: unknown) {
  if (typeof value !== "string") return null
  const candidate = value.trim()
  if (!candidate || /[\u0000-\u001f\u007f\\]/.test(candidate) || candidate.startsWith("//")) return null
  if (candidate.startsWith("/")) return candidate

  try {
    return ["http:", "https:"].includes(new URL(candidate).protocol) ? candidate : null
  } catch {
    return null
  }
}
