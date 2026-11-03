import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { servicePages } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteShell>
      <section className="container-page py-20 sm:py-28">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-2 max-w-2xl text-4xl sm:text-5xl">We lost the signal on that page</h1>
        <p className="mt-5 max-w-xl text-lg text-muted">
          The page you were looking for doesn&apos;t exist or has moved. Try one of these instead.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the homepage
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            Contact us
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
          {servicePages.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="font-semibold text-orange-700 underline underline-offset-4">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
