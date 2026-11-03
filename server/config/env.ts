import { z } from "zod";

const optionalString = z.string().optional();

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Extra browser origins allowed to call the API. The site's own origin is always allowed.
  CORS_ORIGINS: z.string().optional(),
  // Reverse proxies in front of the app. Defaults to 1 in production (Nginx) and 0 otherwise.
  TRUST_PROXY: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["brevo", "smtp", "log"]).default("log"),
  BREVO_API_KEY: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  BUSINESS_EMAIL: z.email("BUSINESS_EMAIL must be a valid email address"),
  EMAIL_FROM: z.email("EMAIL_FROM must be a valid email address"),
  EMAIL_FROM_NAME: z.string().min(1).default("RadioSatCare"),
  RATE_LIMIT_ENQUIRY_MAX: z.coerce.number().int().min(1).default(5),
  RATE_LIMIT_ENQUIRY_WINDOW_MINUTES: z.coerce.number().min(1).default(60),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().min(1).default(300),
  RATE_LIMIT_GLOBAL_WINDOW_MINUTES: z.coerce.number().min(1).default(15),
  // Shared with the website, so the site address is configured once.
  SITE_URL: z.url().optional(),
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "silent"]).default("info"),
});

export interface Env {
  nodeEnv: "development" | "test" | "production";
  /** Origins allowed to call the API: the site's own origin plus any CORS_ORIGINS. */
  corsOrigins: string[];
  /** Reverse proxies in front of the app. The client IP is read that many hops from the right of X-Forwarded-For. */
  trustProxy: number;
  emailProvider: "brevo" | "smtp" | "log";
  brevoApiKey?: string;
  smtp: { host?: string; port: number; secure: boolean; user?: string; pass?: string };
  businessEmail: string;
  emailFrom: string;
  emailFromName: string;
  rateLimit: {
    enquiryMax: number;
    enquiryWindowMs: number;
    globalMax: number;
    globalWindowMs: number;
  };
  siteUrl: string;
  logLevel: "debug" | "info" | "warn" | "error" | "silent";
}

function parseTrustProxy(value: string | undefined, nodeEnv: string): number {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "") return nodeEnv === "production" ? 1 : 0;
  if (v === "false") return 0;
  // "true" would trust every hop and let clients spoof their IP; use a hop count instead.
  if (v === "true") return 1;
  if (/^\d+$/.test(v)) return Number(v);
  throw new Error("Invalid environment configuration:\n  - TRUST_PROXY: must be a number of proxy hops such as 0 or 1");
}

/** Parse and validate environment variables. Throws a readable error listing every problem. */
export function loadEnv(source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): Env {
  // Treat empty strings (e.g. "BREVO_API_KEY=" copied from .env.example) as unset.
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, v]) => v !== undefined && v !== ""),
  );
  const parsed = rawEnvSchema
    .superRefine((e, ctx) => {
      if (e.EMAIL_PROVIDER === "brevo" && !e.BREVO_API_KEY) {
        ctx.addIssue({ code: "custom", path: ["BREVO_API_KEY"], message: "Required when EMAIL_PROVIDER=brevo" });
      }
      if (e.EMAIL_PROVIDER === "smtp" && !e.SMTP_HOST) {
        ctx.addIssue({ code: "custom", path: ["SMTP_HOST"], message: "Required when EMAIL_PROVIDER=smtp" });
      }
      if (e.NODE_ENV === "production" && e.EMAIL_PROVIDER === "log") {
        // Enquiries are only delivered by email, so "log" in production would silently lose every one.
        ctx.addIssue({
          code: "custom",
          path: ["EMAIL_PROVIDER"],
          message: 'Must be "brevo" or "smtp" in production. "log" does not deliver enquiries',
        });
      }
    })
    .safeParse(cleaned);

  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "env"}: ${i.message}`);
    throw new Error(`Invalid environment configuration:\n${lines.join("\n")}`);
  }

  const e = parsed.data;
  const siteUrl = (e.SITE_URL ?? e.NEXT_PUBLIC_SITE_URL ?? "https://radiosatscare.com").replace(/\/$/, "");
  const extraOrigins = (e.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return {
    nodeEnv: e.NODE_ENV,
    corsOrigins: [...new Set([new URL(siteUrl).origin, ...extraOrigins])],
    trustProxy: parseTrustProxy(e.TRUST_PROXY, e.NODE_ENV),
    emailProvider: e.EMAIL_PROVIDER,
    brevoApiKey: e.BREVO_API_KEY,
    smtp: {
      host: e.SMTP_HOST,
      port: e.SMTP_PORT,
      secure: e.SMTP_SECURE ? e.SMTP_SECURE === "true" : e.SMTP_PORT === 465,
      user: e.SMTP_USER,
      pass: e.SMTP_PASS,
    },
    businessEmail: e.BUSINESS_EMAIL,
    emailFrom: e.EMAIL_FROM,
    emailFromName: e.EMAIL_FROM_NAME,
    rateLimit: {
      enquiryMax: e.RATE_LIMIT_ENQUIRY_MAX,
      enquiryWindowMs: e.RATE_LIMIT_ENQUIRY_WINDOW_MINUTES * 60_000,
      globalMax: e.RATE_LIMIT_GLOBAL_MAX,
      globalWindowMs: e.RATE_LIMIT_GLOBAL_WINDOW_MINUTES * 60_000,
    },
    siteUrl,
    logLevel: e.LOG_LEVEL,
  };
}
