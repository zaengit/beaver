import type { Section } from "./shared/types"
import { safeCssColor, safeCssImageSrc, safeHref, safeImageSrc } from "../safe-url"
import { SaasContactForm } from "../saas-contact-form"

interface Props { section: Section; hasInquiryForm?: boolean }

export default function Contact({ section, hasInquiryForm = false }: Props) {
  const safeBackgroundColor = safeCssColor(section.bg_color)
  const safeBackgroundImage = safeCssImageSrc(section.bg_image)
  const validLinks = section.links?.filter((link) => link.label && safeHref(link.url) !== "#") ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <section
        id={section.style_id || undefined}
        className={`border border-[var(--line-strong)] bg-[var(--paper)] px-6 py-10 sm:px-10 sm:py-12 ${section.style_css ?? ""}`}
        style={{
          backgroundColor: safeBackgroundColor || undefined,
          backgroundImage: safeBackgroundImage ? `url(${safeBackgroundImage})` : undefined,
        }}
      >
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            {section.caption && (
              <span className="inline-flex items-center gap-2 border-b-2 border-[var(--line-strong)] pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--ink)]">
                <span className="h-1 w-1 bg-[var(--ink)]" aria-hidden="true" />
                {section.caption}
              </span>
            )}
            {section.title && (
              <h2 className="mt-4 max-w-xl text-[30px] font-black leading-[0.95] tracking-[-0.04em] text-[var(--ink)] sm:text-[44px]">
                {section.title}
              </h2>
            )}
            {section.text && <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--muted)]">{section.text}</p>}
            {safeImageSrc(section.image) && (
              <img
                src={safeImageSrc(section.image) || undefined}
                alt={section.alt_image || section.title || ""}
                className="mt-6 max-h-[28rem] w-full border border-[var(--line-strong)] object-cover"
                loading="lazy"
              />
            )}
            {validLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {validLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.url}`}
                    href={safeHref(link.url)}
                    className="inline-flex items-center justify-center border border-[var(--line-strong)] bg-[var(--paper)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] hover:bg-[var(--bg)]"
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>{hasInquiryForm && <SaasContactForm theme="light" />}</div>
        </div>
      </section>
    </div>
  )
}
