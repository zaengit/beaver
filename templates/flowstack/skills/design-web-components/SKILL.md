---
name: design-web-components
description: Create or revise database-driven public CMS web designs in src/components/web, including reusable page sections, archive templates, and detail templates. Use when asked to build, redesign, style, or add a website section, public page component, content archive, or content detail layout in this CMS. Keep src/server read-only.
---

# Web Component Design

Create public-facing CMS designs that remain editable through the existing Admin CMS contract. Work only in `src/components/web/**` unless the user explicitly changes that boundary.

## Database-only content

- Public components render data supplied by the CMS. Do not embed product names, marketing copy, plan data, testimonials, navigation items, or example content in `src`.
- Do not add fallback pages, fallback menu/footer items, or static data arrays when a page, section, setting, or menu record is absent. Render only the stored data; route-level missing-record behavior stays with the existing public route.
- Component-owned labels needed purely for interaction or accessibility are allowed, but all visitor-facing editorial and commercial content must come from supported CMS fields.
- Do not put example content in `sections/registry.json`. When the user requests demo content, create or revise an idempotent database seed outside `src` only if that additional scope is explicitly authorized.

## Non-negotiable boundary

- Never create, edit, move, or delete files in `src/server/**`.
- Never change API routes, database schemas, validation, authentication, or Admin React UI.
- Read server code only to understand an existing contract.
- Use only field keys already supported by the Admin editor and validation. If a requested design needs a new field or behavior outside that contract, stop and explain the required server-side change; do not implement it.

## Inspect before designing

1. Read the relevant registry and the renderer closest to the request.
2. Determine the target:
   - **section**: `src/components/web/sections/<type>.astro` or an existing hydrated `.tsx` section;
   - **archive template**: `src/components/web/content-type-templates/archive/<template-id>.astro`;
   - **detail template**: `src/components/web/content-type-templates/detail/<template-id>.astro`.
3. Read `references/cms-web-contract.md` before adding a new type, template, or data field.
4. Preserve unrelated work. For a design-only request, do not change data or public routing behavior.

## Build a section

1. Give the section a stable hyphen-case `type`.
2. Add its metadata to `sections/registry.json`: label, description, supported `sectionFields`, supported `itemFields`, and `itemMode`.
3. Create `sections/<type>.astro`; its filename must exactly equal `type`.
4. Give each section its own semantic markup and responsive layout. Do not route unrelated section designs through a universal card/grid shell.
5. Prefer Tailwind utilities, the existing `ResponsiveImage`, and `getSectionStyle`. Keep images lazy-loaded unless above-the-fold behavior requires otherwise.
6. For a visual item-first section such as hero, banner, or slide, place caption, title, text, image, and links on `item`, not on the parent section.

## Build a content template

1. Add or use an id in `content-type-templates/registry.json` with the correct `kind`.
2. Create a same-named renderer under the matching `archive/` or `detail/` directory.
3. Use the registry `fieldSlots` as the only schema for editable detail fields.
4. Keep each content type/template's layout independent. Do not hard-code a content-type-specific route or duplicate the resolver.

## Design quality

- Make small screens the base layout; add responsive enhancements deliberately.
- Use semantic landmarks, heading hierarchy, visible focus states, sufficient contrast, and meaningful image alt text.
- Avoid fixed heights that clip editorial content and avoid decorative images carrying essential text.
- Keep styling local to the component; do not introduce a global visual system for one request.
- Respect existing public component conventions and preserve the current content contract.
- Omit optional elements with no stored value; never replace them with invented copy, links, images, or records.

## Verify

1. Check that the registry entry and renderer filename match exactly.
2. Check that every field read by the renderer is an existing supported field and belongs to section or item correctly.
3. Run the most focused available check, then `npm run build` when practical.
4. Report files changed and distinguish verified checks from anything not run.
