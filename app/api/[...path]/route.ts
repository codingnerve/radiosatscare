import { connection } from "next/server";
import { getApi } from "@/server/http/runtime";

/**
 * The whole JSON API lives behind this one route: routing, validation, rate limiting, auth and
 * error handling are in server/http/api.ts. See docs/api-contract.md for the endpoints.
 */
async function handle(request: Request): Promise<Response> {
  // Opt out of prerendering: every API call is answered at request time.
  await connection();

  let api;
  try {
    api = getApi();
  } catch (err) {
    // Almost always a missing or invalid environment variable. Say so in the log, not to the visitor.
    process.stderr.write(`API configuration error: ${err instanceof Error ? err.message : String(err)}\n`);
    return Response.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong on our side. Please try again." } },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
  return api(request);
}

export {
  handle as GET,
  handle as POST,
  handle as PATCH,
  handle as PUT,
  handle as DELETE,
  handle as OPTIONS,
  handle as HEAD,
};
