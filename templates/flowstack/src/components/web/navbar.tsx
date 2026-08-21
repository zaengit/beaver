"use client"

import { useState } from "react"
import type { MenuTree } from "@zbeaver/beaver/server"
import { safeHref, safeImageSrc, safeTarget } from "./safe-url"

interface NavbarProps {
  items: MenuTree[]
  siteName?: string
  logo?: string
}

function SearchBox({ className = "" }: { className?: string }) {
  return (
    <form className={`relative flex items-center gap-2 border-b border-[var(--line-strong)] pb-1 ${className}`} role="search" action="/search" method="get">
      <label className="sr-only" htmlFor="site-search">Search published content</label>
      <svg className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
      </svg>
      <input
        id="site-search"
        type="search"
        name="q"
        placeholder="Search"
        className="w-full bg-transparent text-[12px] font-medium tracking-wide text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
      />
    </form>
  )
}

function NavDropdown({ item }: { item: MenuTree }) {
  return (
    <div className="relative group">
      <a
        href={safeHref(item.url)}
        target={safeTarget(item.target)}
        rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
        className={`inline-flex items-center gap-1 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)]/75 transition-colors hover:text-[var(--ink)] ${item.cssClass ?? ""}`}
      >
        {item.title}
        <svg className="h-3 w-3 text-[var(--muted)] transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </a>
      <div className="absolute left-0 top-full hidden pt-3 group-hover:block z-50">
        <div className="min-w-56 border border-[var(--line)] bg-[var(--paper)] p-2 shadow-sm">
          {item.children.map((child) => (
            <div key={child.id} className="py-1">
              <a
                href={safeHref(child.url)}
                target={safeTarget(child.target)}
                rel={child.target === "_blank" ? "noopener noreferrer" : undefined}
                className={`block px-3 py-2 text-[13px] font-medium leading-none text-[var(--ink)] hover:bg-[var(--bg)] ${child.cssClass ?? ""}`}
              >
                {child.title}
              </a>
              {child.children.length > 0 && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-[var(--line)] pl-3">
                  {child.children.map((grandchild) => (
                    <a
                      key={grandchild.id}
                      href={safeHref(grandchild.url)}
                      target={safeTarget(grandchild.target)}
                      rel={grandchild.target === "_blank" ? "noopener noreferrer" : undefined}
                      className={`block py-1.5 text-[12px] font-medium text-[var(--muted)] hover:text-[var(--ink)] ${grandchild.cssClass ?? ""}`}
                    >
                      {grandchild.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MobileMenuItem({ item, depth = 0 }: { item: MenuTree; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = item.children.length > 0

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[var(--line)]/60 py-1">
        <a
          href={safeHref(item.url)}
          target={safeTarget(item.target)}
          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
          className={`flex-1 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)] ${item.cssClass ?? ""}`}
          style={{ paddingLeft: depth ? `${depth * 12}px` : undefined }}
        >
          {item.title}
        </a>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]"
            aria-label={expanded ? "Collapse submenu" : "Expand submenu"}
          >
            {expanded ? "—" : "+"}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="pb-2">
          {item.children.map((child) => (
            <MobileMenuItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar({ items, siteName = "Site", logo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const safeLogo = safeImageSrc(logo)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3">
          {safeLogo && <img src={safeLogo} alt="" className="h-7 w-7 object-cover" />}
          <span className="text-[15px] font-black tracking-tight text-[var(--ink)]">{siteName}</span>
          <span className="hidden h-4 w-px bg-[var(--line)] sm:block" aria-hidden="true" />
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)] sm:inline">Public</span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {items.map((item) =>
            item.children.length > 0 ? (
              <NavDropdown key={item.id} item={item} />
            ) : (
              <a
                key={item.id}
                href={safeHref(item.url)}
                target={safeTarget(item.target)}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={`py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)]/75 hover:text-[var(--ink)] ${item.cssClass ?? ""}`}
              >
                {item.title}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <SearchBox className="w-44" />
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--ink)] md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="text-[11px] font-black uppercase tracking-widest">{mobileMenuOpen ? "✕" : "≡"}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--paper)] px-4 py-4 md:hidden">
          <SearchBox className="mb-4" />
          <nav>
            {items.map((item) => (
              <MobileMenuItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
