---
name: design-web-components
description: Create or revise database-driven public website templates in a Beaver Astro SSR project, including pages, layouts, reusable web components, sections, menus, archive templates, and detail templates. Use when asked to build, redesign, style, or extend the public site. Keep Beaver's server, API, database, and Admin UI contracts unchanged.
---

# Beaver Web Design

Build public-facing website templates that remain editable through Beaver's
Admin CMS. The public data flow is:

`Admin CMS -> stored published data -> public query or route -> registry-selected renderer -> HTML`

Use Astro SSR with the existing React islands and Tailwind setup. Work in the
consuming project's public `src/` files: `pages/`, `layouts/`,
`components/web/`, `shared/`, and `styles/`, plus a matching registry when the
feature needs one. Keep changes limited to the requested public website
surface.

## Boundaries

- Never modify Beaver's server/API implementation, database schema or
  migrations, validation, authentication, or Admin React UI.
- Treat any `src/server/**` code as read-only. Read package server code only to
  confirm an existing public contract.
- Do not query SQLite or Admin-only endpoints directly from public pages or
  components.
- Do not change `astro.config.mjs`, middleware, `.env`, or seed data unless the
  request requires that specific change.
- If a design needs a new CMS field, query, route behavior, or persistence
  rule, explain the required Beaver-side change and stop instead of inventing a
  parallel contract.

## Render stored content only

- Public components must render data supplied by Beaver. Do not hard-code
  product names, editorial copy, plans, testimonials, navigation links,
  settings, images, or fallback records.
- Omit optional elements when their stored value is absent. Do not replace
  missing pages, sections, menus, settings, or media with sample content.
- `demo` values in `sections/registry.json` are allowed as Admin editor preview
  values only. Never use them as a public rendering fallback.
- When demo visitor content is requested, put it in the idempotent template
  seed outside `src/` only when that additional scope is explicitly
  authorized.
- Component-owned labels are allowed only when they are needed for
  interaction or accessibility; visitor-facing editorial and commercial copy
  must come from supported CMS fields.

## Inspect before designing

1. Read the project README and the relevant route, layout, or renderer.
2. Confirm the configured registry paths in `astro.config.mjs`. The default
   paths are:
   - `src/components/web/sections/registry.json`
   - `src/components/web/content-type-templates/registry.json`
   - `src/components/web/menus/registry.json`
   They may be overridden by `SECTION_REGISTRY_PATH`,
   `CONTENT_TYPE_REGISTRY_PATH`, and `MENU_GROUP_REGISTRY_PATH`.
3. Read the registry and the closest existing renderer before changing it.
4. Read [references/cms-web-contract.md](references/cms-web-contract.md) when
   adding a section, content type, template, or editable field. If it differs
   from the project README or live registry, follow the current project
   contract and preserve the narrower existing behavior.
5. Identify the correct target:
   - page: `src/pages/**`;
   - shared shell: `src/layouts/**`;
   - section or public component: `src/components/web/**`;
   - archive template:
     `src/components/web/content-type-templates/archive/<template-id>.astro`;
   - detail template:
     `src/components/web/content-type-templates/detail/<template-id>.astro`.

## Use Beaver public data APIs

Import public helpers from `@zbeaver/beaver/server`. They return published data
for unauthenticated visitors; check `result.success` before reading
`result.data`. Use the helper that matches the need:

- `getPublishedPostByType(type, slug)` for one page or content detail;
- `listPublishedPostsByType(type, page, perPage, filters)` for archives and
  content collections;
- `searchPublishedPosts()` and `listPublishedPostsByTag()` for global search
  and tag routes;
- `getPublishedArchiveFilterOptions(type)` for archive filter controls;
- `getPublicCustomFieldFiltersFromSearchParams()` before passing public custom
  field filters to an archive query;
- `getMenuTree(type)` for hierarchical menu data;
- `getSiteSettings()` for site identity, SEO, media, social links, and opening
  hours.

Use `item.children` for nested menu links. The menu registry defines group
types and metadata; it does not contain the actual links. Keep navigation,
footer, and site settings data-driven. Sanitize stored rich HTML with Beaver's
`sanitizeHtml` before rendering it as HTML, and use the existing safe URL and
responsive-image helpers for public media and links.

## Build sections

1. Give the section a stable hyphen-case `type`.
2. Add or update its entry in the configured `sections/registry.json` with
   `label`, `description`, `sectionFields`, `itemFields`, and `itemMode`.
   Preserve optional `contentType`, `columns`, and editor-only `demo` data when
   they are part of the design.
3. Create `sections/<type>.astro`; the filename and registry `type` must match
   exactly. A React section needs an explicit static import and browser
   hydration only when interaction requires it.
4. Keep the section's semantic markup and responsive layout independent. Do
   not route unrelated designs through a universal card or grid shell.
5. Use the existing `ResponsiveImage`, safe URL helpers, and `getSectionStyle`
   where applicable. Keep images lazy-loaded unless they are genuinely above
   the fold. Do not render arbitrary unsafe inline CSS or URLs.
6. For item-first visual sections such as hero, banner, and slide, store and
   read caption, title, text, image, alt text, and links on `item`. Keep the
   parent section for presentation settings unless its registry explicitly
   supports section content.

The section editor supports these existing keys. Use only keys present in the
current registry and renderer:

- section content: `caption`, `title`, `text`, `image`, `alt_image`,
  `bg_color`, `bg_image`, and `links`;
- section settings: `style_css`, `style_css_inline`, `style_id`, and
  `alignment`;
- published-content filters: `category`, `sort_by`, `sort_order`, `limit`,
  and `sort` where the configured section supports them;
- item content: `caption`, `title`, `text`, `image`, `alt_image`, `video`,
  `map`, `icon`, `form_inquiry`, `embed`, `bg_color`, `bg_image`, `links`,
  `style_css`, `style_css_inline`, and `style_id`.

`itemMode` is `none`, `single`, or `repeatable`. A `none` section with
`contentType` is a published-content collection; a repeatable item list is
editor-managed section data. For a section that needs a field outside this
list, stop and request the CMS contract change.

## Build content-type templates

1. Add or use a matching entry in the configured
   `content-type-templates/registry.json`.
2. Keep archive and detail template IDs unique within their kind and make each
   renderer filename match its registry `id` exactly.
3. Use `archiveTemplate` for the archive renderer and `detailTemplate` for
   the detail renderer. Preserve `component-resolver.ts` and the existing
   dynamic routes; do not hard-code a content-type route or duplicate the
   resolver.
4. Treat `fieldSlots` as the only schema for editable detail fields. Values
   are stored in `customFieldValues` and must be read using the registered
   keys. Supported field types are `text`, `rich-text`, `number`, `boolean`,
   `date`, and `image`; `select` is not a dropdown in the current editor.
5. Respect `sectionsEnabled` when a detail template can render page sections.
   Use the public post shape, archive filters, pagination metadata, and
   existing detail helpers instead of reaching into persistence.

## Design quality

- Make small screens the base layout and add responsive enhancements
  deliberately.
- Use semantic landmarks, a valid heading hierarchy, visible focus states,
  sufficient contrast, and meaningful image alt text.
- Do not use fixed heights that clip editorial content or decorative images that
  carry essential text.
- Keep one-off styling local to the component; use the existing public styles
  and design tokens when a shared change is actually required.
- Hydrate React only for browser interaction, such as the inquiry form or
  another explicitly interactive island.
- Preserve route behavior, registry contracts, optional data handling, and
  unrelated user work.

## Verify

1. Confirm every registry `type`/`id` matches its renderer filename and the
   selected `kind`.
2. Confirm every field read by a renderer is supported and belongs to the
   correct section, item, or `fieldSlots` schema.
3. Validate the changed JSON and run the most focused available project check.
4. Run `npm run build` from the consuming Astro project when practical.
5. Report the files changed and distinguish completed checks from checks that
   were not run.
