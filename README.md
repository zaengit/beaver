# @zbeaver/beaver

CMS admin panel, API, and middleware for Astro SSR projects.

[![npm version](https://img.shields.io/npm/v/@zbeaver/beaver)](https://www.npmjs.com/package/@zbeaver/beaver)
[![license](https://img.shields.io/npm/l/@zbeaver/beaver)](./LICENSE)

![Beaver admin panel](./screenshot.png)

## Features

### Content management

- Dashboard for monitoring the editorial workspace.
- Pages and posts with draft/published status, publication timestamps, slugs, excerpts, descriptions, tags, categories, featured images, galleries, and SEO metadata.
- Registry-based custom content types with custom fields and archive/detail templates.
- Rich-text editing with HTML sanitization before content is stored or rendered.
- Duplicate, bulk delete, bulk publish, and bulk unpublish actions.
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

- Interactive `npm create @zbeaver/beaver` wizard for project creation.
- Automatic dependency installation, configuration generation, database migration, base seed, admin creation, and template demo content.
- Public server APIs for querying posts, pages, tags, filters, menus, and site settings.
- SQLite, MySQL, and PostgreSQL databases with Drizzle migrations.

## Advantages

- **Fast onboarding:** one interactive command creates a working Astro CMS project and shows the website and admin URLs.
- **Astro-native:** server rendering, file-based routes, React islands, and Tailwind fit naturally into an Astro project.
- **Simple deployment:** SQLite keeps local development and small deployments easy to operate, while the Node standalone adapter supports server hosting.
- **Flexible without hard-coded pages:** registries let a project add content types, sections, menu groups, and templates without modifying the Beaver admin core.

Follow this guide in order: create the project, configure the root files, build the website in `src/`, query public data, then manage the Super Admin account.

## Create a project

Create a new Beaver project with the interactive terminal wizard:

```bash
npm create @zbeaver/beaver
```

The wizard asks for the project name, starter template, package manager, and
Super Admin details. It then creates the Astro project, installs dependencies,
generates the configuration, runs the database migration, seeds Beaver and the
selected template, and prints the website and admin panel URLs.

## Project root files

The initializer creates these files at the project root:

```text
project/
├── .env
├── astro.config.mjs
└── src/
```

### `.env`

`.env` contains the server-side database, authentication, upload, email, and
cache configuration. The initializer fills the admin credentials and secrets
when the file is created.

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=./db/sqlite.db

# For MySQL/PostgreSQL, use DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME,
# and DB_PASSWORD in addition to DB_CONNECTION.

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
ADMIN_NAME=Super Admin
SESSION_SECRET=generated-secret
ADMIN_JWT_ACCESS_SECRET=generated-secret
ADMIN_JWT_REFRESH_SECRET=generated-secret

ADMIN_PATH=admin
STORAGE_TYPE=local
STORAGE_PATH=./public/storage
# Legacy fallback for existing projects that do not set STORAGE_PATH.
UPLOAD_DIR=./public

# AWS S3 storage, when STORAGE_TYPE=s3.
# S3_REGION=us-east-1
# S3_BUCKET=my-beaver-media
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# S3_FORCE_PATH_STYLE=false
TRUST_PROXY=false

PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
CONTACT_TURNSTILE_REQUIRED=false

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

PUBLIC_CACHE_DIR=
PUBLIC_CACHE_TTL_SECONDS=
```

- `DB_CONNECTION` selects `sqlite`, `mysql`, or `pgsql`.
- For SQLite, `DB_DATABASE` is the database file path; no host, port, username, or password is required.
- For MySQL and PostgreSQL, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` configure the server connection.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` define the initial Super Admin account.
- `SESSION_SECRET`, `ADMIN_JWT_ACCESS_SECRET`, and `ADMIN_JWT_REFRESH_SECRET` protect sessions and admin tokens.
- `ADMIN_PATH` changes the admin URL segment, such as `/control-panel`.
- `STORAGE_TYPE` selects `local` or `s3`; it defaults to `local`.
- `STORAGE_PATH` sets the filesystem directory used to save and read media files. Relative paths are resolved from the consuming project root; absolute paths are supported for persistent volumes outside `public`.
- `UPLOAD_DIR` is the legacy fallback. When `STORAGE_PATH` is not set, media is stored under `<UPLOAD_DIR>/storage`.
- `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY` configure AWS S3. `S3_FORCE_PATH_STYLE=false` (the default) uses AWS's virtual-hosted bucket URLs.
- `TRUST_PROXY` should only be enabled when a trusted proxy overwrites forwarded-IP headers.
- Turnstile variables protect the public inquiry form in production-like environments.
- `SMTP_*` variables enable optional email delivery for inquiries.
- `PUBLIC_CACHE_*` variables enable optional filesystem caching for public data.

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

`astro.config.mjs` configures the Astro application and connects the website to
Beaver. The generated configuration:

- runs Astro in server mode with the standalone Node adapter;
- enables React and Tailwind through their Astro/Vite integrations;
- reads `ADMIN_PATH` and validates it as one URL segment;
- loads the content type, section, and menu registries;
- passes those registries to the Beaver integration;
- enables HTML compression and hover prefetching;
- ignores SQLite temporary files in the development watcher;
- applies Astro origin checking and the configured `ASTRO_HOST` value.

The registry paths can be customized through environment variables:

```dotenv
CONTENT_TYPE_REGISTRY_PATH=src/components/web/content-type-templates/registry.json
SECTION_REGISTRY_PATH=src/components/web/sections/registry.json
MENU_GROUP_REGISTRY_PATH=src/components/web/menus/registry.json
ASTRO_HOST=localhost
```

The default registry paths point to the files inside `src/`. Change them only
when the project uses a different registry location.

## Create a website template

A website template is created directly inside the project's `src/` directory.
The website source follows this structure. `hero.astro` is the section example:

```text
src/
├── components/
│   └── web/
│       ├── content-type-archive.astro
│       ├── content-type-custom-fields.astro
│       ├── content-type-detail.astro
│       ├── content-type-templates/
│       │   ├── archive/
│       │   │   ├── archive-filters.astro
│       │   │   ├── archive-pagination.astro
│       │   │   ├── default.astro
│       │   │   └── post-grid.astro
│       │   ├── detail/
│       │   │   ├── default.astro
│       │   │   └── post-reader.astro
│       │   ├── component-resolver.ts
│       │   ├── registry.json
│       │   └── types.ts
│       ├── footer.tsx
│       ├── menus/
│       │   └── registry.json
│       ├── navbar.tsx
│       ├── page-sections.astro
│       ├── public-page.astro
│       ├── responsive-image.astro
│       ├── inquiry-form.tsx
│       ├── safe-url.ts
│       ├── sections/
│       │   └── hero.astro
│       └── tag-links.astro
├── env.d.ts
├── layouts/
│   └── PublicLayout.astro
├── middleware.ts
├── pages/
│   ├── [type]/
│   │   ├── [slug].astro
│   │   └── index.astro
│   ├── index.astro
│   ├── search.astro
│   └── tag/
│       └── [tag].astro
├── shared/
│   └── types/
│       ├── index.ts
│       └── posts.ts
└── styles/
    ├── public.css
    └── tokens.css
```

### `components/web/`

This directory contains the public website components.

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

### `components/web/content-type-templates/`

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
src/components/web/content-type-templates/archive/case-study-grid.astro
src/components/web/content-type-templates/detail/case-study-reader.astro
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

### `components/web/menus/`

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
`layouts/PublicLayout.astro`.

### `components/web/sections/`

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

The matching component is `src/components/web/sections/hero.astro`:

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

- `layouts/PublicLayout.astro` is the shared HTML shell. It loads public CSS, site settings, the navbar, the page slot, and the footer.
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
`components/web/`, or a new section under `components/web/sections/`. Update
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

```astro
---
import { listPublishedPostsByType } from "@zbeaver/beaver/server"

const requestedPage = Number(Astro.url.searchParams.get("page") || 1)
const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1
const result = listPublishedPostsByType("post", page, 12, {
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

const searchResult = searchPublishedPosts("launch", 1, 12)
const tagResult = listPublishedPostsByTag("product", 1, 12)

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
const result = listPublishedPostsByType("post", 1, 12, { customFields })
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
`src/components/web/menus/registry.json`.

## Reset the Super Admin password

Run this from an existing Beaver project:

```bash
npx @zbeaver/beaver reset superadmin
```

The command reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the project's `.env`,
updates the matching Super Admin account, and revokes its active sessions. The
password must be at least 12 characters.

## CLI commands

Run these commands from an existing Beaver project. Fresh commands are
destructive and require `--force`.

```bash
# Apply pending migrations
npx @zbeaver/beaver migrate

# Drop Beaver tables, recreate the schema, and run all migrations
npx @zbeaver/beaver migrate:fresh --force

# Import a custom seed.json into Beaver
npx @zbeaver/beaver migrate:data ./data/seed.json

# Import a packaged template seed file
npx @zbeaver/beaver migrate:data --template flowstack

# Validate seed data without writing to the database
npx @zbeaver/beaver migrate:data ./data/seed.json --dry-run

# Update existing records when their seed values change
npx @zbeaver/beaver migrate:data ./data/seed.json --overwrite

# Reset the Beaver schema, seed the system, then import custom data
npx @zbeaver/beaver migrate:data:fresh ./data/seed.json --force

# Seed the system roles, permissions, and Super Admin
npx @zbeaver/beaver seed
npx @zbeaver/beaver seed:system

# Seed system data and the demo template in one command
npx @zbeaver/beaver seed flowstack

# Reset the Beaver schema and seed system data from scratch
npx @zbeaver/beaver seed:fresh --force
npx @zbeaver/beaver seed:system:fresh --force

# Seed demo data into an already migrated and system-seeded database
npx @zbeaver/beaver seed:template flowstack

# Reset the schema, seed system data, then seed the demo template
npx @zbeaver/beaver seed:template:fresh flowstack --force

# Generate project configuration and install dependencies
npx @zbeaver/beaver config

# Copy a starter template into the current project
npx @zbeaver/beaver example flowstack
```

`seed:system` and `seed:system:fresh` are aliases for the corresponding system
seed commands. `seed flowstack` remains supported as a shorthand for system
seed followed by the `flowstack` demo template seed. The Super Admin password
can be reset with `npx @zbeaver/beaver reset superadmin`.

`migrate:data` accepts the same top-level seed data shape used by the packaged
Flowstack file: `settings`, `categories`, `posts`, `pages`, and `menus`. Content
category relationships use `categorySlugs`. Menu relationships can use
`parentUrl`. Existing records are skipped by default; `--overwrite` updates
records matched by category slug, content slug, or menu type and URL. The
command requires the base Beaver seed to have created at least one user, except
for `migrate:data:fresh`, which performs the schema migration and system seed
first. Data imports run in a database transaction and report created, updated,
and skipped records.

## License

[MIT](./LICENSE) © 2026 beaver
