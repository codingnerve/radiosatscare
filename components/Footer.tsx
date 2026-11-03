import Link from "next/link";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { companyPages, legalPages, mailHref, servicePages, site, telHref } from "@/lib/site";

function Column({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.12em] !text-white">{title}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-navy-200 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="on-navy bg-navy-950 text-navy-200">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Independent assistance for in-car satellite radio. We are not a satellite radio provider and are not
            affiliated with, endorsed by or authorised by any provider or manufacturer.
          </p>
        </div>
        <Column title="Services" links={servicePages} />
        <Column title="Company" links={companyPages} />
        <div>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.12em] !text-white">Contact</h2>
          <ul className="space-y-3 text-sm">
            {telHref && (
              <li>
                <a href={telHref} className="inline-flex items-center gap-2 font-semibold text-white hover:text-orange-500">
                  <Icon name="phone" className="h-4 w-4" /> {site.phoneDisplay}
                </a>
              </li>
            )}
            {mailHref && (
              <li>
                <a href={mailHref} className="inline-flex items-center gap-2 hover:text-white">
                  <Icon name="mail" className="h-4 w-4" /> {site.email}
                </a>
              </li>
            )}
            {site.hours && (
              <li className="flex items-start gap-2">
                <Icon name="clock" className="mt-0.5 h-4 w-4 flex-none" /> {site.hours}
              </li>
            )}
            <li>
              <address className="flex items-start gap-2 not-italic">
                <Icon name="pin" className="mt-0.5 h-4 w-4 flex-none" />
                <span>
                  {site.legalName && <strong className="block font-semibold text-white">{site.legalName}</strong>}
                  {site.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </address>
            </li>
            <li>
              <Link href="/contact" className="font-semibold text-white underline underline-offset-4 hover:text-orange-500">
                Send an enquiry
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="container-page flex flex-col gap-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.year} {site.legalName || site.name}. All trademarks belong to their respective owners.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalPages.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
