"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { companyPages, servicePages, site, telHref } from "@/lib/site";

const linkClass =
  "rounded-md px-3 py-2 text-[0.9375rem] font-semibold text-navy-900 hover:bg-navy-50 aria-[current=page]:text-orange-700";

export function Header() {
  const pathname = usePathname();
  // Menus remember the page they were opened on, so they close by themselves after navigation.
  const [mobileOpenOn, setMobileOpenOn] = useState<string | null>(null);
  const [servicesOpenOn, setServicesOpenOn] = useState<string | null>(null);
  const mobileOpen = mobileOpenOn === pathname;
  const servicesOpen = servicesOpenOn === pathname;
  const setMobileOpen = (open: boolean) => setMobileOpenOn(open ? pathname : null);
  const setServicesOpen = (open: boolean) => setServicesOpenOn(open ? pathname : null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes menus; clicking outside closes the services popover.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mobileOpen) toggleRef.current?.focus();
      setMobileOpenOn(null);
      setServicesOpenOn(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpenOn(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [mobileOpen]);

  const current = (href: string) => (pathname === href ? "page" : undefined);
  const servicesActive = servicePages.some((s) => s.href === pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <div className="relative" ref={servicesRef}>
            <button
              type="button"
              className={`${linkClass} inline-flex items-center gap-1.5`}
              aria-expanded={servicesOpen}
              aria-controls="services-menu"
              aria-current={servicesActive ? "page" : undefined}
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              Services
              <svg
                viewBox="0 0 12 8"
                className={`h-2 w-3 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {servicesOpen && (
              <ul id="services-menu" className="card absolute left-0 top-full mt-2 w-64 p-2 shadow-lift">
                {servicePages.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      aria-current={current(s.href)}
                      className="block rounded-lg px-3 py-2.5 text-[0.9375rem] font-semibold text-navy-900 hover:bg-navy-50 aria-[current=page]:text-orange-700"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {companyPages.map((p) => (
            <Link key={p.href} href={p.href} aria-current={current(p.href)} className={linkClass}>
              {p.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {telHref ? (
            <a
              href={telHref}
              className="btn btn-primary !min-h-10 !px-4"
              aria-label={`Call us on ${site.phoneDisplay}`}
            >
              <Icon name="phone" className="h-4 w-4" />
              <span className="hidden sm:inline">{site.phoneDisplay}</span>
              <span className="sm:hidden">Call</span>
            </a>
          ) : (
            <Link href="/contact" className="btn btn-primary !min-h-10 !px-4">
              Contact us
            </Link>
          )}
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-navy-900 hover:bg-navy-50 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-white lg:hidden">
          <div className="container-page max-h-[calc(100dvh-4rem)] overflow-y-auto py-4">
            <p className="eyebrow mb-1 px-3">Services</p>
            <ul className="mb-3">
              {servicePages.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} aria-current={current(s.href)} className={`${linkClass} block py-3`}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mb-1 px-3">Company</p>
            <ul>
              {companyPages.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} aria-current={current(p.href)} className={`${linkClass} block py-3`}>
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
