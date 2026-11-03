import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileCallBar } from "./MobileCallBar";
import { SupportBar } from "./SupportBar";
import { telHref } from "@/lib/site";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-navy-900 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <SupportBar />
      <Header />
      <main id="main" className={telHref ? "pb-20 md:pb-0" : ""}>
        {children}
      </main>
      <Footer />
      <MobileCallBar />
    </>
  );
}
