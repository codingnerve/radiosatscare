import type { Env } from "../config/env";

interface Bucket {
  count: number;
  resetAt: number;
}

export interface LimiterOptions {
  windowMs: number;
  limit: number;
  message: string;
  /** Give the hit back when the request fails (status >= 400), so honest mistakes are free. */
  skipFailedRequests?: boolean;
}

export interface LimitResult {
  allowed: boolean;
  /** Draft-7 RateLimit headers describing the allowance. */
  headers: Record<string, string>;
}

/**
 * Fixed-window, in-memory limiter keyed by visitor IP. Counts live in this process only, which is
 * right for the documented single-instance deployment. Running several instances would need a
 * shared store such as Redis.
 */
export class Limiter {
  private readonly buckets = new Map<string, Bucket>();
  private lastSweep = Date.now();

  constructor(readonly options: LimiterOptions) {}

  hit(key: string): LimitResult {
    const now = Date.now();
    this.sweep(now);
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + this.options.windowMs };
      this.buckets.set(key, bucket);
    }
    bucket.count++;
    const { limit, windowMs } = this.options;
    const resetSeconds = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      allowed: bucket.count <= limit,
      headers: {
        "RateLimit": `limit=${limit}, remaining=${Math.max(0, limit - bucket.count)}, reset=${resetSeconds}`,
        "RateLimit-Policy": `${limit};w=${Math.round(windowMs / 1000)}`,
        ...(bucket.count > limit ? { "Retry-After": String(resetSeconds) } : {}),
      },
    };
  }

  /** Undo a hit (used for skipFailedRequests). */
  refund(key: string): void {
    const bucket = this.buckets.get(key);
    if (bucket && bucket.count > 0) bucket.count--;
  }

  /** Forget expired buckets so memory use stays bounded. */
  private sweep(now: number): void {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) if (bucket.resetAt <= now) this.buckets.delete(key);
  }
}

export interface RateLimiters {
  global: Limiter;
  enquiry: Limiter;
}

export function createRateLimiters(env: Env): RateLimiters {
  const { rateLimit: cfg } = env;
  return {
    global: new Limiter({
      windowMs: cfg.globalWindowMs,
      limit: cfg.globalMax,
      message: "Too many requests. Please slow down and try again shortly.",
    }),
    // Requests rejected by validation do not use up a visitor's allowance, so fixing a typo is never penalised.
    enquiry: new Limiter({
      windowMs: cfg.enquiryWindowMs,
      limit: cfg.enquiryMax,
      message: "You have sent several enquiries recently. Please try again later or call us.",
      skipFailedRequests: true,
    }),
  };
}
