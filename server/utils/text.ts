import { createHash, randomInt } from "node:crypto";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

/** Escape user text and keep its line breaks, for use inside HTML emails. */
export function escapeHtmlMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

/** Strip CR/LF so a value can never inject extra header lines. */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O, 1/I/L

export function generateReference(): string {
  let id = "";
  for (let i = 0; i < 6; i++) id += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return `RSC-${id}`;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Fingerprint of an enquiry's content, used to spot identical re-submissions. */
export function contentFingerprint(email: string, category: string, message: string): string {
  const normalised = message.toLowerCase().replace(/\s+/g, " ").trim();
  return sha256(`${email}|${category}|${normalised}`);
}

