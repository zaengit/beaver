# CMS web contract

This reference describes the public website contract documented by the Beaver
README. The README and the live registries are authoritative if a generated
project has customized paths or a newer field set.

## Scope

The default public write scope is the consuming project's `src/` tree:

- `src/pages/**` for public routes;
- `src/layouts/**` for the shared HTML shell;
- `src/components/web/**` for public components, sections, menus, and
  content-type templates;
- `src/shared/**` and `src/styles/**` for public types and styles;
- the matching JSON registries under `src/components/web/**`.

Keep `src/server/**` and Beaver's package server/API implementation read-only.
Do not change database schemas or migrations, persistence, validation,
authentication, or the Admin React UI as part of a public design. Do not query
SQLite or Admin-only endpoints from public routes or components.

The registry defaults are:

- `src/components/web/sections/registry.json`;
- `src/components/web/content-type-templates/registry.json`;
- `src/components/web/menus/registry.json`.

`SECTION_REGISTRY_PATH`, `CONTENT_TYPE_REGISTRY_PATH`, and
`MENU_GROUP_REGISTRY_PATH` may override those paths through `astro.config.mjs`.

## Section contract

- `src/components/web/page-sections.astro` parses stored page section JSON,
  resolves a registry entry by `type`, and loads the matching renderer.
- A section entry uses `type`, `label`, `description`, `sectionFields`,
  `itemFields`, and `itemMode`; it may also use `contentType`, `columns`, and
  `demo`.
- `demo` contains example values for the Admin editor preview only. It must
  never be used as a public rendering fallback. Visitor demo data belongs in
  an idempotent seed outside `src/` and requires explicit authorization.
- The section `type` and `sections/<type>.astro` filename must match exactly.
  React sections require an explicit static import and browser hydration only
  when interaction is necessary.
- Section-level fields supported by the Admin editor are `caption`, `title`,
  `text`, `image`, `alt_image`, `bg_color`, `bg_image`, and `links`.
- Section settings supported by the editor are `style_css`,
  `style_css_inline`, `style_id`, and `alignment`.
- A section with `contentType` may use `category`, `sort_by`, `sort_order`,
  `limit`, and `sort` for published-content filtering or ordering where the
  configured renderer supports them.
- Item-level fields supported by the editor are `caption`, `title`, `text`,
  `image`, `alt_image`, `video`, `map`, `icon`, `form_inquiry`, `embed`,
  `bg_color`, `bg_image`, `links`, `style_css`, `style_css_inline`, and
  `style_id`.
- Use only keys already supported by the current registry, renderer, and Admin
  editor. A new field requiring Beaver-side changes is outside this contract.
- `itemMode: "none"` means no editor-managed item list; with `contentType` it
  is used for a published-content collection. `single` is one item and
  `repeatable` is an editable item list.
- For item-first visual sections such as hero, banner, and slide, caption,
  title, text, image, alt text, and links belong to items. The parent section
  carries presentation settings unless its registry explicitly supports
  section content.

## Content-type template contract

- Registry: `src/components/web/content-type-templates/registry.json`.
- `contentTypes` maps a content type to its `archiveTemplate` and
  `detailTemplate`; the public routes use those IDs.
- Archive renderers live in
  `content-type-templates/archive/<template-id>.astro`; detail renderers live
  in `content-type-templates/detail/<template-id>.astro`.
- Renderer filenames must match their registry template ID exactly.
- `component-resolver.ts` dispatches from the registry ID; retain that dynamic
  mechanism and do not hard-code content-type routes.
- `fieldSlots` is the only schema for editable detail fields. Values are stored
  in `customFieldValues`; do not create a separate mapping or dynamic field
  system.
- Supported `fieldSlots.type` values are `text`, `rich-text`, `number`,
  `boolean`, `date`, and `image`. `select` does not render as a dropdown in the
  current Admin editor.
- `sectionsEnabled` controls whether the detail page may render stored page
  sections.

## Menu contract

- Registry: `src/components/web/menus/registry.json`.
- The menu registry defines group IDs and metadata, not the actual links. The
  current menu API supports `navbar`, `footer`, and `sidebar` groups.
- Menu links are stored in Beaver and loaded with `getMenuTree(type)`. Preserve
  nested `item.children` when rendering them.
- Layouts and components must not invent fallback navigation or footer links.

## Public data flow

Admin CMS stores pages, posts, sections, custom fields, menu links, and site
settings. Public Astro code reads published data through
`@zbeaver/beaver/server`:

`Admin CMS -> stored published data -> public query or route -> registry-selected renderer -> public web`

Use the matching public helper, including `getPublishedPostByType`,
`listPublishedPostsByType`, `searchPublishedPosts`,
`listPublishedPostsByTag`, `getPublishedArchiveFilterOptions`,
`getPublicCustomFieldFiltersFromSearchParams`, `getMenuTree`, and
`getSiteSettings`. Every result object must be checked with `result.success`
before reading `result.data`. Public queries do not return draft or private
records.

Components and routes must tolerate absent optional values, omit them, and must
not write data, call Admin-only endpoints, or alter server behavior. Sanitize
stored rich HTML with Beaver's `sanitizeHtml`; use the existing safe URL and
responsive-image helpers for media and links.

## No source-data fallback

Public code must not substitute missing CMS records with hardcoded pages,
navigation, pricing, images, settings, or marketing copy. The public route,
layout, and renderer use the stored records they receive; absent optional
values are omitted. A requested sample website is represented by explicitly
authorized idempotent seed data outside `src/`, not by fallback data in public
components.
