import type { z } from "zod";
import { AppError } from "../utils/errors";

/** Parse with a schema, or throw a VALIDATION_ERROR carrying a field -> message map. */
export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown, summary = "Please check the highlighted fields"): z.output<S> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "_";
    if (!(key in fields)) fields[key] = issue.message;
  }
  throw AppError.validation(summary, fields);
}

/**
 * True when the text contains control characters. Multi-line fields may keep tab, LF and CR;
 * single-line fields may not contain any.
 */
export function hasControlChars(value: string, allowWhitespace = false): boolean {
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 0x7f) return true;
    if (code < 0x20 && !(allowWhitespace && (code === 0x09 || code === 0x0a || code === 0x0d))) return true;
  }
  return false;
}

export const noControlChars = (value: string): boolean => !hasControlChars(value);
export const noControlCharsMultiline = (value: string): boolean => !hasControlChars(value, true);

/** Treat blank strings from optional form inputs as "not provided". */
export const blankToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

