import { cp, mkdir } from "node:fs/promises"

const copy = (from, to) => cp(new URL(from, import.meta.url), new URL(to, import.meta.url))

await mkdir(new URL("../dist/astro/", import.meta.url), { recursive: true })
await mkdir(new URL("../dist/ui/", import.meta.url), { recursive: true })
await copy("../src/astro/admin.astro", "../dist/astro/admin.astro")
await copy("../src/ui/admin-layout.astro", "../dist/ui/admin-layout.astro")
await copy("../src/ui/admin.css", "../dist/ui/admin.css")
await cp(new URL("../src/registry/", import.meta.url), new URL("../dist/registry/", import.meta.url), { recursive: true })
