import type { MenuTree } from "@zbeaver/beaver/server"

interface FooterProps {
  items: MenuTree[]
  siteName?: string
}

function FooterColumn({ item }: { item: MenuTree }) {
  return (
    <div className="space-y-3">
      <h3 className="inline-block rounded-full bg-indigo-950/70 border border-indigo-800/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
        {item.title}
      </h3>
      {item.children.length > 0 && (
        <ul className="space-y-2.5 pt-1">
          {item.children.map((child) => (
            <li key={child.id}>
              <a
                href={child.url}
                target={child.target ?? undefined}
                className={`inline-block text-sm font-medium text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-200 ${child.cssClass ?? ""}`}
              >
                {child.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Footer({ items, siteName = "Site" }: FooterProps) {
  // Separate items with children (rendered as columns) from flat links
  const columns = items.filter((item) => item.children.length > 0)
  const flatLinks = items.filter((item) => item.children.length === 0)

  return (
    <footer className="relative mt-20 rounded-t-[36px] sm:rounded-t-[48px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-slate-200 border-t border-slate-800/80 overflow-hidden shadow-2xl">
      {/* M3 Expressive ambient glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12">
        {/* Footer columns */}
        {columns.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-12">
            {columns.map((item) => (
              <FooterColumn key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Flat links row */}
        {flatLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 pb-8 border-b border-slate-800/80">
            {flatLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.target ?? undefined}
                className={`rounded-full bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/90 transition-all duration-200 active:scale-95 ${item.cssClass ?? ""}`}
              >
                {item.title}
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60 text-slate-400">
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} <span className="font-extrabold text-white">{siteName}</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              Material 3 Expressive CMS
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
