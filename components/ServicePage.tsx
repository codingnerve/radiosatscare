import Image from "next/image";
import Link from "next/link";
import { Checklist, ContactCta, FaqAccordion, PageHero } from "./blocks";
import { EnquiryForm } from "./EnquiryForm";
import { Icon } from "./Icon";
import { services, type ServiceContent } from "@/lib/content";

const serviceImages: Record<string, string> = {
  "radio-activation": "/images/service-activation.jpg",
  "signal-support": "/images/service-signal.jpg",
  "channel-assistance": "/images/service-channels.jpg",
  "subscription-support": "/images/service-subscription.jpg",
};

export function ServicePage({ service }: { service: ServiceContent }) {
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <PageHero
        eyebrow="Service guide"
        title={service.h1}
        lead={service.intro}
        crumbs={[{ name: service.title, path: service.href }]}
      />

      <section className="py-14 sm:py-16" aria-labelledby="help-heading">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-12">
            {serviceImages[service.slug] && (
              <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-line shadow-sm">
                <Image
                  src={serviceImages[service.slug]}
                  alt={service.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <span className="text-sm font-semibold backdrop-blur-md bg-slate-900/60 px-3 py-1 rounded-full border border-white/20">
                    {service.title} Technical Assistance
                  </span>
                </div>
              </div>
            )}

            <div>
              <h2 id="help-heading" className="text-2xl sm:text-3xl">
                What we can help with
              </h2>
              <div className="mt-5">
                <Checklist items={service.helpWith} />
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl">Before you get in touch</h2>
              <p className="mt-2 text-muted">Three quick things that often make the next step much easier.</p>
              <ol className="mt-6 space-y-4">
                {service.beforeYouContact.map((b, i) => (
                  <li key={b.title} className="card flex gap-4 p-5">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-navy-900 font-display font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg">{b.title}</h3>
                      <p className="mt-1 text-muted">{b.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl">What happens next</h2>
              <ol className="mt-6 space-y-5 border-l-2 border-orange-500/60 pl-6">
                {service.nextSteps.map((s, i) => (
                  <li key={s} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.15rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-navy-950"
                    >
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-navy-50 p-6">
              <h2 className="text-xl">What we can&apos;t do</h2>
              <p className="mt-1 text-sm text-muted">So there are no surprises.</p>
              <div className="mt-4">
                <Checklist tone="limit" items={service.limits} />
              </div>
            </div>
          </div>

          <aside id="enquiry" aria-labelledby="aside-heading" className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5 sm:p-7">
              <h2 id="aside-heading" className="text-2xl">
                Ask about this
              </h2>
              <p className="mt-2 mb-5 text-sm text-muted">
                Describe what you&apos;re seeing and we&apos;ll reply with practical next steps.
              </p>
              <EnquiryForm variant="compact" defaultCategory={service.category} />
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-navy-50 py-14 sm:py-16" aria-labelledby="faq-heading">
        <div className="container-page grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-heading" className="mt-2 text-3xl">
              {service.title}: common questions
            </h2>
          </div>
          <FaqAccordion faqs={service.faqs} withSchema />
        </div>
      </section>

      <section className="py-14" aria-labelledby="related-heading">
        <div className="container-page">
          <h2 id="related-heading" className="text-2xl">
            Related guides
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={o.href}
                  className="card group flex h-full items-center gap-4 p-4 transition-shadow hover:shadow-lift"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-navy-900 text-white">
                    <Icon name={o.icon} />
                  </span>
                  <span className="font-display font-bold text-navy-900 group-hover:underline">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
