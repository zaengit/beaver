# CMS web contract

## Scope

Allowed write scope: `src/components/web/**`.

`src/server/**` is read-only. It owns Admin UI, API, persistence, validation, and business logic.

## Section contract

- Registry: `src/components/web/sections/registry.json`.
- A section entry uses `type`, `label`, `description`, `sectionFields`, `itemFields`, `itemMode`, and optional `contentType`. Do not add a `demo` content payload: examples belong in a database seed outside `src` when explicitly requested.
- `src/components/web/page-sections.astro` loads `.astro` renderers by filename. The filename and registry `type` must match exactly.
- React sections require an explicit static import and hydration only when browser interactivity is necessary.
- Existing section properties include `caption`, `title`, `text`, `image`, `alt_image`, `bg_color`, `bg_image`, `style_css`, `style_css_inline`, `style_id`, `alignment`, `category`, `sort_by`, `sort_order`, `limit`, `links`, and `item`.
- Existing item properties include `caption`, `title`, `text`, `image`, `alt_image`, `bg_color`, `bg_image`, `links`, `video`, `map`, `question`, `answer`, `icon`, and `form_inquiry`.
- Use only the field keys already supported by the existing contract. Do not invent fields requiring changes outside `src/components/web`.
- `itemMode: "repeatable"` is for editable item lists. `itemMode: "none"` with `contentType` is for a published-content collection.
- For hero, banner, and slide, content belongs to items. The parent section is for presentation settings only.

## Content-template contract

- Registry: `src/components/web/content-type-templates/registry.json`.
- Archive renderers live in `content-type-templates/archive/`; detail renderers live in `content-type-templates/detail/`.
- Renderer filenames must match the selected registry template id.
- `component-resolver.ts` dispatches from registry id; retain that mechanism.
- `fieldSlots` describes editable detail fields. Do not create a separate mapping or dynamic field system.

## Data flow

Admin CMS stores page sections and content. Public components render that existing data:

`Admin CMS -> stored page/content -> registry-selected renderer -> public web`

Components must tolerate absent optional data and must not write data, call Admin-only endpoints, or alter server behavior.

## No source-data fallback

Public components must not substitute missing CMS records with hardcoded content, navigation, pricing, images, or marketing copy. The public route and layout render the database records they receive; absent optional values are omitted. A requested sample website is represented by idempotent seed data, not by fallback data in `src`.
