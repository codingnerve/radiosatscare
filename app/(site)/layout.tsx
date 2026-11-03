import { JsonLd } from "@/components/blocks";
import { SiteShell } from "@/components/SiteShell";
import { organizationLd, websiteLd } from "@/lib/seo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <JsonLd data={organizationLd()} />
      <JsonLd data={websiteLd()} />
      {children}
    </SiteShell>
  );
}
