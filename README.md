# zadm

CMS admin, API, and middleware for Astro SSR projects.

The published artifact contains `dist/**` only: compiled JavaScript, declarations, and the minimal Astro/CSS/JSON runtime assets. Source TypeScript and tests are not published.

## Build and publish

```bash
npm run build --workspace zadm
npm pack --workspace zadm
```

This outputs `zaenpm-zadm-<version>.tgz` in the package directory. The generated tarball is the installable artifact, and can be installed locally:

```bash
npm install ./path/to/zaenpm-zadm-0.1.0.tgz
```

Do not publish before the package build succeeds.

## Install

```bash
npx zadm install
```

This installs Astro, `@zaenpm/zadm`, and its required integrations, generates
missing config/example files, migrates the database, and seeds the initial
Super Admin. For a new `.env`, the installer generates a unique local admin
email, a strong random password, and the session/JWT secrets, displays the
admin credentials once, then completes the seed in the same command. Save the
password immediately; existing `.env` files are never changed.

The CMS owns its own React UI, Tailwind plugin, and default registries. A host does not need to create Vite aliases or import the CMS stylesheet.

## Astro configuration

```js
import { defineConfig } from "astro/config"
import node from "@astrojs/node"
import react from "@astrojs/react"
import zadm from "@zaenpm/zadm"

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react(), zadm()],
})
```

This mounts the admin at `/admin`, API at `/api`, and keeps implementation routes private under `/__cms/*`.

## Optional registries

The defaults provide built-in posts/pages, no page sections, and navbar/footer/sidebar menu groups. Pass JSON files only when the host needs custom content types, section templates, or menu groups:

```js
zadm({
  adminPath: "control-panel",
  contentTypeRegistry: new URL("./src/cms/content-types.json", import.meta.url),
  sectionRegistry: new URL("./src/cms/sections.json", import.meta.url),
  menuGroupRegistry: new URL("./src/cms/menu-groups.json", import.meta.url),
})
```

`adminPath` must be one URL segment. If omitted, it uses `ADMIN_PATH` or `admin`.

## Required environment

```dotenv
DATABASE_URL=./db/sqlite.db
SESSION_SECRET=<generated-on-first-install>
ADMIN_JWT_ACCESS_SECRET=<generated-on-first-install>
ADMIN_JWT_REFRESH_SECRET=<generated-on-first-install>
ADMIN_EMAIL=admin-<random>@cms.local
ADMIN_PASSWORD=cms_<random>
ADMIN_NAME=Administrator
UPLOAD_DIR=./public
# Set this only behind a proxy that overwrites forwarded-IP headers.
TRUST_PROXY=false
# Obtain both values from Cloudflare Turnstile. The site key is safe for client use.
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
CONTACT_TURNSTILE_REQUIRED=false
```

Media files are stored below `storage/` in `UPLOAD_DIR`, so the default path is
`public/storage/` and URLs are `/storage/<file>`. On
cPanel, set `UPLOAD_DIR` to the domain document root, for example
`/home/CPANEL_USER/public_html`.

`POST /api/contact` is same-origin only, limited to five requests per 15 minutes
per client address, and accepts an optional `turnstileToken`. Set
`CONTACT_TURNSTILE_REQUIRED=true` and `TURNSTILE_SECRET_KEY` in production to
require server-side Turnstile validation. When `TRUST_PROXY=true`, ensure the
proxy overwrites `CF-Connecting-IP` or `X-Forwarded-For`.

The host is responsible for applying the exported Drizzle schema and running the seed module as part of its own deployment workflow.

## CLI commands

The package provides the following CLI commands for consuming projects:

```bash
npm install github:zaengit/zadm
npx zadm config    # Generate .env and astro.config.mjs
npx zadm example   # Copy example web components, pages, and skills
npx zadm migrate   # Apply SQLite schema
npx zadm seed      # Create default roles, permissions, and admin user
npx --no-install zadm reset superadmin # Reset super-admin password from .env
npx zadm install   # Run config, example, dependency install, migrate, and seed
```

### `config`

Generates `.env` and `astro.config.mjs` from bundled templates. Skips existing files to avoid overwriting customizations.

### `example`

Copies example files into the consuming project:
- `src/components/web/` — all web components (sections, templates, navbar, footer)
- `src/pages/` — `index.astro`, `search.astro`, `tag/[tag].astro`, `system/*`, `[type]/*`
- `skills/design-web-components/` — skill definition and references

Existing files are never overwritten.

### `migrate` / `seed`

`migrate` applies the SQLite schema bundled with the package and records it in Drizzle's migration table. Run it before starting the application on each deployment. `seed` creates the default roles, permissions, and administrator from the required environment variables.

### `reset superadmin`

Loads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the current project's `.env`,
updates the matching `super-admin` user, and revokes that user's active refresh
sessions. The password must be at least 12 characters. It never creates a user;
run `seed` first if the super-admin account does not exist.
