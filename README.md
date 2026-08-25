# @zbeaver/beaver

CMS admin panel, API, and runtime integration for host applications.

[![npm version](https://img.shields.io/npm/v/@zbeaver/beaver)](https://www.npmjs.com/package/@zbeaver/beaver)
[![license](https://img.shields.io/npm/l/@zbeaver/beaver)](./LICENSE)

![Beaver admin panel](./screenshot.png)

## Features

### Content management

- Dashboard for monitoring the editorial workspace.
- Pages and posts with draft/published status, publication timestamps, slugs, excerpts, descriptions, tags, categories, featured images, galleries, and SEO metadata.
- Registry-based custom content types with custom fields and archive/detail templates.
- Rich-text editing with HTML sanitization before content is stored or rendered.
- Duplicate, bulk move-to-trash, bulk publish, and bulk unpublish actions.
- Trash for every content type, including pages, with restore and permanent delete actions.
- Public search, tag archives, category filters, custom-field filters, sorting, and pagination.

### Website building

- Astro SSR public website with React and Tailwind support.
- Page sections such as Hero, contact, FAQ, video, map, pricing, showcase, steps, testimonials, and post collections.
- File-based website templates inside `src/` with JSON registries for content types, sections, and menus.
- Dynamic routes for the home page, content archives, content details, search, and tags.
- Hierarchical menu builder with navbar, footer, and sidebar groups.
- Site settings for title, description, SEO metadata, logo, favicon, social links, opening hours, custom CSS, and custom JavaScript.

### Media and inquiry form

- Media library with upload, folders, metadata, alt text, captions, thumbnails, and responsive image variants.
- File signature, MIME type, size, image dimension, and pixel-count validation for uploaded media.
- Public inquiry form with SMTP delivery, reply-to email, Turnstile verification, input validation, and rate limiting.

### Setup and data

- Host-owned setup: the runtime package does not ship a starter website or generate host entrypoints. The separate `@zbeaver/create-beaver` initializer owns and packages starter templates.
- Database migration, system seed, and custom seed data import.
- Public server APIs for querying posts, pages, tags, filters, menus, and site settings.
- SQLite, MySQL, and PostgreSQL databases with Drizzle migrations.

## Advantages

- **Host-agnostic website:** the consuming application owns its routes, UI entrypoints, registries, and public website source.
- **Simple deployment:** SQLite keeps local development and small deployments easy to operate, while the Node standalone adapter supports server hosting.
- **Flexible without hard-coded pages:** registries let a project add content types, sections, menu groups, and templates without modifying the Beaver admin core.

## Quick start

### Create a new project

Use the published initializer to create a host application with the Flowstack
starter template:

```bash
npm create @zbeaver/beaver
```

The wizard asks for the project directory, template, package manager, and
environment-managed Super Admin credentials. It then copies the host files,
installs Astro and Beaver, runs the database migration, seeds the system data,
imports the selected template seed data, and prints the local URLs. The target
directory is created below the current directory; the current directory is not
overwritten.

The generated host can then be started with `npm run dev` from its project
directory. The runtime package and the initializer are versioned separately:
`@zbeaver/beaver` provides the server/API/admin runtime, while
`@zbeaver/create-beaver` packages the starter templates and installation flow.

Follow this guide in order: configure the host application, build the website in `src/`, query public data, then manage the Super Admin account.

## Integrate Beaver into Astro

Install `@zbeaver/beaver` in the Astro host and add the host-owned Astro
entrypoints. The host owns its route files, admin page, API adapter, storage
adapter, and public website source. Beaver only provides the reusable server,
Hono API, React admin UI, and domain APIs.

See [Astro framework entrypoints](../docs/framework-entrypoints.md) for the
complete host integration contract.

For Astro, the minimum host-owned API route is:

```ts
// src/pages/api/[...path].ts
import { apiApp } from "@zbeaver/beaver/server"

export const prerender = false
export const ALL = ({ request }: { request: Request }) => apiApp.fetch(request)
```

The host also owns the `/admin` page, the `/storage` route, registry exposure,
and the public routes. See the framework guide for the complete entrypoint
contract.

## Project root files

The consuming application should provide these files at its project root:

```text
project/
├── .env
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── src/
```

### `.env`

```dotenv
# Runtime
# NODE_ENV=development
# BEAVER_TEST_MODE=true # Development/tests only; never enable in production.

# Database
DB_CONNECTION=sqlite
DB_DATABASE=./db/sqlite.db

# For MySQL/PostgreSQL, configure these instead of the SQLite defaults.
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=
# DB_SSL=false

# Legacy alternative to DB_* settings. Do not combine this with DB_* settings
# unless intentional.
# DATABASE_URL=

# Environment-managed Super Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=
ADMIN_NAME=Super Admin

# Generate each value independently, for example: openssl rand -base64 32
SESSION_SECRET=
ADMIN_JWT_ACCESS_SECRET=
ADMIN_JWT_REFRESH_SECRET=

# Optional environment-managed Super Admin TOTP.
ADMIN_2FA_ENABLED=false
# ADMIN_2FA_SECRET=

# Admin/session settings
ADMIN_PATH=admin
# COOKIE_SECURE=false
TRUST_PROXY=false

CONTENT_TYPE_REGISTRY_PATH=src/components/content-type-templates/registry.json
SECTION_REGISTRY_PATH=src/components/sections/registry.json
MENU_GROUP_REGISTRY_PATH=src/components/menus/registry.json

# Media storage
STORAGE_TYPE=local
STORAGE_PATH=./public/storage
# STORAGE_DIR=./public/storage # Alias for STORAGE_PATH.
# UPLOAD_DIR=./public          # Legacy fallback when STORAGE_PATH is unset.

# AWS S3 storage (use when STORAGE_TYPE=s3).
# S3_REGION=us-east-1
# S3_BUCKET=
# S3_ENDPOINT=
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# S3_FORCE_PATH_STYLE=false

# Public contact form / Cloudflare Turnstile
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
CONTACT_TURNSTILE_REQUIRED=false

# Optional contact email delivery
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Optional filesystem cache for public data
PUBLIC_CACHE_DIR=
PUBLIC_CACHE_TTL_SECONDS=

# Scheduling worker (run `beaver worker` as a separate process)
BEAVER_WORKER_INTERVAL_SECONDS=60
BEAVER_WORKER_BATCH_SIZE=100
```

- `DB_CONNECTION` selects `sqlite`, `mysql`, or `pgsql`; `DB_DATABASE` is the SQLite path.
- `DATABASE_URL` is the legacy alternative to the `DB_*` settings.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` define the environment-managed Super Admin identity. It is not stored in `users`.
- `SESSION_SECRET`, `ADMIN_JWT_ACCESS_SECRET`, and `ADMIN_JWT_REFRESH_SECRET` must be random values of at least 32 characters outside test mode.
- `ADMIN_2FA_ENABLED=true` and `ADMIN_2FA_SECRET` enable TOTP for the environment-managed Super Admin.
- `ADMIN_PATH` is the admin URL segment used by the host; the included Astro starter mounts `/admin`.
- `CONTENT_TYPE_REGISTRY_PATH`, `SECTION_REGISTRY_PATH`, and `MENU_GROUP_REGISTRY_PATH` point to the host-owned registries.
- `STORAGE_TYPE` selects `local` or `s3`; `STORAGE_PATH` is the local media directory.
- `S3_*` variables configure AWS S3 when `STORAGE_TYPE=s3`.
- `TRUST_PROXY` should only be enabled when a trusted proxy overwrites forwarded-IP headers.
- `PUBLIC_TURNSTILE_*` and `SMTP_*` configure the public inquiry form.
- `PUBLIC_CACHE_*` enables optional filesystem caching for public data.
- `BEAVER_WORKER_*` configures the scheduling worker interval and batch size.

Keep `.env` private and do not commit generated secrets to source control.

### Storage backends

Beaver supports two media storage backends. Both use the same public URL format,
`/storage/<file>`, so switching the backend does not change media URLs.

For local filesystem storage:

```dotenv
STORAGE_TYPE=local
STORAGE_PATH=./public/storage
```

`STORAGE_PATH` may be an absolute path to a persistent volume. If it is not set,
existing projects fall back to `<UPLOAD_DIR>/storage`.

For AWS S3:

```dotenv
STORAGE_TYPE=s3
S3_REGION=us-east-1
S3_BUCKET=my-beaver-media
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_FORCE_PATH_STYLE=false
```

Create the bucket before uploading media. AWS's default credential chain is also
supported when the explicit S3 key variables are omitted.

The storage route reads objects on the server, so S3 credentials are never sent
to the browser. Changing `STORAGE_TYPE` does not migrate existing files; copy
the existing media to the new backend before switching production traffic.

### `astro.config.mjs`

The canonical starter configuration is
[`templates/config/astro.config.mjs`](./templates/config/astro.config.mjs):

```js
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import node from "@astrojs/node"
import tailwindcss from "@tailwindcss/vite"
import { loadEnv } from "vite"

const environment = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "")
Object.assign(process.env, environment)
const astroHost = environment.ASTRO_HOST?.trim() || false

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["@zbeaver/beaver"],
      noExternal: ["cookie"],
    },
    server: {
      watch: {
        ignored: ["**/sqlite.db", "**/sqlite.db-wal", "**/sqlite.db-shm"],
      },
    },
  },
  integrations: [react()],
  server: { host: astroHost },
  security: {
    checkOrigin: true,
  },
})
```

This configuration:

- menjalankan Astro dalam mode SSR dengan Node standalone adapter;
- mengaktifkan React dan Tailwind melalui integrasi Astro/Vite;
- mengecualikan runtime Beaver dari bundling SSR dan menjaga `cookie` tetap dibundle;
- mengabaikan file sementara SQLite dari watcher development;
- mengaktifkan kompresi HTML, hover prefetch, dan Astro origin checking;
- membaca `ASTRO_HOST` sebagai binding host opsional.

The host imports these registry files directly:

```text
src/components/content-type-templates/registry.json
src/components/sections/registry.json
src/components/menus/registry.json
```

Edit these files to configure the host's content types, sections, and menu
groups. `ASTRO_HOST` remains an optional server binding setting.

## Build the host website

A website is created directly inside the host project's `src/` directory.
The website source follows this structure. `hero.astro` is the section example:

```text
src/
├── components/
│   ├── admin-app.tsx
│   ├── component-map.ts
│   ├── content-type-archive.astro
│   ├── content-type-custom-fields.astro
│   ├── content-type-detail.astro
│   ├── content-type-templates/
│   │   ├── archive/
│   │   ├── detail/
│   │   ├── component-resolver.ts
│   │   ├── registry.json
│   │   └── types.ts
│   ├── footer.tsx
│   ├── menus/registry.json
│   ├── navbar.tsx
│   ├── page-sections.astro
│   ├── public-page.astro
│   ├── sections/
│   │   ├── hero.astro
│   │   └── registry.json
│   └── tag-links.astro
├── env.d.ts
├── layouts/
│   ├── admin-layout.astro
│   └── public-layout.astro
├── middleware.ts
├── pages/
│   ├── admin/[...path].astro
│   ├── api/[...path].ts
│   ├── api/registry.ts
│   ├── storage/[...path].ts
│   ├── [type]/
│   │   ├── [slug].astro
│   │   └── index.astro
│   ├── index.astro
│   ├── search.astro
│   └── tag/
│       └── [tag].astro
├── shared/
│   ├── registry.ts
│   └── types/
│       ├── index.ts
│       └── posts.ts
└── styles/
    ├── public.css
    └── tokens.css
```

### `components/`

This directory contains the host-owned public website components and the
admin/registry bridges.

- `admin-app.tsx` renders Beaver's React admin UI and supplies host registries.
- `component-map.ts` maps registered content and section components.
- `content-type-archive.astro` selects the archive template registered for a content type and passes it the posts, filters, and pagination data.
- `content-type-detail.astro` selects the detail template registered for a content type, renders custom fields, and optionally renders page sections.
- `content-type-custom-fields.astro` displays the custom field values configured for a detail template.
- `footer.tsx` renders the public footer from the Beaver menu tree and site settings.
- `navbar.tsx` renders the public navigation from the Beaver menu tree and site settings.
- `page-sections.astro` reads a page's section data, resolves each section component, and passes published content to sections that need it.
- `public-page.astro` renders a public page description and its page sections.
- `responsive-image.astro` renders public images with safe source handling and responsive loading behavior.
- `inquiry-form.tsx` renders the inquiry form used by the contact section.
- `safe-url.ts` validates image and public content URLs before they are rendered as links or media.
- `tag-links.astro` renders links for a post's tags.

### `components/content-type-templates/`

Content-type templates control how archive and detail pages look. The file name
is the template ID used by the registry.

- `archive/default.astro` is the fallback archive layout.
- `archive/post-grid.astro` renders posts in the Flowstack card grid.
- `archive/archive-filters.astro` renders search, category, tag, and custom-field filters.
- `archive/archive-pagination.astro` renders archive pagination controls.
- `detail/default.astro` is the fallback detail layout.
- `detail/post-reader.astro` renders a long-form post detail page.
- `component-resolver.ts` discovers archive and detail Astro components and resolves them by registry ID.
- `registry.json` defines content types, archive templates, detail templates, field slots, and whether detail sections are enabled.
- `types.ts` defines the props and data helpers shared by archive and detail templates.

Example: add a `case-study` content type with custom archive and detail
layouts:

```json
{
  "contentTypes": [
    {
      "name": "case-study",
      "label": "Case Studies",
      "slug": "case-study",
      "icon": "Briefcase",
      "description": "Customer stories and project results.",
      "archiveTemplate": "case-study-grid",
      "detailTemplate": "case-study-reader",
      "position": 2
    }
  ],
  "templates": [
    {
      "id": "case-study-grid",
      "label": "Case study grid",
      "description": "A grid of published case studies.",
      "kind": "archive"
    },
    {
      "id": "case-study-reader",
      "label": "Case study reader",
      "description": "The case study detail layout.",
      "kind": "detail",
      "sectionsEnabled": true,
      "fieldSlots": [
        { "key": "client", "label": "Client", "type": "text" },
        { "key": "result", "label": "Result", "type": "rich-text" },
        { "key": "cover", "label": "Cover image", "type": "image" }
      ]
    }
  ]
}
```

The matching website files are:

```text
src/components/content-type-templates/archive/case-study-grid.astro
src/components/content-type-templates/detail/case-study-reader.astro
```

The `id` in `registry.json` must match the file name. The public archive route
reads `archiveTemplate`, and the public detail route reads `detailTemplate`.
The component resolver then loads the matching Astro component automatically.
`fieldSlots` defines the custom fields available to the detail template, while
`sectionsEnabled` controls whether the detail page can render page sections.

#### Fields supported in the content-type admin

The `contentTypes` entries support these fields:

- `name`: internal content type name.
- `label`: name shown in the admin dashboard.
- `slug`: URL segment used by the archive and detail routes.
- `icon`: optional dashboard icon name.
- `description`: optional content type description.
- `archiveTemplate`: template ID used by the archive route.
- `detailTemplate`: template ID used by the detail route and custom fields.
- `position`: optional dashboard ordering value.

The `templates` entries support these fields:

- `id`: unique template ID; it must match the Astro file name without `.astro`.
- `kind`: `archive` or `detail`.
- `sectionsEnabled`: enables the section editor on a detail page when set to `true`.
- `fieldSlots`: custom fields shown in the post editor for a detail template.

Each `fieldSlots` entry supports:

- `key`: field key saved inside `customFieldValues`.
- `label`: field label shown in the admin form.
- `type`: input type supported by the admin form:
  - `text`: single-line text input.
  - `rich-text`: multi-line text area.
  - `number`: numeric input and numeric value.
  - `boolean`: checkbox.
  - `date`: date input.
  - `image`: media picker for an image.

Use only these field types when creating custom fields. An unknown type falls
back to a text input, and `select` does not currently render as a dropdown in
the admin editor.

### `components/menus/`

- `registry.json` defines the menu groups used by the public navigation and footer.

This registry defines menu group types, not the actual menu links. The links
are managed as Beaver menu data and are returned by `getMenuTree()`.

Example:

```json
[
  { "type": "navbar", "label": "Navbar", "description": "Primary site navigation." },
  { "type": "footer", "label": "Footer", "description": "Footer navigation." },
  { "type": "sidebar", "label": "Sidebar", "description": "Sidebar navigation." }
]
```

Use the registered group in a layout or component:

```astro
---
import { getMenuTree } from "@zbeaver/beaver/server"

const sidebarResult = getMenuTree("sidebar")
const sidebarItems = sidebarResult.success ? sidebarResult.data : []
---

<nav aria-label="Sidebar navigation">
  {sidebarItems.map((item) => <a href={item.url}>{item.title}</a>)}
</nav>
```

#### Fields supported in the menu admin

The menu group registry supports these fields:

- `type`: group ID. The current admin and menu API support `navbar`, `footer`,
  and `sidebar`.
- `label`: group name shown in the menu selector.
- `description`: optional group description.

The admin menu builder also supports drag-and-drop ordering and nesting. The
result is saved through `position`, `parentId`, and the nested `children` tree.

Flowstack uses the same pattern for `navbar` and `footer` in
`layouts/public-layout.astro`.

### `components/sections/`

Sections are reusable page blocks. A section's `type` must match its component
file name and its entry in `registry.json`.

- `hero.astro` renders the main visual introduction for a page and is the example used below.
- `registry.json` defines the available section types, fields, item modes, and demo values.
- `shared/section-heading.astro` and `shared/types.ts` provide shared section helpers when a section needs them.

The registry entry controls which fields appear in the admin section editor:

- `type` is the section ID and normally matches `sections/<type>.astro`.
- `label` and `description` are shown in the section picker.
- `sectionFields` are fields for the section itself, such as `title`, `text`, or `bg_color`.
- `itemFields` are fields for each item in the section.
- `itemMode` is `none`, `single`, or `repeatable`.
- `contentType` optionally loads published content for the section, such as posts.
- `columns` defines responsive item columns in the editor.
- `demo` provides example values for the editor preview.

#### Fields supported in the section admin

Use the following names in `sectionFields` for fields belonging to the section:

- `caption`: short eyebrow or caption.
- `title`: section heading.
- `text`: section description or supporting text.
- `image`: section image from the media library.
- `alt_image`: alternative text for the section image.
- `bg_color`: background color.
- `bg_image`: background image from the media library.
- `links`: section link with a label and URL.

The section settings panel also supports these fields:

- `style_css`: custom CSS class.
- `style_css_inline`: inline CSS declaration.
- `style_id`: custom element ID.
- `alignment`: `left`, `center`, or `right`.

When `contentType` is set, the admin also enables content filtering with:

- `category`: category filter.
- `sort_by`: `created_at` or `title`.
- `sort_order`: `asc` or `desc`.
- `limit`: maximum number of content items.
- `sort`: section ordering value.

Use the following names in `itemFields` for fields belonging to each item:

- `caption`, `title`, `text`: item heading and copy.
- `image`, `alt_image`: item image and alternative text.
- `video`: video URL.
- `map`: map coordinate text, for example `-6.208763, 106.845599`.
- `icon`: icon name or identifier.
- `form_inquiry`: checkbox that displays the inquiry form.
- `embed`: embed code or markup text.
- `bg_color`, `bg_image`: item background color and image.
- `links`: item links with label and URL fields.
- `style_css`, `style_css_inline`, `style_id`: item-level custom styling.

The admin renders these fields according to their purpose: `text` and `embed`
use a text area; `image` and `bg_image` use the media picker;
`bg_color` uses a color picker; `form_inquiry` uses a checkbox; and `links`
uses label/URL inputs. Other supported item fields use a text input. The item
editor provides up to two link rows, while the section settings link field
provides one link.

Example: configure a repeatable hero section:

```json
{
  "type": "hero",
  "label": "Hero",
  "description": "Large visual introduction with a call to action.",
  "sectionFields": [
    "style_id",
    "style_css",
    "style_css_inline",
    "bg_color",
    "bg_image",
    "alignment"
  ],
  "itemFields": ["caption", "title", "text", "image", "alt_image", "links"],
  "itemMode": "repeatable",
  "demo": {
    "section": { "bg_color": "#111827", "alignment": "center" },
    "items": [
      {
        "caption": "Deploy faster",
        "title": "Everything you need to deploy your app",
        "text": "Build, deploy, and scale your next project from one place.",
        "image": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=85",
        "alt_image": "Developer workspace",
        "links": [
          { "label": "Get started", "url": "/contact" },
          { "label": "Learn more", "url": "/about" }
        ]
      }
    ]
  }
}
```

The matching component is `src/components/sections/hero.astro`:

```astro
---
const { section } = Astro.props
const items = section.item ?? []
---

<section>
  {items.map((item) => <h1>{item.title}</h1>)}
  <div>
    {items.map((item) => <p>{item.text}</p>)}
  </div>
</section>
```

Page content then stores the section using the same `type` and item fields:

```json
[
  {
    "type": "hero",
    "style_id": "product",
    "alignment": "center",
    "item": [
      {
        "caption": "A calmer way to build together",
        "title": "A focused workspace for your next big idea.",
        "text": "Flowstack connects plans, decisions, and delivery in one clear place.",
        "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85",
        "alt_image": "Flowstack workspace dashboard",
        "links": [{ "label": "Get started", "url": "/contact" }]
      }
    ]
  }
]
```

`page-sections.astro` reads the page section JSON, finds `hero` in
`sections/registry.json`, loads `sections/hero.astro`, and passes the section
data to it. Standard Astro section files are discovered automatically.

### `layouts/`, `pages/`, and `middleware.ts`

- `layouts/public-layout.astro` is the shared HTML shell. It loads public CSS, site settings, the navbar, the page slot, and the footer.
- `pages/admin/[...path].astro` mounts the host's admin page and renders `AdminApp`.
- `pages/api/[...path].ts` forwards host requests to `apiApp.fetch(request)`.
- `pages/api/registry.ts` exposes the host registries to the admin UI.
- `pages/storage/[...path].ts` serves media through the host storage adapter.
- `pages/index.astro` loads the published `home` page and renders it with `PublicPage`.
- `pages/search.astro` provides the public search page.
- `pages/tag/[tag].astro` provides the public archive page for a tag.
- `pages/[type]/index.astro` renders a content-type archive or a regular page when the route is a page slug.
- `pages/[type]/[slug].astro` renders a content-type detail page.
- `middleware.ts` adds security headers, the content security policy, request-size protection, download handling, and no-cache headers for admin routes.

### `shared/`, `styles/`, and `env.d.ts`

- `shared/types/index.ts` exports shared pagination and public content types.
- `shared/types/posts.ts` defines post data, public post data, archive filters, and filter options.
- `styles/tokens.css` defines the public color and surface variables.
- `styles/public.css` imports Tailwind and the design tokens, then defines public base styles, typography defaults, selection colors, and focus states.
- `env.d.ts` provides Astro's environment type reference for the template.

To create a website template, work directly in these `src/` files. Add a new
page under `pages/`, a shared shell under `layouts/`, a reusable block under
`components/`, or a new section under `components/sections/`. Update
the matching registry when adding a content type or page section.

## Query public data

Use the public server APIs from `@zbeaver/beaver/server` inside Astro pages,
layouts, or components. These APIs return published data for the public
website; draft and private records are not returned.

Every query returns a result object. Check `result.success` before reading
`result.data`:

```astro
---
import { getPublishedPostByType } from "@zbeaver/beaver/server"

const result = getPublishedPostByType("page", "home")
if (!result.success) {
  return new Response("Page not found", { status: 404 })
}

const page = result.data
---

<h1>{page.title}</h1>
```

### Get one post or page

`getPublishedPostByType(type, slug)` returns one published record and its
author name. Use it for home pages, detail pages, and custom routes.

```astro
---
import { getPublishedPostByType, sanitizeHtml } from "@zbeaver/beaver/server"

const result = getPublishedPostByType("post", Astro.params.slug || "")
if (!result.success) return new Response("Post not found", { status: 404 })

const post = result.data
---

<article>
  <h1>{post.title}</h1>
  {post.featuredImage && <img src={post.featuredImage} alt={post.title} />}
  {post.description && <div set:html={sanitizeHtml(post.description)} />}
</article>
```

The returned detail record can include `title`, `slug`, `type`, `excerpt`,
`description`, `sections`, `customFieldValues`, `metaTitle`,
`metaDescription`, `featuredImage`, `gallery`, `publishedAt`, and
`authorName`.

### List content with pagination and filters

`listPublishedPostsByType(type, page, perPage, filters)` returns public post
cards and pagination metadata.

Pagination uses 10 items per page; larger `perPage` values are capped at 10.

```astro
---
import { listPublishedPostsByType } from "@zbeaver/beaver/server"

const requestedPage = Number(Astro.url.searchParams.get("page") || 1)
const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1
const result = listPublishedPostsByType("post", page, 10, {
  search: Astro.url.searchParams.get("search") || undefined,
  category: Astro.url.searchParams.get("category") || undefined,
  tag: Astro.url.searchParams.get("tag") || undefined,
  sortBy: "created_at",
  sortOrder: "desc",
})

const posts = result.success ? result.data.data : []
const pagination = result.success ? result.data.meta : null
---

{posts.map((post) => <article><h2>{post.title}</h2><p>{post.excerpt}</p></article>)}
{pagination && <p>Page {pagination.currentPage} of {pagination.lastPage}</p>}
```

Supported archive filters are `search`, `category`, `tag`, `customFields`,
`sortBy` (`title` or `created_at`), and `sortOrder` (`asc` or `desc`). The
list response contains `data` and `meta`; the public card shape intentionally
contains only fields safe for unauthenticated visitors.

### Search and tag queries

Use the dedicated helpers when the query is not tied to one content type:

```ts
import { listPublishedPostsByTag, searchPublishedPosts } from "@zbeaver/beaver/server"

const searchResult = searchPublishedPosts("launch", 1, 10)
const tagResult = listPublishedPostsByTag("product", 1, 10)

const searchPosts = searchResult.success ? searchResult.data.data : []
const tagPosts = tagResult.success ? tagResult.data.data : []
```

### Get archive filter options

`getPublishedArchiveFilterOptions(type)` returns the categories, tags, and
custom-field options available for a public archive.

```astro
---
import { getPublishedArchiveFilterOptions } from "@zbeaver/beaver/server"

const result = getPublishedArchiveFilterOptions("post")
const filterOptions = result.success
  ? result.data
  : { categories: [], tags: [], customFields: [] }
---

{filterOptions.categories.map((category) => <option value={category.slug}>{category.name}</option>)}
{filterOptions.tags.map((tag) => <a href={`/tag/${tag}`}>{tag}</a>)}
```

For custom fields, normalize the incoming query parameters with
`getPublicCustomFieldFiltersFromSearchParams` before passing them to the list
query:

```ts
import {
  getPublicCustomFieldFiltersFromSearchParams,
  listPublishedPostsByType,
} from "@zbeaver/beaver/server"

const customFields = getPublicCustomFieldFiltersFromSearchParams("post", Astro.url.searchParams)
const result = listPublishedPostsByType("post", 1, 10, { customFields })
```

### Get menus and site settings

Use `getMenuTree(type)` for navigation data and `getSiteSettings()` for the
public site title, description, logo, favicon, social links, and opening hours.

```astro
---
import { getMenuTree, getSiteSettings } from "@zbeaver/beaver/server"

const settings = getSiteSettings()
const navbarResult = getMenuTree("navbar")
const navbarItems = navbarResult.success ? navbarResult.data : []
---

<title>{settings.meta_title || settings.title}</title>
<nav>
  {navbarItems.map((item) => <a href={item.url}>{item.title}</a>)}
</nav>
```

Menu results are hierarchical: child links are available in
`item.children`. Use the menu group names registered in
`src/components/menus/registry.json`.

## Super Admin environment credentials

The Super Admin is authenticated directly from `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
and `ADMIN_NAME`; it is never created in the `users` table. Change these values
in the project's `.env` and restart the application. The password must be at
least 12 characters.

## Two-factor authentication

Database-backed admin users can enable TOTP-based two-factor authentication
from the admin profile page. Beaver uses otplib with the standard 6-digit,
30-second authenticator format. The setup screen provides an otpauth:// URI
for an authenticator app and a manual secret fallback.

The environment-managed Super Admin does not create a 2FA row in the
database. Generate its secret from the package CLI:

```bash
npx @zbeaver/beaver 2fa:setup
```

Copy the printed `ADMIN_2FA_ENABLED=true` and `ADMIN_2FA_SECRET` values into
the host application's `.env`, scan the printed otpauth URI with an
authenticator app, and restart Beaver. Use `--force` only when intentionally
rotating the Super Admin TOTP secret. Set `ADMIN_2FA_ENABLED=false` and
restart to disable it.

After 2FA is enabled, password login returns a short-lived challenge and the
admin session is created only after the authenticator code is verified. TOTP
secrets for database-backed users are encrypted at rest using SESSION_SECRET;
the Super Admin secret is managed by the environment. Keep environment
secrets private and rotate the JWT secrets when changing the Super Admin 2FA
configuration so existing sessions must sign in again. Enabling 2FA also
invalidates older sessions that were created without a verified 2FA claim.

## Static roles

Beaver uses four fixed roles. Roles cannot be created, edited, duplicated, or
deleted from the admin panel:

- `super-admin`: full system access.
- `admin`: manages users, settings, media, menus, and all content.
- `editor`: manages all content and publication, and can view and upload media.
- `author`: creates, edits, publishes, unpublishes, and deletes their own posts; can view and upload media; and cannot access pages.

Existing `viewer` or custom roles are migrated to `author`, the least
privileged replacement role available in the fixed role set.

## CLI commands

Run these commands from an existing Beaver project. Fresh commands are
destructive and require `--force`.

```bash
# Add missing session and admin JWT secrets to .env
npx @zbeaver/beaver key:generate

# Rotate all three secrets in .env
npx @zbeaver/beaver key:generate --force

# Apply pending migrations
npx @zbeaver/beaver migrate

# Drop Beaver tables, recreate the schema, and run all migrations
npx @zbeaver/beaver migrate:fresh --force

# Seed Beaver system data
npx @zbeaver/beaver seed

# Import a custom seed.json into Beaver
npx @zbeaver/beaver seed ./data/seed.json
npx @zbeaver/beaver seed --file ./data/seed.json

# Validate seed data without writing to the database
npx @zbeaver/beaver seed ./data/seed.json --dry-run

# Update existing records when their seed values change
npx @zbeaver/beaver seed ./data/seed.json --overwrite

# Reset the Beaver schema, run migrations, then import custom data
npx @zbeaver/beaver seed:fresh ./data/seed.json --force

# Seed system data explicitly
npx @zbeaver/beaver seed:system

# Generate environment-managed Super Admin TOTP configuration
npx @zbeaver/beaver 2fa:setup

# Run the long-lived scheduling worker (scheduled publishing + activity-log retention)
npx @zbeaver/beaver worker

# Run one scheduling cycle, useful for a process supervisor or external scheduler
npx @zbeaver/beaver worker:once

# Remove activity-log records older than BEAVER_ACTIVITY_LOG_RETENTION_DAYS
npx @zbeaver/beaver activity-log:purge

# Reset the Beaver schema and seed system data from scratch
npx @zbeaver/beaver seed:system:fresh --force
```

`key:generate` preserves existing non-empty secrets and only adds missing
values. Use `--force` when intentionally rotating all three values; existing
sessions and JWTs will then be invalidated.

`seed` has two modes:

- Without a file, it seeds the Beaver system configuration and validates the
  environment-managed Super Admin. Roles and permissions are defined in code,
  rather than stored as system rows.
- With a file supplied positionally or through `--file`, it imports the custom
  JSON seed data.

`seed:system` is an explicit alias for system seeding. The legacy `reset
superadmin` command now only validates the environment-managed credentials;
changing them requires an application restart.

The `worker` command is a separate long-running Node.js process. It publishes
posts whose scheduled time has arrived, writes the `publish_scheduled` activity
log, invalidates public-data caches, and applies activity-log retention. Run it
under the host's process supervisor (systemd, PM2, Docker, or an equivalent)
alongside the web process. `worker:once` performs one cycle and exits.

`seed` accepts a host-owned seed file with the top-level shape
`settings`, `categories`, `posts`, `pages`, and `menus`. Content category
relationships use `categorySlugs`. Menu relationships can use `parentUrl`.
Existing records are skipped by default; `--overwrite` updates records matched
by category slug, content slug, or menu type and URL. If no database user exists,
imported content is attributed to the environment-managed Super Admin identity.
Data imports run in a database transaction and report created, updated, and
skipped records.

## License

[MIT](./LICENSE) © 2026 beaver
