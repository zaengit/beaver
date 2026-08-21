import type { MenuTree } from "@zbeaver/beaver/server"
import { safeHref, safeTarget } from "./safe-url"

interface FooterProps {
  items: MenuTree[]
  siteName?: string
}

function FooterColumn({ item }: { item: MenuTree }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
        {item.title}
      </h3>
      {item.children.length > 0 && (
        <ul className="mt-4 space-y-2">
          {item.children.map((child) => (
            <li key={child.id}>
              <a
                href={safeHref(child.url)}
                target={safeTarget(child.target)}
                rel={child.target === "_blank" ? "noopener noreferrer" : undefined}
                className={`text-[13px] leading-6 text-[var(--ink)]/60 hover:text-[var(--ink)] ${child.cssClass ?? ""}`}
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
  const columns = items.filter((item) => item.children.length > 0)
  const flatLinks = items.filter((item) => item.children.length === 0)

  return (
    <footer className="mt-16 border-t-[3px] border-[var(--line-strong)] bg-[var(--paper)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-14">
        {columns.length > 0 && (
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
            {columns.map((item) => (
              <FooterColumn key={item.id} item={item} />
            ))}
          </div>
        )}

        {flatLinks.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--line)] pt-6">
            {flatLinks.map((item) => (
              <a
                key={item.id}
                href={safeHref(item.url)}
                target={safeTarget(item.target)}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--ink)] ${item.cssClass ?? ""}`}
              >
                {item.title}
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            © {new Date().getFullYear()} <span className="font-bold text-[var(--ink)]">{siteName}</span>
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Flowstack — Editorial system</p>
        </div>
      </div>
    </footer>
  )
}
