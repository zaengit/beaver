export function slugify(input: string): string {
  let slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")

  if (slug.length > 200) {
    slug = slug.slice(0, 200).replace(/-+$/, "")
  }

  return slug
}
