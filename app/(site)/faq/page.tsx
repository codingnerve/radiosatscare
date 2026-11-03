import type { Metadata } from "next";
import { ContactCta, FaqAccordion, JsonLd, PageHero } from "@/components/blocks";
import { generalFaqs, services } from "@/lib/content";
import { faqLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description:
    "Answers to common questions about car satellite radio: activation, signal problems, missing channels, subscriptions and what RadioSatCare can and can't do.",
  path: "/faq",
});

export default function FaqPage() {
  const groups = [
    { id: "general", title: "General", faqs: generalFaqs },
    ...services.map((s) => ({ id: s.slug, title: s.title, faqs: s.faqs })),
  ];
  // One FAQPage object covering exactly the questions visible on this page.
  const all = groups.flatMap((g) => g.faqs);

  return (
    <>
      <JsonLd data={faqLd(all)} />
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        lead="Straight answers about satellite radio problems and about what RadioSatCare does."
        crumbs={[{ name: "FAQ", path: "/faq" }]}
      />

      <section className="py-14 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow mb-3">Jump to</p>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {groups.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="block rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 lg:border-0"
                  >
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-14">
            {groups.map((g) => (
              <section key={g.id} id={g.id} aria-labelledby={`${g.id}-heading`}>
                <h2 id={`${g.id}-heading`} className="mb-4 text-2xl sm:text-3xl">
                  {g.title}
                </h2>
                <FaqAccordion faqs={g.faqs} name={`faq-${g.id}`} />
              </section>
            ))}
          </div>
        </div>
      </section>

      <ContactCta title="Still have a question?" text="Send us the details and we'll answer it directly." />
    </>
  );
}
