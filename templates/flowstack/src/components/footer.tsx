import type { getSiteSettings, MenuTree } from "@zbeaver/beaver/server"
import { safeLinkAttributes, safeLinkHref } from "./safe-url"

type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>
type SocialLink = SiteSettings["links"][number]
type OpenHours = SiteSettings["open_hours"][number]

interface FooterProps {
  items: MenuTree[]
  siteName?: string
  description?: string
  socialLinks?: SocialLink[]
  openHours?: OpenHours[]
  translateCountries?: string[]
}

const LANGUAGE_NAMES: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  ms: "Malay",
  "zh-CN": "中文",
  "zh-TW": "繁體中文",
}

function languageName(code: string) {
  return LANGUAGE_NAMES[code] ?? code.toUpperCase()
}

function hasSocialIcon(link: SocialLink) {
  return Boolean(link.icon?.trim())
}

function SocialIcon({ link }: { link: SocialLink }) {
  const iconName = `${link.icon ?? ""} ${link.platform}`.toLowerCase()

  if (iconName.includes("instagram")) {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.45" cy="6.55" r="1.1" fill="currentColor" />
      </svg>
    )
  }

  if (iconName.includes("linkedin")) {
    return (
      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5.15 8.25h3.7V20h-3.7V8.25Zm1.85-5.1a2.15 2.15 0 1 1 0 4.3 2.15 2.15 0 0 1 0-4.3ZM10.8 8.25h3.55v1.6h.05c.5-.92 1.7-1.9 3.5-1.9 3.75 0 4.45 2.47 4.45 5.68V20h-3.7v-5.64c0-1.35-.03-3.08-1.88-3.08-1.88 0-2.17 1.47-2.17 2.98V20h-3.7V8.25Z" />
      </svg>
    )
  }

  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m10.5 13.5 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 16.5H6a4 4 0 0 1 0-8h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 7.5H18a4 4 0 0 1 0 8h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function FooterColumn({ item }: { item: MenuTree }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
      {item.children.length > 0 && (
        <ul className="mt-4 space-y-2">
          {item.children.map((child) => (
            <li key={child.id}>
              <a
                {...safeLinkAttributes(child.url, child.target)}
                className={`text-sm text-white/55 transition hover:text-cyan-200 ${child.cssClass ?? ""}`}
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

export function Footer({ items, siteName = "Site", description, socialLinks = [], openHours = [], translateCountries = [] }: FooterProps) {
  const visibleSocialLinks = socialLinks.flatMap((link) => {
    const href = safeLinkHref(link.url)
    return link.platform && href ? [{ ...link, href }] : []
  })
  const visibleOpenHours = openHours.filter((hours) => hours.day && hours.open && hours.close)
  const visibleLanguages = translateCountries.filter(Boolean)

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-gradient-to-br from-[#0e1630] via-[#17234a] to-[#0b1126] text-white">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.9fr_1.15fr] lg:gap-16">
          <div className="max-w-sm">
            <a href="/" className="inline-flex h-fit items-center" aria-label={siteName}>
              <span className="text-xl font-bold tracking-[-0.04em] text-white">{siteName}</span>
            </a>
            {description && <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">{description}</p>}
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
              Built for clearer momentum
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200/70">Explore</p>
            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4">
              {items.map((item) => (
                item.children.length > 0 ? (
                  <FooterColumn key={item.id} item={item} />
                ) : (
                  <a
                    key={item.id}
                    {...safeLinkAttributes(item.url, item.target)}
                    className={`text-sm text-white/65 transition hover:text-cyan-200 ${item.cssClass ?? ""}`}
                  >
                    {item.title}
                  </a>
                )
              ))}
            </div>
          </nav>

          {(visibleSocialLinks.length > 0 || visibleOpenHours.length > 0 || visibleLanguages.length > 0) && (
            <div className="space-y-8 border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {visibleSocialLinks.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200/70">Social Media Links</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {visibleSocialLinks.map((link) => (
                    <a
                      key={`${link.platform}-${link.url}`}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      title={link.platform}
                      className={`group inline-flex items-cente ${hasSocialIcon(link) ? "size-12 justify-center" : "gap-3 px-3 py-2.5"}`}
                    >
                      <span className="flex size-9 items-center justify-center rounded-xl bg-cyan-200/10 text-cyan-100 transition group-hover:bg-cyan-200/20 group-hover:text-white">
                        <SocialIcon link={link} />
                      </span>
                      {!hasSocialIcon(link) && <span className="text-sm font-semibold text-white/80 transition group-hover:text-white">{link.platform}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {visibleOpenHours.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200/70">Open Hours</p>
                <ul className="mt-4 space-y-2 text-sm text-white/60">
                  {visibleOpenHours.map((hours) => (
                    <li key={`${hours.day}-${hours.open}-${hours.close}`} className="flex flex-wrap justify-between gap-3">
                      <span>{hours.day}</span>
                      <span className="font-semibold text-white">{hours.open} – {hours.close}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {visibleLanguages.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200/70">Languages</p>
                <div id="google_translate_element" className="google-translate-widget mt-4" />
                <div className="sr-only">
                  {visibleLanguages.map((code) => <span key={code}>{languageName(code)}</span>)}
                </div>
              </div>
            )}
          </div>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-white/10 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteName}</p>
          <p>Move work forward with more clarity.</p>
        </div>
      </div>
    </footer>
  )
}
