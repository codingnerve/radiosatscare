import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Checklist, ContactCta, PageHero } from "@/components/blocks";
import { operatorLine } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description:
    "RadioSatCare is an independent assistance service for in-car satellite radio. Learn who we are, how we work and where our role stops.",
  path: "/about",
});

const principles = [
  {
    title: "Say what we are",
    text: "We're an independent service. We say so on every page and never present ourselves as your provider.",
  },
  {
    title: "Say what we can't do",
    text: "Each guide lists its limits. If something is outside what we can do, we tell you at the start.",
  },
  {
    title: "Ask for as little as possible",
    text: "We collect only what we need to reply, and never card numbers or account passwords.",
  },
  {
    title: "Leave you in control",
    text: "You make the decisions about your plan and your equipment. We help you make them with the facts.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="An independent helping hand for in-car satellite radio"
        lead="Satellite radio has a lot of moving parts: the receiver, the antenna, the sky and the provider's account. We help drivers make sense of them."
        crumbs={[{ name: "About", path: "/about" }]}
      />

      <section className="py-14 sm:py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 className="text-3xl">Why RadioSatCare exists</h2>
            <div className="mt-5 space-y-4 text-lg text-muted">
              <p>
                When a car radio stops playing, it is rarely obvious who to ask. Is it the receiver? The antenna? The
                account? A single message on the screen can point to any of them.
              </p>
              <p>
                RadioSatCare exists to take that first, confusing step off your plate. You tell us what you&apos;re
                seeing, and we help you work out the likely cause, what to check and what to say to your provider or
                installer, so you only have to explain it once.
              </p>
              <p>
                We are an independent assistance service. We don&apos;t operate satellite networks, sell receivers or
                run your account, and we are not affiliated with any provider or manufacturer.
              </p>
            </div>
          </div>
          <div className="space-y-6 self-start">
            <div className="relative h-60 w-full overflow-hidden rounded-2xl border border-line shadow-sm">
              <Image
                src="/images/support-advisor.jpg"
                alt="RadioSatCare technical advisor assisting driver"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-xs font-medium text-white">
                Independent assistance focused on clarity, honest limits, and driver satisfaction.
              </div>
            </div>
            <div className="card p-6 sm:p-8">
              <h2 className="text-xl">At a glance</h2>
            <dl className="mt-5 space-y-4 text-[0.9375rem]">
              <div>
                <dt className="font-semibold text-navy-900">What we do</dt>
                <dd className="text-muted">Guidance on activation, signal, channels and subscription questions.</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-900">What we don&apos;t do</dt>
                <dd className="text-muted">Activate radios, change subscriptions or repair hardware.</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-900">How to reach us</dt>
                <dd className="text-muted">
                  The <Link href="/contact" className="font-semibold text-orange-700 underline underline-offset-2">enquiry form</Link>
                  {site.phoneDisplay && <> or by phone on {site.phoneDisplay}</>}.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-navy-900">{site.legalName ? "Operated by" : "Our address"}</dt>
                <dd className="text-muted">
                  {site.legalName ? operatorLine().replace(`${site.name}, operated by `, "") : site.address}
                </dd>
              </div>
            </dl>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-50 py-14 sm:py-16" aria-labelledby="principles-heading">
        <div className="container-page">
          <p className="eyebrow">How we work</p>
          <h2 id="principles-heading" className="mt-2 text-3xl sm:text-4xl">
            Four working principles
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {principles.map((p, i) => (
              <li key={p.title} className="card p-6">
                <span className="font-display text-3xl font-extrabold text-orange-500">0{i + 1}</span>
                <h3 className="mt-2 text-xl">{p.title}</h3>
                <p className="mt-2 text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 sm:py-16" aria-labelledby="handling-heading">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="handling-heading" className="text-3xl">
              How we handle your enquiry
            </h2>
            <p className="mt-4 text-lg text-muted">
              Your enquiry goes straight to our team&apos;s inbox and is used only to reply to you. This website keeps no copy of it. The{" "}
              <Link href="/privacy-policy" className="font-semibold text-orange-700 underline underline-offset-2">
                privacy policy
              </Link>{" "}
              explains what we keep in our inbox, for how long and how to ask us to delete it.
            </p>
          </div>
          <Checklist
            items={[
              "Sent over an encrypted connection to a mailbox only our team can open",
              "Never sold, and never used for marketing",
              "No card details or passwords collected, ever",
              "Deleted on request or after our retention period",
            ]}
          />
        </div>
      </section>

      <ContactCta />
    </>
  );
}
