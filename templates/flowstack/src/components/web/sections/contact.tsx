import type { Section } from "./shared/types"
import { safeCssColor, safeCssImageSrc, safeHref, safeImageSrc } from "../safe-url"
import { SaasContactForm } from "../saas-contact-form"

interface Props { section: Section; hasInquiryForm?: boolean }

export default function Contact({ section, hasInquiryForm = false }: Props) {
  const safeBackgroundColor = safeCssColor(section.bg_color)
  const sectionBg = safeBackgroundColor ? undefined : "bg-slate-950"
  const borderColor = "border-slate-800/80"
  const titleColor = "text-white"
  const textColor = "text-slate-300"
  const captionBg = "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
  const captionDot = "bg-indigo-500"

  const classes = [
    "rounded-[32px] sm:rounded-[40px] border p-8 sm:p-16 shadow-2xl",
    sectionBg,
    borderColor,
    section.style_css,
  ].filter(Boolean).join(" ")

  const contentClasses = [
    "mx-auto max-w-7xl",
    section.alignment === "center" && "text-center",
    section.alignment === "right" && "text-right",
  ].filter(Boolean).join(" ")

  const validLinks = section.links?.filter((link) => link.label && safeHref(link.url) !== "#") ?? []
  const safeBackgroundImage = safeCssImageSrc(section.bg_image)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-6">
      <section
        id={section.style_id || undefined}
        className={classes}
        style={{
          backgroundColor: safeBackgroundColor || undefined,
          backgroundImage: safeBackgroundImage ? `url(${safeBackgroundImage})` : undefined,
        }}
      >
        <div className={contentClasses}>
          {/* Caption badge */}
          {section.caption && (
            <div className="mb-4 inline-block">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-2xs ${captionBg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${captionDot}`} />
                {section.caption}
              </span>
            </div>
          )}

          {/* Title */}
          {section.title && (
            <h2 className={`text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15] ${titleColor}`}>
              {section.title}
            </h2>
          )}

          {/* Body text */}
          {section.text && (
            <p className={`mt-4 max-w-3xl text-base sm:text-lg leading-relaxed ${textColor}`}>
              {section.text}
            </p>
          )}

          {/* Featured image */}
          {safeImageSrc(section.image) && (
            <img
              src={safeImageSrc(section.image) || undefined}
              alt={section.alt_image || section.title || ""}
              className="mt-8 max-h-[32rem] w-full rounded-[24px] object-cover shadow-lg"
              loading="lazy"
            />
          )}

          {/* Inquiry form */}
          {hasInquiryForm && <SaasContactForm theme="dark" />}

          {/* CTA links — only render when there are valid links */}
          {validLinks.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {validLinks.map((link) => (
                <a
                  key={`${link.label}-${link.url}`}
                  href={safeHref(link.url)}
                  className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-indigo-600 hover:border-indigo-600 hover:scale-105 active:scale-95 inline-flex items-center gap-2 backdrop-blur-sm"
                >
                  <span>{link.label}</span>
                  <svg className="h-4 w-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
