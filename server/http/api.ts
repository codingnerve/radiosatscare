import { randomUUID } from "node:crypto";
import type { Env } from "../config/env";
import { createEnquiryService } from "../services/enquiry.service";
import type { Mailer } from "../services/mailer";
import { AppError, errorBody } from "../utils/errors";
import { createLogger, type Logger } from "../utils/logger";
import { generateReference } from "../utils/text";
import { parseOrThrow } from "../validation/common";
import { enquirySchema } from "../validation/enquiry.schema";
import { createRateLimiters, type LimitResult, type Limiter } from "./rate-limit";
import { API_SECURITY_HEADERS, clientIp, errorResponse, json } from "./respond";

export interface ApiDeps {
  env: Env;
  mailer: Mailer;
  logger?: Logger;
  /** Optional hook run before each request is routed (a place for lazy start-up work). */
  connect?: () => Promise<void>;
}

/** Handles one request to /api/*. Pure Web Request in, Web Response out, so it runs in Next.js and in tests. */
export type ApiHandler = (request: Request) => Promise<Response>;

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const MAX_BODY_BYTES = 20 * 1024;

/** Real visitors never see or fill the hidden "website" field, so any value means a bot. */
function honeypotTripped(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>).website;
  return typeof value === "string" && value.trim() !== "";
}

function hostOf(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  if (SAFE_METHODS.has(request.method)) return {};
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("json")) return {};
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) throw AppError.validation("The request is too large.");
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw AppError.validation("The request is too large.");
  if (text.trim() === "") return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw AppError.validation("The request body must be valid JSON.");
  }
}

/** Which limiter (if any) a request counted against, so it can be refunded once the outcome is known. */
interface RequestState {
  limiter?: Limiter;
}

export function createApi({ env, mailer, logger = createLogger(env.logLevel), connect }: ApiDeps): ApiHandler {
  const limiters = createRateLimiters(env);
  const enquiryService = createEnquiryService({ env, mailer, logger });
  const allowedOrigins = new Set(env.corsOrigins);

  const tooManyRequests = (limiter: Limiter, hit: LimitResult) =>
    json(429, errorBody("RATE_LIMITED", limiter.options.message), hit.headers);

  const corsHeaders = (origin: string | null): Record<string, string> =>
    origin && allowedOrigins.has(origin)
      ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true", Vary: "Origin" }
      : { Vary: "Origin" };

  async function route(request: Request, url: URL, path: string, ip: string, state: RequestState): Promise<Response> {
    const method = request.method === "HEAD" ? "GET" : request.method;
    const origin = request.headers.get("origin");

    // CORS preflight is answered before anything else.
    if (method === "OPTIONS") {
      const allowed = origin !== null && allowedOrigins.has(origin);
      return new Response(null, {
        status: 204,
        headers: allowed
          ? {
              ...corsHeaders(origin),
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Max-Age": "600",
            }
          : { Vary: "Origin" },
      });
    }

    // Defence in depth on top of CORS: a state-changing request naming a foreign origin is refused outright.
    // The site's own origin is always fine: it is either on the allow-list or matches the host the request
    // was sent to (which is what makes local development and any deployment hostname work without setup).
    // A page on another site cannot forge that match: browsers set Origin, and it would name the other site.
    if (origin && !SAFE_METHODS.has(method) && !allowedOrigins.has(origin) && hostOf(origin) !== url.host) {
      throw AppError.forbidden("Origin not allowed");
    }

    const global = limiters.global.hit(ip);
    if (!global.allowed) return tooManyRequests(limiters.global, global);

    const body = await readJsonBody(request);

    if (method === "GET" && path === "/health") return json(200, { status: "ok" });

    if (method === "POST" && path === "/enquiries") {
      const hit = limiters.enquiry.hit(ip);
      if (!hit.allowed) return tooManyRequests(limiters.enquiry, hit);
      state.limiter = limiters.enquiry; // allowed: refunded later if the request turns out to be invalid

      if (honeypotTripped(body)) {
        // Pretend it worked so the bot learns nothing, but send nothing.
        logger.info("honeypot tripped, enquiry discarded");
        return json(201, { ok: true, reference: generateReference() });
      }
      const input = parseOrThrow(enquirySchema, body);
      const result = await enquiryService.submit(input);
      return json(result.duplicate ? 200 : 201, {
        ok: true,
        reference: result.reference,
        ...(result.duplicate ? { duplicate: true } : {}),
      });
    }

    return errorResponse(404, "NOT_FOUND", "Not found");
  }

  return async function handle(request: Request): Promise<Response> {
    const started = performance.now();
    const requestId = randomUUID();
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api(?=\/|$)/, "") || "/";
    const ip = clientIp(request.headers, env.trustProxy);

    const state: RequestState = {};
    let response: Response;
    try {
      await connect?.();
      response = await route(request, url, path, ip, state);
    } catch (err) {
      if (err instanceof AppError) {
        response = errorResponse(err.status, err.code, err.message, err.fields);
      } else {
        logger.error("unhandled error", { err, requestId, method: request.method, path });
        response = errorResponse(500, "INTERNAL_ERROR", "Something went wrong on our side. Please try again.");
      }
    }

    // Invalid or failed enquiries do not use up the visitor's allowance. This is decided from the final
    // response, whether a handler returned it or threw an error that became it.
    const { limiter } = state;
    if (limiter && response.status >= 400 && limiter.options.skipFailedRequests) limiter.refund(ip);

    for (const [name, value] of Object.entries({ ...API_SECURITY_HEADERS, ...corsHeaders(request.headers.get("origin")) })) {
      if (!response.headers.has(name)) response.headers.set(name, value);
    }
    response.headers.set("X-Request-Id", requestId);

    // Bodies and headers are never logged: only method, path (no query string), status and timing.
    const log = path === "/health" ? logger.debug : logger.info;
    log("request", {
      requestId,
      method: request.method,
      path: url.pathname,
      status: response.status,
      ms: Math.round(performance.now() - started),
    });
    return response;
  };
}
