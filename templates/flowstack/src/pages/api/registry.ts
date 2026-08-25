import {
  contentTypeRegistry,
  menuGroupRegistry,
  sectionRegistry,
} from "@/shared/registry"

export const prerender = false

export const GET = () => Response.json({
  contentTypeRegistry,
  sectionRegistry,
  menuGroupRegistry,
})
