import type { Section } from "./shared/types"
import { getSafeLinks, safeCssColor, safeCssImageSrc, safeImageSrc } from "../safe-url"
import { InquiryForm } from "../inquiry-form"

interface Props { section: Section; hasInquiryForm?: boolean }

export default function Contact({ section, hasInquiryForm = false }: Props) {
  const validLinks = getSafeLinks(section.links)
  const safeBackgroundColor = safeCssColor(section.bg_color)
  const safeBackgroundImage = safeCssImageSrc(section.bg_image)
  const safeImage = safeImageSrc(section.image)

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <section
        id={section.style_id || undefined}
        className={section.style_css ?? ""}
        style={{
          backgroundColor: safeBackgroundColor || undefined,
          backgroundImage: safeBackgroundImage ? `url(${safeBackgroundImage})` : undefined,
        }}
      >
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
          <div className="relative pt-2 lg:pt-10">
            {section.caption && (
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#1769f5]">
                <span className="h-2 w-2 rounded-full bg-[#1769f5] shadow-[0_0_0_5px_rgba(23,105,245,0.12)]" aria-hidden="true"></span>
                <p>{section.caption}</p>
              </div>
            )}
            {section.title && <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#111827] sm:text-5xl lg:text-[3.75rem]">{section.title}</h2>}
            {section.text && <p className="mt-6 max-w-lg whitespace-pre-line text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">{section.text}</p>}
            <div className="mt-8 flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true"></span>
              <span>We usually reply within one business day.</span>
            </div>
            {safeImage && <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/60 shadow-xl shadow-indigo-950/10"><img src={safeImage} alt={section.alt_image || section.title || ""} className="max-h-[24rem] w-full object-cover" loading="lazy" /></div>}
            {validLinks.length > 0 && <div className="mt-8 flex flex-wrap gap-3">{validLinks.map((link) => <a key={`${link.label}-${link.url}`} href={link.href} className="group inline-flex items-center gap-2 rounded-xl bg-[#1769f5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#0e58d8]">{link.label}<span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">↗</span></a>)}</div>}
          </div>
          <div className="lg:pt-1">
            {hasInquiryForm && <InquiryForm theme="light" />}
          </div>
        </div>
      </section>
    </div>
  )
}
