/**
 * Central site configuration. Contact details come from environment variables so that
 * nothing is invented in code. Every value is optional: UI that depends on a missing value
 * is hidden rather than filled with a placeholder.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so rebuild after changing them.
 */

const clean = (value: string | undefined) => value?.trim() ?? "";

/** Keep only characters that are valid in a tel: URL. */
const toTelNumber = (value: string) => value.replace(/[^\d+]/g, "");

const phoneRaw = clean(process.env.NEXT_PUBLIC_SUPPORT_PHONE);
const phone = toTelNumber(phoneRaw);

/** Business postal address. Single source for the footer, Contact, About, legal pages and structured data. */
export const businessAddress = {
  street: "2222 West Grand River Avenue",
  city: "Okemos",
  region: "MI",
  postalCode: "48864",
  country: "US",
} as const;

const addressLines = [
  businessAddress.street,
  `${businessAddress.city.toUpperCase()}, ${businessAddress.region} ${businessAddress.postalCode}`,
] as const;

export const site = {
  name: "RadioSatCare",
  tagline: "Independent car satellite radio assistance",
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) || "https://radiosatscare.com").replace(/\/+$/, ""),
  /** E.164-style number used in tel: links. Empty when not configured. */
  phone,
  /** Human readable number; falls back to the raw configured value. */
  phoneDisplay: clean(process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY) || phoneRaw,
  email: clean(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
  hours: clean(process.env.NEXT_PUBLIC_SUPPORT_HOURS),
  legalName: clean(process.env.NEXT_PUBLIC_BUSINESS_LEGAL_NAME),
  /** Address as separate display lines, and as a single comma-separated string. */
  addressLines,
  address: addressLines.join(", "),
  jurisdiction: clean(process.env.NEXT_PUBLIC_BUSINESS_JURISDICTION),
  year: clean(process.env.NEXT_PUBLIC_BUILD_YEAR) || "2026",
} as const;

export const telHref = site.phone ? `tel:${site.phone}` : "";
export const mailHref = site.email ? `mailto:${site.email}` : "";

/** Pages shown in navigation, footer and sitemap. */
export const servicePages = [
  { href: "/radio-activation", label: "Radio activation" },
  { href: "/signal-support", label: "Signal & reception" },
  { href: "/channel-assistance", label: "Missing channels" },
  { href: "/subscription-support", label: "Subscription enquiries" },
] as const;

export const companyPages = [
  { href: "/about", label: "About us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export const legalPages = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms-and-conditions", label: "Terms & conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
] as const;
