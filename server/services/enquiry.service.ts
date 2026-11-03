import type { Env } from "../config/env";
import type { Enquiry } from "../enquiry-types";
import type { EnquiryInput } from "../validation/enquiry.schema";
import { AppError } from "../utils/errors";
import type { Logger } from "../utils/logger";
import { contentFingerprint, generateReference } from "../utils/text";
import { renderBusinessNotification } from "./email.templates";
import type { Mailer } from "./mailer";

export const MIN_FILL_MS = 2000;
export const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

export interface SubmitResult {
  reference: string;
  duplicate: boolean;
}

export interface EnquiryService {
  submit(input: EnquiryInput): Promise<SubmitResult>;
}

interface Deps {
  env: Env;
  mailer: Mailer;
  logger: Logger;
}

/**
 * Turns a validated enquiry into an email to the business. Nothing is stored: if the email cannot be
 * sent the visitor is told so (they can retry or call), because there is no other copy.
 *
 * Duplicate protection (double clicks, repeated submissions) is kept in memory for ten minutes.
 */
export function createEnquiryService({ env, mailer, logger }: Deps): EnquiryService {
  /** Recently delivered enquiries, by submission id and by content fingerprint. */
  const delivered = new Map<string, { reference: string; expiresAt: number }>();
  /** Submissions being sent right now, so a concurrent repeat waits for the first instead of sending twice. */
  const inFlight = new Map<string, Promise<string>>();
  let lastSweep = Date.now();

  const sweep = (now: number) => {
    if (now - lastSweep < 60_000) return;
    lastSweep = now;
    for (const [key, entry] of delivered) if (entry.expiresAt <= now) delivered.delete(key);
  };

  const recent = (key: string, now: number) => {
    const entry = delivered.get(key);
    return entry && entry.expiresAt > now ? entry.reference : undefined;
  };

  async function deliver(input: EnquiryInput, idKey: string, contentKey: string): Promise<string> {
    const enquiry: Enquiry = {
      reference: generateReference(),
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      vehicle: input.vehicle,
      radioType: input.radioType,
      issueCategory: input.issueCategory,
      message: input.message,
      preferredContact: input.preferredContact,
    };
    try {
      await mailer.send({ to: [env.businessEmail], ...renderBusinessNotification(enquiry) });
    } catch (err) {
      logger.error("enquiry email failed", { err, reference: enquiry.reference });
      throw AppError.sendFailed();
    }
    // Remember only successful deliveries, so a retry after a failure really does send again.
    const expiresAt = Date.now() + DUPLICATE_WINDOW_MS;
    delivered.set(idKey, { reference: enquiry.reference, expiresAt });
    delivered.set(contentKey, { reference: enquiry.reference, expiresAt });
    return enquiry.reference;
  }

  return {
    async submit(input) {
      // Time trap. A start time in the future means the visitor's clock is off, so it cannot be judged.
      const elapsed = Date.now() - input.startedAt;
      if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
        throw new AppError(400, "TOO_FAST", "Please take a moment to review your message and send it again.");
      }

      const now = Date.now();
      sweep(now);
      const idKey = `id:${input.submissionId}`;
      const contentKey = `content:${contentFingerprint(input.email, input.issueCategory, input.message)}`;

      const earlier = recent(idKey, now) ?? recent(contentKey, now);
      if (earlier) return { reference: earlier, duplicate: true };

      const pending = inFlight.get(idKey);
      if (pending) return { reference: await pending, duplicate: true };

      const sending = deliver(input, idKey, contentKey);
      inFlight.set(idKey, sending);
      try {
        return { reference: await sending, duplicate: false };
      } finally {
        inFlight.delete(idKey);
      }
    },
  };
}
