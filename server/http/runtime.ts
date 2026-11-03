import { loadEnv } from "../config/env";
import { createMailer } from "../services/mailer";
import { createLogger } from "../utils/logger";
import { createApi, type ApiHandler } from "./api";

// Kept on globalThis so Next.js dev reloads do not reset rate-limit counters.
const shared = globalThis as typeof globalThis & { __rscApi?: ApiHandler };

/**
 * The production API handler, built lazily on the first request (never at import or build time,
 * so `next build` works without secrets). Throws a readable error if the environment is invalid.
 */
export function getApi(): ApiHandler {
  if (!shared.__rscApi) {
    const env = loadEnv();
    const logger = createLogger(env.logLevel);
    shared.__rscApi = createApi({ env, logger, mailer: createMailer(env, logger) });
  }
  return shared.__rscApi;
}
