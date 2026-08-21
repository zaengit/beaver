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
    <form className={`relative ${className}`} role="search" action="/search" method="get">
      <label className="sr-only" htmlFor="site-search">Search published content</label>
      <input
        id="site-search"
        type="search"
        name="q"
        placeholder="Search..."
        className="w-full rounded-full border border-slate-200/90 bg-slate-100/90 py-2 pl-4 pr-10 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-90"
        aria-label="Search"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        </svg>
      </button>
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
        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-indigo-50/90 hover:text-indigo-600 active:scale-95 ${item.cssClass ?? ""}`}
      >
        {item.title}
        <svg
          className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180 text-slate-500 group-hover:text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </a>
      <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="min-w-56 rounded-3xl border border-slate-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-2xl">
          {item.children.map((child) => (
            <div key={child.id}>
              <a
                href={safeHref(child.url)}
                target={safeTarget(child.target)}
                rel={child.target === "_blank" ? "noopener noreferrer" : undefined}
                className={`block rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${child.cssClass ?? ""}`}
              >
                {child.title}
              </a>
              {child.children.length > 0 && (
                <div className="pl-3 mt-0.5 space-y-0.5 border-l-2 border-indigo-100 ml-3">
                  {child.children.map((grandchild) => (
                    <a
                      key={grandchild.id}
                      href={safeHref(grandchild.url)}
                      target={safeTarget(grandchild.target)}
                      rel={grandchild.target === "_blank" ? "noopener noreferrer" : undefined}
                      className={`block rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-indigo-50/70 hover:text-indigo-600 ${grandchild.cssClass ?? ""}`}
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
      <div className="flex items-center">
        <a
          href={safeHref(item.url)}
          target={safeTarget(item.target)}
          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
          className={`flex-1 block rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${item.cssClass ?? ""}`}
          style={{ paddingLeft: `${1 + depth * 0.75}rem` }}
        >
          {item.title}
        </a>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-full p-2 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 active:scale-90"
            aria-label={expanded ? "Collapse submenu" : "Expand submenu"}
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="pl-2 border-l-2 border-indigo-100 ml-4 mt-1 space-y-1">
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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-3">
      <div className="mx-auto max-w-7xl rounded-full border border-slate-200/90 bg-white/85 px-4 sm:px-6 shadow-lg shadow-slate-200/40 backdrop-blur-xl transition-all duration-300">
        <div className="flex h-14 items-center justify-between">
          {/* Site title / logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-2.5 rounded-full px-2 py-1 text-base font-extrabold tracking-tight text-slate-900 transition-colors hover:text-indigo-600">
              {safeLogo && <img src={safeLogo} alt="" className="h-8 w-8 rounded-full object-cover shadow-xs" />}
              <span>{siteName}</span>
            </a>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {items.map((item) =>
              item.children.length > 0 ? (
                <NavDropdown key={item.id} item={item} />
              ) : (
                <a
                  key={item.id}
                  href={safeHref(item.url)}
                  target={safeTarget(item.target)}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-indigo-50/90 hover:text-indigo-600 active:scale-95 ${item.cssClass ?? ""}`}
                >
                  {item.title}
                </a>
              )
            )}
          </nav>

          <SearchBox className="hidden w-48 lg:block" />

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none transition-all active:scale-90"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mt-2 md:hidden rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1">
            <SearchBox className="mb-3" />
            {items.map((item) => (
              <MobileMenuItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
