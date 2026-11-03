import { afterAll, describe, expect, it, vi } from "vitest";
import { Limiter } from "../server/http/rate-limit";
import { clientIp } from "../server/http/respond";
import { buildApp, validEnquiry } from "./helpers";
import request from "./http";

describe("clientIp", () => {
  const h = (xff?: string) => new Headers(xff ? { "x-forwarded-for": xff } : {});

  it("reads the entry the trusted proxy added, counted from the right", () => {
    expect(clientIp(h("203.0.113.9"), 1)).toBe("203.0.113.9");
    // The visitor can forge the left side; only the last hop (added by our proxy) counts.
    expect(clientIp(h("6.6.6.6, 203.0.113.9"), 1)).toBe("203.0.113.9");
    expect(clientIp(h("6.6.6.6, 10.0.0.1, 203.0.113.9"), 2)).toBe("10.0.0.1");
  });

  it("returns unknown when no proxy is trusted or the header is missing", () => {
    expect(clientIp(h("203.0.113.9"), 0)).toBe("unknown");
    expect(clientIp(h(), 1)).toBe("unknown");
    expect(clientIp(h("203.0.113.9"), 3)).toBe("unknown");
  });
});

describe("Limiter", () => {
  afterAll(() => vi.useRealTimers());

  it("counts per key, resets after the window, and supports refunds", () => {
    vi.useFakeTimers();
    const limiter = new Limiter({ windowMs: 1000, limit: 2, message: "x" });
    expect(limiter.hit("a").allowed).toBe(true);
    expect(limiter.hit("a").allowed).toBe(true);
    const blocked = limiter.hit("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.headers["Retry-After"]).toBeDefined();
    expect(limiter.hit("b").allowed).toBe(true); // other visitors are unaffected

    limiter.refund("a");
    expect(limiter.hit("a").allowed).toBe(false); // refund only gave back the over-limit hit

    vi.advanceTimersByTime(1001);
    expect(limiter.hit("a").allowed).toBe(true);
  });
});

describe("per-visitor rate limiting through the API", () => {
  it("limits each forwarded IP separately and ignores forged left-hand entries", async () => {
    const { app } = buildApp({ TRUST_PROXY: "1", RATE_LIMIT_ENQUIRY_MAX: "1" });
    const send = (xff: string, overrides: Record<string, unknown> = {}) =>
      request(app).post("/api/enquiries").set("X-Forwarded-For", xff).send(validEnquiry(overrides));

    expect((await send("198.51.100.1")).status).toBe(201);
    expect((await send("198.51.100.1", { email: "second@example.test" })).status).toBe(429);
    // A different visitor still gets through.
    expect((await send("198.51.100.2", { email: "third@example.test" })).status).toBe(201);
    // Forging extra entries on the left does not give the first visitor a fresh allowance.
    expect((await send("7.7.7.7, 198.51.100.1", { email: "fourth@example.test" })).status).toBe(429);
  });
});
