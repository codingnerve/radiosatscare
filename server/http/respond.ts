import { errorBody, type ErrorCode } from "../utils/errors";

export const json = (status: number, body: unknown, headers?: HeadersInit): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(headers as Record<string, string> | undefined) },
  });

export const errorResponse = (status: number, code: ErrorCode, message: string, fields?: Record<string, string>): Response =>
  json(status, errorBody(code, message, fields));

/** Headers every API response carries. The API only ever returns JSON, so the CSP is fully locked down. */
export const API_SECURITY_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * The visitor's IP address, for rate limiting. Next.js does not expose the socket address, so it comes
 * from X-Forwarded-For, counted `hops` entries from the right. Entries further left can be forged by
 * the visitor and are ignored. With no trusted proxy it returns "unknown".
 */
export function clientIp(headers: Headers, hops: number): string {
  if (hops < 1) return "unknown";
  const parts = (headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const ip = parts[parts.length - hops];
  return ip ? ip.slice(0, 64) : "unknown";
}
