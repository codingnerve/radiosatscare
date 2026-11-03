/**
 * Minimal structured logger. It never receives request bodies, and everything passed to it is
 * scrubbed: sensitive keys are replaced, and email addresses / database credentials inside
 * strings are masked.
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

const SENSITIVE_KEY =
  /pass(word)?|secret|token|authorization|cookie|api[-_]?key|e-?mail|phone|mobile|^to$|^cc$|^bcc$|reply-?to|mongodb|^uri$|^ip$|full-?name|^message$|^body$/i;

const EMAIL_IN_TEXT = /[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+/g;
const DB_URI = /mongodb(?:\+srv)?:\/\/\S+/gi;

export function scrubString(value: string): string {
  return value.replace(DB_URI, "mongodb://[redacted]").replace(EMAIL_IN_TEXT, "[redacted-email]");
}

export function describeError(err: unknown): Record<string, unknown> {
  if (!(err instanceof Error)) return { error: scrubString(String(err)).slice(0, 300) };
  const code = (err as { code?: unknown }).code;
  return {
    name: err.name,
    message: scrubString(err.message).slice(0, 300),
    ...(typeof code === "string" || typeof code === "number" ? { code } : {}),
    ...(process.env.NODE_ENV === "production" || !err.stack ? {} : { stack: scrubString(err.stack) }),
  };
}

export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return scrubString(value).slice(0, 500);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Error) return describeError(value);
  if (depth > 4) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY.test(k) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export function createLogger(level: LogLevel = "info"): Logger {
  const threshold = ORDER[level];
  const write = (lvl: Exclude<LogLevel, "silent">, msg: string, meta?: Record<string, unknown>) => {
    if (ORDER[lvl] < threshold) return;
    const line = JSON.stringify({
      level: lvl,
      time: new Date().toISOString(),
      msg,
      ...(meta ? (redact(meta) as Record<string, unknown>) : {}),
    });
    (lvl === "error" || lvl === "warn" ? process.stderr : process.stdout).write(`${line}\n`);
  };
  return {
    debug: (m, meta) => write("debug", m, meta),
    info: (m, meta) => write("info", m, meta),
    warn: (m, meta) => write("warn", m, meta),
    error: (m, meta) => write("error", m, meta),
  };
}
