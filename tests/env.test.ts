import { describe, expect, it } from "vitest";
import { loadEnv } from "../server/config/env";

const base = {
  BUSINESS_EMAIL: "inbox@example.test",
  EMAIL_FROM: "no-reply@example.test",
};

describe("loadEnv", () => {
  it("applies safe defaults", () => {
    const env = loadEnv(base);
    expect(env.emailProvider).toBe("log");
    expect(env.trustProxy).toBe(0);
    expect(env.rateLimit.enquiryMax).toBe(5);
    expect(env.rateLimit.enquiryWindowMs).toBe(60 * 60 * 1000);
    // The site's own origin is always allowed, with nothing else unless CORS_ORIGINS adds it.
    expect(env.corsOrigins).toEqual(["https://radiosatscare.com"]);
  });

  it("parses origin lists and proxy hops", () => {
    const env = loadEnv({
      ...base,
      EMAIL_PROVIDER: "smtp",
      SMTP_HOST: "smtp.example.test",
      NODE_ENV: "production",
      CORS_ORIGINS: "https://a.test/, https://b.test",
      TRUST_PROXY: "1",
    });
    expect(env.corsOrigins).toEqual(["https://radiosatscare.com", "https://a.test", "https://b.test"]);
    expect(env.trustProxy).toBe(1);
  });

  it("trusts one proxy hop by default in production only, and rejects non-numeric values", () => {
    const prod = { ...base, NODE_ENV: "production", EMAIL_PROVIDER: "smtp", SMTP_HOST: "smtp.example.test" };
    expect(loadEnv(prod).trustProxy).toBe(1);
    expect(loadEnv({ ...prod, TRUST_PROXY: "0" }).trustProxy).toBe(0);
    expect(loadEnv({ ...base, TRUST_PROXY: "true" }).trustProxy).toBe(1);
    expect(() => loadEnv({ ...base, TRUST_PROXY: "loopback" })).toThrow(/TRUST_PROXY/);
  });

  it("uses the public site URL shared with the website", () => {
    const env = loadEnv({ ...base, NEXT_PUBLIC_SITE_URL: "https://example.test/" });
    expect(env.siteUrl).toBe("https://example.test");
    expect(env.corsOrigins).toEqual(["https://example.test"]);
  });

  it("treats empty values from a copied .env.example as unset", () => {
    expect(loadEnv({ ...base, BREVO_API_KEY: "", SMTP_HOST: "", TRUST_PROXY: "" }).emailProvider).toBe("log");
  });

  it("lists every problem at once", () => {
    expect(() => loadEnv({ BUSINESS_EMAIL: "nope" })).toThrowError(/BUSINESS_EMAIL[\s\S]*EMAIL_FROM/);
  });

  it("requires provider credentials for the chosen email provider", () => {
    expect(() => loadEnv({ ...base, EMAIL_PROVIDER: "brevo" })).toThrowError(/BREVO_API_KEY/);
    expect(() => loadEnv({ ...base, EMAIL_PROVIDER: "smtp" })).toThrowError(/SMTP_HOST/);
    expect(loadEnv({ ...base, EMAIL_PROVIDER: "brevo", BREVO_API_KEY: "k" }).emailProvider).toBe("brevo");
  });

  it('refuses EMAIL_PROVIDER=log in production, because enquiries would be silently lost', () => {
    expect(() => loadEnv({ ...base, NODE_ENV: "production" })).toThrowError(/EMAIL_PROVIDER[\s\S]*does not deliver/);
    expect(loadEnv({ ...base, NODE_ENV: "production", EMAIL_PROVIDER: "brevo", BREVO_API_KEY: "k" }).emailProvider).toBe("brevo");
  });
});
