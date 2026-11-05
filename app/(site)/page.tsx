import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Checklist, ContactCta, FaqAccordion, SectionHeading, ServiceCards } from "@/components/blocks";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Icon } from "@/components/Icon";
import { commonIssues, generalFaqs, steps, vehicleInfo, whyChoose } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Independent car satellite radio assistance",
    description:
      "Independent help with car satellite radio activation, signal problems, missing channels and subscription questions. Send an enquiry or call. Not affiliated with any radio provider.",
    path: "/",
  }),
  title: { absolute: `${site.name} | Independent car satellite radio assistance` },
};

export default function HomePage() {
  return (
    <>
      {/* 3. Hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-sky-50/80 via-blue-50/30 to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-orange-100/40 blur-3xl"
        />
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-700 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              Independent satellite radio assistance
            </div>
            <h1 className="mt-4 text-4xl font-extrabold text-navy-950 sm:text-5xl lg:text-[3.25rem] tracking-tight">
              Get your car&apos;s satellite radio sorted, with straight answers.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Activation, signal drops, missing channels or a confusing renewal: tell us what the radio is doing and
              we&apos;ll guide you to the right next step.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#enquiry" className="btn btn-primary shadow-sm hover:shadow-md">
                Send an enquiry
              </a>
              {telHref ? (
                <a href={telHref} className="btn btn-secondary">
                  <Icon name="phone" className="h-5 w-5 text-orange-600" /> Call {site.phoneDisplay}
                </a>
              ) : (
                <a href="#how-it-works" className="btn btn-secondary">
                  See how it works
                </a>
              )}
            </div>
            <ul className="mt-8 grid gap-3 text-[0.9375rem] text-muted sm:grid-cols-1">
              {[
                "Independent: we are not your radio provider",
                "Reply by phone or email, your choice",
                "We never ask for card numbers or passwords",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-slate-700">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-rise [animation-delay:120ms]">
            <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white p-2.5 shadow-lift">
              <div className="relative h-72 sm:h-80 w-full overflow-hidden rounded-xl bg-slate-900">
                <Image
                  src="/images/hero-car-interior.jpg"
                  alt="Modern car interior showing digital dashboard and satellite radio system"
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur border border-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Satellite Signal
                </div>
                <div className="absolute bottom-3 inset-x-3 rounded-lg bg-white/95 p-3 text-xs text-navy-900 shadow-md backdrop-blur">
                  <p className="font-bold text-navy-950">In-Car Satellite Audio Assistance</p>
                  <p className="text-muted mt-0.5">Direct answers for activation, antenna signals & plan renewals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Compact service-request form */}
      <section id="enquiry" aria-labelledby="enquiry-heading" className="bg-navy-50">
        <div className="container-page grid gap-10 py-14 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <p className="eyebrow">Quick request</p>
            <h2 id="enquiry-heading" className="mt-2 text-3xl sm:text-4xl">
              Tell us what&apos;s going on
            </h2>
            <p className="mt-4 text-lg text-muted">
              A few details are enough to get started. The more specific you are about the message on screen, the more
              useful our reply will be.
            </p>
            <ul className="mt-6 space-y-3 text-[0.9375rem]">
              <li className="flex gap-3">
                <Icon name="chat" className="mt-0.5 h-5 w-5 flex-none text-orange-700" />
                <span>Include the vehicle, the radio&apos;s on-screen message and what you&apos;ve tried.</span>
              </li>
              <li className="flex gap-3">
                <Icon name="shield" className="mt-0.5 h-5 w-5 flex-none text-orange-700" />
                <span>
                  Your details are used only to answer you. See the{" "}
                  <Link href="/privacy-policy" className="font-semibold text-orange-700 underline underline-offset-2">
                    privacy policy
                  </Link>
                  .
                </span>
              </li>
            </ul>
          </div>
          <div className="card p-5 sm:p-8">
            <EnquiryForm variant="compact" />
          </div>
        </div>
      </section>

      {/* 5. Four service cards */}
      <section aria-labelledby="services-heading" className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            id="services-heading"
            eyebrow="How we can help"
            title="Four areas of in-car satellite radio support"
            lead="Each has its own guide with the checks worth trying first and a clear view of what we can and can't do."
          />
          <div className="mt-10">
            <ServiceCards />
          </div>
        </div>
      </section>

      {/* 6. Three steps */}
      <section id="how-it-works" aria-labelledby="steps-heading" className="bg-navy-50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            id="steps-heading"
            eyebrow="How support works"
            title="Three steps from “it's not working” to a plan"
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="card relative p-6 sm:p-7">
                <span className="font-display text-5xl font-extrabold leading-none text-orange-500/90" aria-hidden="true">
                  {s.n}
                </span>
                <h3 className="mt-4 text-xl">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Common radio issues */}
      <section aria-labelledby="issues-heading" className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            id="issues-heading"
            eyebrow="Common radio issues"
            title="Recognise what you're seeing?"
            lead="These are typical situations drivers run into. Select one for what it usually means and what to try."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {commonIssues.map((i) => (
              <li key={i.symptom}>
                <Link
                  href={i.href}
                  className="card group flex h-full flex-col justify-between gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span>
                    <span className="block font-display text-lg font-bold text-navy-900">{i.symptom}</span>
                    <span className="mt-1 block text-[0.9375rem] text-muted">{i.detail}</span>
                  </span>
                  <span className="text-sm font-bold text-orange-700 group-hover:underline">
                    Read the guide <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. Supported vehicles */}
      <section aria-labelledby="vehicles-heading" className="border-y border-line bg-slate-50 py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <p className="eyebrow">Vehicles</p>
            <h2 id="vehicles-heading" className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">
              It depends on the receiver, not just the badge on the boot
            </h2>
            <p className="mt-5 text-lg text-muted">{vehicleInfo.intro}</p>
            <p className="mt-3 text-muted">{vehicleInfo.honest}</p>
            <div className="relative mt-6 h-56 sm:h-64 w-full overflow-hidden rounded-2xl border border-line shadow-sm">
              <Image
                src="/images/vehicles-infotainment.jpg"
                alt="Car infotainment touchscreen receiver"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-xs font-semibold text-white">
                Compatible with factory-fitted, aftermarket & portable satellite receivers.
              </div>
            </div>
          </div>
          <div className="card p-6 sm:p-8 bg-white shadow-card">
            <h3 className="text-xl font-bold text-navy-900">What helps us help you</h3>
            <ul className="mt-5 space-y-4">
              {vehicleInfo.weNeed.map((n) => (
                <li key={n} className="flex gap-3 text-slate-700">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <span className="text-[0.9375rem]">{n}</span>
                </li>
              ))}
            </ul>
            <Link href="/contact" className="btn btn-primary mt-7 shadow-sm">
              Share your vehicle details
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Why choose */}
      <section aria-labelledby="why-heading" className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            id="why-heading"
            eyebrow="Why RadioSatCare"
            title="Things you can check for yourself"
            lead="No ratings or slogans, only commitments you can verify on this site."
          />
          <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {whyChoose.map((w, i) => (
              <li key={w.title} className="flex gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-orange-100 font-display text-lg font-extrabold text-orange-700">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg">{w.title}</h3>
                  <p className="mt-1 text-muted">{w.text}</p>
                </div>
              </li>
            ))}
            <li className="rounded-2xl bg-navy-50 p-5 md:col-span-1">
              <p className="font-display font-bold text-navy-900">What we don&apos;t do</p>
              <div className="mt-3">
                <Checklist
                  tone="limit"
                  items={[
                    "Activate radios or change subscriptions",
                    "Repair antennas or receivers remotely",
                    "Promise results or timings we can't control",
                  ]}
                />
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 10. FAQ accordion */}
      <section aria-labelledby="faq-heading" className="bg-navy-50 py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Troubleshooting FAQ</p>
            <h2 id="faq-heading" className="mt-2 text-3xl sm:text-4xl">
              Quick answers to common questions
            </h2>
            <p className="mt-4 text-lg text-muted">Can&apos;t find yours? Send an enquiry and we&apos;ll answer it.</p>
            <Link href="/faq" className="btn btn-secondary mt-6">
              See all questions
            </Link>
          </div>
          <FaqAccordion faqs={generalFaqs.slice(0, 6)} />
        </div>
      </section>

      {/* 11. Contact CTA */}
      <ContactCta />
    </>
  );
}
