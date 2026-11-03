import type { MetadataRoute } from "next";
import { companyPages, legalPages, servicePages, site } from "@/lib/site";

// Fixed date: "now" is not allowed during prerendering with Cache Components. Bump when content changes.
const LAST_MODIFIED = new Date("2026-10-23T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number, changeFrequency: "monthly" | "yearly") => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
  });

  return [
    entry("/", 1, "monthly"),
    ...servicePages.map((p) => entry(p.href, 0.9, "monthly")),
    ...companyPages.map((p) => entry(p.href, p.href === "/contact" ? 0.9 : 0.7, "monthly")),
    ...legalPages.map((p) => entry(p.href, 0.3, "yearly")),
  ];
}
