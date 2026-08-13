import { db } from "./index"
import { users } from "./schema"
import { findPostBySlugRecord } from "zadm/app/repositories/posts"
import { listMenus } from "zadm/app/repositories/menus"
import { createMenu } from "zadm/app/services/menus"
import { createPost, updatePost } from "zadm/app/services/posts"

const image = {
  studio: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=85",
  editorial: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
  product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
  portfolio: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85",
} as const

const homeSections = [
  {
    id: "demo-hero",
    type: "hero",
    caption: null,
    title: null,
    text: null,
    image: null,
    alt_image: null,
    bg_color: "#0f172a",
    bg_image: null,
    style_css: null,
    style_css_inline: null,
    style_id: "hero",
    alignment: "center",
    limit: null,
    sort: 0,
    sort_by: null,
    category: null,
    links: null,
    item: [{ caption: "Independent digital studio", title: "We turn ambitious ideas into digital experiences.", text: null, image: image.studio, alt_image: "Modern architecture", links: [{ label: "View projects", url: "/project" }, { label: "Talk to us", url: "/contact" }] }],
  },
  {
    id: "demo-projects",
    type: "project",
    caption: "Selected work",
    title: "Projects with measurable impact.",
    text: "Explore a selection of product, brand, and platform work.",
    image: null,
    alt_image: null,
    bg_color: null,
    bg_image: null,
    style_css: null,
    style_css_inline: null,
    style_id: "projects",
    alignment: "left",
    limit: 3,
    sort: 0,
    sort_by: null,
    category: null,
    links: [{ label: "All projects", url: "/project" }],
    item: null,
  },
  {
    id: "demo-products",
    type: "product",
    caption: "What we offer",
    title: "Useful products, thoughtfully made.",
    text: null,
    image: null,
    alt_image: null,
    bg_color: "#f8fafc",
    bg_image: null,
    style_css: null,
    style_css_inline: null,
    style_id: "products",
    alignment: "left",
    limit: 3,
    sort: 0,
    sort_by: null,
    category: null,
    links: [{ label: "Browse products", url: "/product" }],
    item: null,
  },
]

async function main() {
  const user = db.select({ id: users.id }).from(users).get()
  if (!user) throw new Error("Create an admin user before seeding demo content.")

  const posts = [
    { title: "Northstar Platform", slug: "northstar-platform", type: "project", excerpt: "A service platform designed for clarity and scale.", description: "<p>Northstar brings a complex service ecosystem into one clear digital platform.</p>", featuredImage: image.studio },
    { title: "Field Notes", slug: "field-notes", type: "project", excerpt: "A calm, useful publishing experience for a growing community.", description: "<p>Field Notes pairs a flexible editorial system with a distinctive reading experience.</p>", featuredImage: image.portfolio },
    { title: "The Value of a Focused Homepage", slug: "focused-homepage", type: "article", excerpt: "How a clear first impression helps people find their next step.", description: "<p>Great homepages make a promise, establish trust, and guide visitors to useful content.</p>", featuredImage: image.editorial },
    { title: "Designing for Momentum", slug: "designing-for-momentum", type: "article", excerpt: "Small decisions that help product teams ship with confidence.", description: "<p>Momentum comes from a shared system, a readable interface, and a sustainable pace.</p>", featuredImage: image.editorial },
    { title: "Studio Toolkit", slug: "studio-toolkit", type: "product", excerpt: "A flexible system for planning, publishing, and learning.", description: "<p>Studio Toolkit gives small teams an opinionated starting point for their next release.</p>", featuredImage: image.product },
    { title: "Everyday Objects", slug: "everyday-objects", type: "portfolio", excerpt: "A visual study of colour, material, and routine.", description: "<p>A collection of images made around the textures of ordinary life.</p>", featuredImage: image.portfolio },
  ]

  for (const post of posts) {
    if (!findPostBySlugRecord(post.slug)) {
      const result = createPost({ ...post, status: "published" }, user.id)
      if (!result.success) throw new Error(result.error.message)
    }
  }

  const pages = [
    { title: "Home", slug: "home", description: "", sections: homeSections },
    { title: "About", slug: "about", description: "<h1>About the studio</h1><p>We partner with thoughtful organisations to create useful, enduring digital products.</p>", sections: [{ ...homeSections[0], id: "demo-about-hero", item: [{ caption: "About us", title: "A small team for ambitious work.", text: null, image: image.studio, alt_image: "Modern architecture", links: [{ label: "Start a conversation", url: "/contact" }] }] }] },
    { title: "Contact", slug: "contact", description: "<h1>Let's make something useful.</h1><p>Tell us a little about your project and we will get back to you.</p>", sections: [{ ...homeSections[0], id: "demo-contact-hero", type: "contact", title: "Start a conversation.", caption: "Contact us", image: null, bg_color: null, links: null, item: null }, { id: "demo-map", type: "map", caption: null, title: "Find us", text: null, image: null, alt_image: null, bg_color: null, bg_image: null, style_css: null, style_css_inline: null, style_id: "map", alignment: "left", limit: null, sort: 0, sort_by: null, category: null, links: null, item: [{ map: "Jakarta, Indonesia" }] }] },
  ]

  for (const page of pages) {
    const existing = findPostBySlugRecord(page.slug)
    if (!existing) {
      const result = createPost({ ...page, type: "page", status: "published" }, user.id)
      if (!result.success) throw new Error(result.error.message)
    } else if (!existing.description && !existing.sections) {
      const result = updatePost(existing.id, { ...page, status: "published" }, user.id)
      if (!result.success) throw new Error(result.error.message)
    }
  }

  const existingMenus = listMenus()
  const menuItems = [
    { title: "Home", url: "/", type: "navbar" },
    { title: "About", url: "/about", type: "navbar" },
    { title: "Projects", url: "/project", type: "navbar" },
    { title: "Articles", url: "/article", type: "navbar" },
    { title: "Products", url: "/product", type: "navbar" },
    { title: "Portfolio", url: "/portfolio", type: "navbar" },
    { title: "Contact", url: "/contact", type: "navbar" },
    { title: "Contact", url: "/contact", type: "footer" },
  ]
  for (const [position, menu] of menuItems.entries()) {
    if (!existingMenus.some((item) => item.type === menu.type && item.url === menu.url)) {
      const result = createMenu({ ...menu, position, status: "published" } as Parameters<typeof createMenu>[0])
      if (!result.success) throw new Error(result.error.message)
    }
  }

  console.log("Demo content is ready.")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
