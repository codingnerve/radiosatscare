import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";
import { breadcrumbLd, faqLd, jsonLd } from "@/lib/seo";
import { services, type Faq } from "@/lib/content";
import { mailHref, site, telHref } from "@/lib/site";

const serviceImages: Record<string, string> = {
  "radio-activation": "/images/service-activation.jpg",
  "signal-support": "/images/service-signal.jpg",
  "channel-assistance": "/images/service-channels.jpg",
  "subscription-support": "/images/service-subscription.jpg",
};

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}

/** Native <details> accordion: keyboard accessible with no client JS. */
export function FaqAccordion({
  faqs,
  withSchema = false,
  name = "faq",
}: {
  faqs: Faq[];
  withSchema?: boolean;
  /** Items sharing a name behave as one exclusive group. */
  name?: string;
}) {
  return (
    <div className="accordion border-t border-line">
      {withSchema && <JsonLd data={faqLd(faqs)} />}
      {faqs.map((f) => (
        <details key={f.q} name={name}>
          <summary>{f.q}</summary>
          <p className="answer">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  id?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-3xl sm:text-4xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg text-muted">{lead}</p>}
    </div>
  );
}

export function ServiceCards() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((s) => (
        <li key={s.slug} className="card group relative flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
          <div className="relative h-44 w-full overflow-hidden bg-slate-100">
            <Image
              src={serviceImages[s.slug] || "/images/hero-dashboard.jpg"}
              alt={s.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-navy-900 shadow-md backdrop-blur">
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-xl font-bold text-navy-900">
              <Link href={s.href} className="after:absolute after:inset-0 after:rounded-[inherit]">
                {s.title}
              </Link>
            </h3>
            <p className="mt-2 flex-1 text-[0.9375rem] text-muted">{s.short}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 group-hover:underline">
              Learn more <span aria-hidden="true">→</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ContactCta({
  title = "Not sure where to start? Tell us what the radio is doing.",
  text = "Send a short enquiry or call. We'll reply with practical next steps and tell you honestly what we can and can't help with.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="border-t border-line bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-indigo-50/40 py-14 sm:py-16" aria-labelledby="cta-heading">
      <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow">Ready for straight answers?</p>
          <h2 id="cta-heading" className="mt-1 text-3xl font-extrabold text-navy-950 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-lg text-muted">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-primary shadow-sm hover:shadow-md">
            Send an enquiry
          </Link>
          {telHref ? (
            <a href={telHref} className="btn btn-secondary">
              <Icon name="phone" className="h-5 w-5 text-orange-600" /> {site.phoneDisplay}
            </a>
          ) : mailHref ? (
            <a href={mailHref} className="btn btn-secondary">
              <Icon name="mail" className="h-5 w-5 text-orange-600" /> Email us
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Banner for inner pages with breadcrumb. */
export function PageHero({
  title,
  lead,
  crumbs,
  eyebrow,
}: {
  title: string;
  lead: string;
  eyebrow?: string;
  crumbs: { name: string; path: string }[];
}) {
  const all = [{ name: "Home", path: "/" }, ...crumbs];
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-sky-50/70 via-slate-50/40 to-white">
      <JsonLd data={breadcrumbLd(all)} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-orange-100/30 blur-3xl"
      />
      <div className="container-page relative py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            {all.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-slate-400">/</span>}
                {i === all.length - 1 ? (
                  <span aria-current="page" className="font-semibold text-navy-950">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="text-muted hover:text-navy-900 transition-colors">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-orange-700 shadow-xs mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="mt-1 max-w-3xl text-3xl font-extrabold text-navy-950 sm:text-4xl lg:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{lead}</p>
      </div>
    </section>
  );
}

export function Checklist({ items, tone = "check" }: { items: string[]; tone?: "check" | "limit" }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ${
              tone === "check" ? "bg-orange-100 text-orange-700" : "bg-navy-100 text-navy-700"
            }`}
            aria-hidden="true"
          >
            {tone === "check" ? (
              <Icon name="check" className="h-4 w-4" />
            ) : (
              <span className="text-sm font-bold leading-none">!</span>
            )}
          </span>
          <span className="text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
