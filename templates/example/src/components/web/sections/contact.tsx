import type { Section } from "./shared/types"

interface Props { section: Section }

function SectionItems({ items }: { items: Section["item"] }) {
  if (!items?.length) return null

  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <article key={index} className="overflow-hidden border border-slate-200 bg-white text-left shadow-sm">
          {typeof item.image === "string" && <img src={item.image} alt={typeof item.alt_image === "string" ? item.alt_image : ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />}
          <div className="p-5">
            {typeof item.caption === "string" && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.caption}</p>}
            {typeof item.title === "string" && <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>}
            {typeof item.text === "string" && <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}

export default function Contact({ section }: Props) {
  const classes = ["border-b border-slate-100", section.style_css].filter(Boolean).join(" ")
  const contentClasses = ["mx-auto max-w-7xl px-6 py-16 sm:py-20", section.alignment === "center" && "text-center", section.alignment === "right" && "text-right"].filter(Boolean).join(" ")

  return (
    <section id={section.style_id || undefined} className={classes} style={{ backgroundColor: section.bg_color || undefined, backgroundImage: section.bg_image ? `url(${section.bg_image})` : undefined }}>
      <div className={contentClasses}>
        {section.caption && <p className="text-sm font-semibold text-indigo-400">{section.caption}</p>}
        {section.title && <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{section.title}</h2>}
        {section.text && <p className="mt-5 max-w-3xl leading-7 text-slate-300">{section.text}</p>}
        {section.image && <img src={section.image} alt={section.alt_image || section.title || ""} className="mt-8 max-h-[32rem] w-full object-cover" loading="lazy" />}
        <SectionItems items={section.item} />
        {section.links?.length ? <div className="mt-8 flex flex-wrap gap-3">{section.links.filter((link) => link.label && link.url).map((link) => <a key={`${link.label}-${link.url}`} href={link.url} className="rounded-sm bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">{link.label}</a>)}</div> : null}
      </div>
    </section>
  )
}
