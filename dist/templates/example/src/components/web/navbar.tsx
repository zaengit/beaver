"use client"

import { useState } from "react"
import type { MenuTree } from "zadm/server"

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
        className="w-full border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
      <button type="submit" className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-900" aria-label="Search">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
        </svg>
      </button>
    </form>
  )
}

function NavDropdown({ item }: { item: MenuTree }) {
  return (
    <div className="relative group">
      <a
        href={item.url}
        target={item.target ?? undefined}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${item.cssClass ?? ""}`}
      >
        {item.title}
        <svg
          className="w-4 h-4 transition-transform group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </a>
      <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50">
        <div className="bg-white border border-gray-200 rounded-sm shadow-lg min-w-48 py-1">
          {item.children.map((child) => (
            <div key={child.id}>
              <a
                href={child.url}
                target={child.target ?? undefined}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 ${child.cssClass ?? ""}`}
              >
                {child.title}
              </a>
              {child.children.length > 0 && (
                <div className="pl-4">
                  {child.children.map((grandchild) => (
                    <a
                      key={grandchild.id}
                      href={grandchild.url}
                      target={grandchild.target ?? undefined}
                      className={`block px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 ${grandchild.cssClass ?? ""}`}
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
          href={item.url}
          target={item.target ?? undefined}
          className={`flex-1 block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 ${item.cssClass ?? ""}`}
          style={{ paddingLeft: `${1 + depth * 0.75}rem` }}
        >
          {item.title}
        </a>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
            aria-label={expanded ? "Collapse submenu" : "Expand submenu"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
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

  return (
    <>
      <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Site title / logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              {logo && <img src={logo} alt="" className="h-8 w-8 object-contain" />}
              {siteName}
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
                  href={item.url}
                  target={item.target ?? undefined}
                  className={`px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors ${item.cssClass ?? ""}`}
                >
                  {item.title}
                </a>
              )
            )}
          </nav>

          <SearchBox className="hidden w-52 md:block" />

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="py-2">
            <SearchBox className="mx-4 mb-2" />
            {items.map((item) => (
              <MobileMenuItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
      )}
      </header>
    </>
  )
}
