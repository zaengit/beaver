import type { MenuTree } from "@zaenpm/zadm/server"

interface FooterProps {
  items: MenuTree[]
  siteName?: string
}

function FooterColumn({ item }: { item: MenuTree }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
        {item.title}
      </h3>
      {item.children.length > 0 && (
        <ul className="mt-3 space-y-2">
          {item.children.map((child) => (
            <li key={child.id}>
              <a
                href={child.url}
                target={child.target ?? undefined}
                className={`text-sm text-gray-600 hover:text-gray-900 transition-colors ${child.cssClass ?? ""}`}
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
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer columns */}
        {columns.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
            {columns.map((item) => (
              <FooterColumn key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Flat links row */}
        {flatLinks.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
            {flatLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.target ?? undefined}
                className={`text-sm text-gray-600 hover:text-gray-900 transition-colors ${item.cssClass ?? ""}`}
              >
                {item.title}
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
