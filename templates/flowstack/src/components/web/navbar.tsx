"use client"

import { useState } from "react"
import type { MenuTree } from "@zbeaver/beaver/server"
import { safeImageSrc, safeLinkAttributes } from "./safe-url"

interface NavbarProps {
  items: MenuTree[]
  siteName?: string
  logo?: string
}

type CtaKind = "link" | "secondary" | "primary"

function NavDropdown({ item, ctaKind = "link" }: { item: MenuTree; ctaKind?: CtaKind }) {
  const ctaClass = ctaKind === "primary"
    ? "bg-[#1769f5] text-white hover:bg-[#0e58d8]"
    : ctaKind === "secondary"
      ? "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
      : "text-slate-700 hover:text-slate-950"

  return (
    <div className="relative group">
      <a
        {...safeLinkAttributes(item.url, item.target)}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition ${ctaClass} ${item.cssClass ?? ""}`}
      >
        {item.title}
        <svg className="h-3.5 w-3.5 text-current/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
        </svg>
      </a>
      <div className="absolute left-0 top-full z-50 hidden w-60 pt-2 group-hover:block group-focus-within:block">
        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
          {item.children.map((child) => (
            <a
              key={child.id}
              {...safeLinkAttributes(child.url, child.target)}
              className={`block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1769f5] ${child.cssClass ?? ""}`}
            >
              {child.title}
            </a>
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
      <div className="flex items-center justify-between border-b border-slate-100 py-1">
        <a
          {...safeLinkAttributes(item.url, item.target)}
          className="flex-1 py-3 text-sm font-medium text-slate-700 hover:text-[#1769f5]"
          style={{ paddingLeft: depth ? `${depth * 12}px` : undefined }}
        >
          {item.title}
        </a>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-2 text-sm font-bold text-slate-500"
            aria-label={expanded ? "Collapse submenu" : "Expand submenu"}
          >
            {expanded ? "−" : "+"}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="pb-2">
          {item.children.map((child) => <MobileMenuItem key={child.id} item={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  )
}

export function Navbar({ items, siteName, logo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const safeLogo = safeImageSrc(logo)
  const lastItemIndex = items.length - 1
  const secondaryItemIndex = items.length - 2

  function ctaKind(index: number): CtaKind {
    if (index === lastItemIndex) return "primary"
    if (index === secondaryItemIndex) return "secondary"
    return "link"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[74px] max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="/" className="flex items-center gap-3" aria-label={siteName || "Home"}>
          {safeLogo && <img src={safeLogo} alt="" className="h-9 w-auto max-w-[180px] object-contain" />}
          {siteName && <span className="text-base font-bold tracking-[-0.03em] text-slate-900">{siteName}</span>}
        </a>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Primary navigation">
          {items.map((item, index) => {
            const kind = ctaKind(index)
            return item.children.length > 0
              ? <NavDropdown key={item.id} item={item} ctaKind={kind} />
              : (
                <a
                  key={item.id}
                  {...safeLinkAttributes(item.url, item.target)}
                  className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition ${kind === "primary" ? "bg-[#1769f5] text-white hover:bg-[#0e58d8]" : kind === "secondary" ? "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950" : "text-slate-700 hover:text-slate-950"} ${item.cssClass ?? ""}`}
                >
                  {item.title}
                </a>
              )
          })}
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="text-lg font-semibold leading-none">{mobileMenuOpen ? "×" : "≡"}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
          <nav aria-label="Mobile navigation">
            {items.map((item) => <MobileMenuItem key={item.id} item={item} />)}
          </nav>
        </div>
      )}
    </header>
  )
}
