import { Icon } from "./Icon";
import { site, telHref } from "@/lib/site";

/**
 * Sticky call button for small screens. It is hidden by CSS while a form field has focus
 * (see globals.css), and the page reserves matching bottom padding, so it never covers inputs.
 */
export function MobileCallBar() {
  if (!telHref) return null;
  return (
    <div className="mobile-call-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <a href={telHref} className="btn btn-primary w-full" aria-label={`Call us on ${site.phoneDisplay}`}>
        <Icon name="phone" className="h-5 w-5" />
        Call {site.phoneDisplay}
      </a>
    </div>
  );
}
