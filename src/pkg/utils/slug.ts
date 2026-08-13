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

export async function generateSlug(
  title: string,
  checkExists: (slug: string) => boolean | Promise<boolean>,
): Promise<string | null> {
  const baseSlug = slugify(title)
  if (baseSlug === "") return null

  if (!(await checkExists(baseSlug))) return baseSlug

  for (let index = 1; index <= 100; index += 1) {
    const candidate = `${baseSlug}-${index}`
    if (!(await checkExists(candidate))) return candidate
  }

  return null
}
