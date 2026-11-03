import { Icon } from "./Icon";
import { mailHref, site, telHref } from "@/lib/site";

/** Slim top bar. Shows only the contact details that are actually configured. */
export function SupportBar() {
  const hasContact = Boolean(telHref || mailHref);
  return (
    <div className="bg-navy-950 text-sm text-navy-100">
      <div className="container-page flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <p className="flex items-center gap-2">
          <Icon name="shield" className="h-4 w-4 text-orange-500" />
          <span>
            Independent assistance service{" "}
            <span className="hidden sm:inline">· not affiliated with any radio provider</span>
          </span>
        </p>
        {hasContact && (
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {telHref && (
              <a href={telHref} className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-orange-500">
                <Icon name="phone" className="h-4 w-4" />
                {site.phoneDisplay}
              </a>
            )}
            {site.hours && (
              <span className="hidden items-center gap-1.5 md:inline-flex">
                <Icon name="clock" className="h-4 w-4" />
                {site.hours}
              </span>
            )}
            {!telHref && mailHref && (
              <a href={mailHref} className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-orange-500">
                <Icon name="mail" className="h-4 w-4" />
                {site.email}
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
