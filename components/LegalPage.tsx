import Link from "next/link";
import { PageHero } from "./blocks";
import { site } from "@/lib/site";

export const LEGAL_UPDATED = "23 October 2026";

/** "RadioSatCare" or "RadioSatCare, operated by <legal name>, <address>" using only configured values. */
export function operatorLine() {
  if (!site.legalName) return site.name;
  return `${site.name}, operated by ${site.legalName}${site.address ? `, ${site.address}` : ""}`;
}

export function LegalPage({
  title,
  lead,
  path,
  children,
}: {
  title: string;
  lead: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHero title={title} lead={lead} crumbs={[{ name: title, path }]} />
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-8 rounded-lg bg-navy-50 px-4 py-3 text-sm text-muted">Last updated: {LEGAL_UPDATED}</p>
          <div className="prose-page">{children}</div>
          <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
            Questions about this page? Use the{" "}
            <Link href="/contact" className="font-semibold text-orange-700 underline underline-offset-2">
              contact form
            </Link>
            {site.email && (
              <>
                {" "}
                or email{" "}
                <a href={`mailto:${site.email}`} className="font-semibold text-orange-700 underline underline-offset-2">
                  {site.email}
                </a>
              </>
            )}
            .
          </p>
          <p className="mt-3 text-sm text-muted">
            {site.legalName || site.name}, {site.address}
          </p>
        </div>
      </div>
    </>
  );
}
