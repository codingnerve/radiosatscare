import type { Metadata } from "next";
import { PageHero } from "@/components/blocks";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Icon } from "@/components/Icon";
import { pageMetadata } from "@/lib/seo";
import { mailHref, site, telHref } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description:
    "Send RadioSatCare an enquiry about your car's satellite radio, or call us. Tell us the vehicle and the on-screen message and we'll reply by phone or email.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what your radio is doing"
        lead="Call us directly for immediate help, or fill in the form and we'll call you back directly."
        crumbs={[{ name: "Contact", path: "/contact" }]}
      />

      <section className="py-14 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          <div className="card p-5 sm:p-8">
            <h2 className="text-2xl">Send an enquiry</h2>
            <p className="mt-2 mb-6 text-muted">
              All fields are required unless marked optional. We never ask for card numbers or passwords.
            </p>
            <EnquiryForm variant="full" />
          </div>

          <aside className="space-y-6" aria-label="Other ways to reach us">
            <div className="card p-6">
              <h2 className="text-xl">Prefer to talk?</h2>
              <ul className="mt-4 space-y-4">
                {telHref && (
                  <li className="flex gap-3">
                    <Icon name="phone" className="mt-0.5 h-5 w-5 flex-none text-orange-700" />
                    <span>
                      <a href={telHref} className="block font-display text-lg font-bold text-navy-900 hover:underline">
                        {site.phoneDisplay}
                      </a>
                      {site.hours && <span className="text-sm text-muted">{site.hours}</span>}
                    </span>
                  </li>
                )}
                {mailHref && (
                  <li className="flex gap-3">
                    <Icon name="mail" className="mt-0.5 h-5 w-5 flex-none text-orange-700" />
                    <a href={mailHref} className="font-semibold text-navy-900 hover:underline">
                      {site.email}
                    </a>
                  </li>
                )}
                <li className="flex gap-3">
                  <Icon name="pin" className="mt-0.5 h-5 w-5 flex-none text-orange-700" />
                  <address className="text-sm not-italic text-muted">
                    {site.legalName ? (
                      <strong className="block text-navy-900">{site.legalName}</strong>
                    ) : (
                      <strong className="block text-navy-900">{site.name}</strong>
                    )}
                    {site.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
                {!telHref && !mailHref && (
                  <li className="text-muted">
                    The enquiry form is the quickest way to reach us. We&apos;ll reply using the method you choose.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl bg-navy-50 p-6">
              <h2 className="text-xl">Helpful to include</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-[0.9375rem] text-muted">
                <li>Vehicle make, model and approximate year</li>
                <li>The exact message shown on the radio screen</li>
                <li>Your radio ID, if you can find it</li>
                <li>What changed before the problem started</li>
                <li>What you&apos;ve already tried</li>
              </ul>
            </div>

            <p className="flex gap-3 rounded-2xl border border-orange-500/40 bg-orange-50 p-5 text-sm text-ink">
              <Icon name="shield" className="mt-0.5 h-5 w-5 flex-none text-orange-700" />
              <span>
                <strong>Keep it private.</strong> Never send card numbers or passwords, in the form or by email.
                We&apos;ll never ask for them.
              </span>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
