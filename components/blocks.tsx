import Link from "next/link";
import { Icon } from "./Icon";
import { breadcrumbLd, faqLd, jsonLd } from "@/lib/seo";
import { services, type Faq } from "@/lib/content";
import { mailHref, site, telHref } from "@/lib/site";

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
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((s) => (
        <li key={s.slug} className="card group relative flex flex-col p-6 transition-shadow hover:shadow-lift">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white">
            <Icon name={s.icon} />
          </span>
          <h3 className="mt-5 text-xl">
            <Link href={s.href} className="after:absolute after:inset-0 after:rounded-[inherit]">
              {s.title}
            </Link>
          </h3>
          <p className="mt-2 flex-1 text-[0.9375rem] text-muted">{s.short}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 group-hover:underline">
            Learn more <span aria-hidden="true">→</span>
          </span>
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
    <section className="on-navy bg-navy-900" aria-labelledby="cta-heading">
      <div className="container-page flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 id="cta-heading" className="text-3xl !text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-lg text-navy-100">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-primary">
            Send an enquiry
          </Link>
          {telHref ? (
            <a href={telHref} className="btn btn-secondary">
              <Icon name="phone" className="h-5 w-5" /> {site.phoneDisplay}
            </a>
          ) : mailHref ? (
            <a href={mailHref} className="btn btn-secondary">
              <Icon name="mail" className="h-5 w-5" /> Email us
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
    <section className="on-navy relative overflow-hidden bg-navy-900">
      <JsonLd data={breadcrumbLd(all)} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full border border-orange-500/30"
      />
      <div className="container-page relative py-14 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-navy-200">
          <ol className="flex flex-wrap items-center gap-2">
            {all.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i === all.length - 1 ? (
                  <span aria-current="page" className="font-semibold text-white">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className="hover:text-white">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-4xl !text-white sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-navy-100">{lead}</p>
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
