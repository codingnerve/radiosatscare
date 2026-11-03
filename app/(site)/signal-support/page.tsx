import type { Metadata } from "next";
import { ServicePage } from "@/components/ServicePage";
import { serviceBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = serviceBySlug("signal-support")!;

export const metadata: Metadata = pageMetadata({
  title: service.metaTitle,
  description: service.metaDescription,
  path: service.href,
});

export default function Page() {
  return <ServicePage service={service} />;
}
