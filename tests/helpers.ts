import { randomUUID } from "node:crypto";
import { createApi, type ApiHandler } from "../server/http/api";
import { loadEnv, type Env } from "../server/config/env";
import type { MailMessage, Mailer } from "../server/services/mailer";

export const TEST_ORIGIN = "http://localhost:3000";

export function testEnv(overrides: Record<string, string> = {}): Env {
  return loadEnv({
    NODE_ENV: "test",
    BUSINESS_EMAIL: "business@example.test",
    EMAIL_FROM: "no-reply@example.test",
    LOG_LEVEL: "silent",
    CORS_ORIGINS: TEST_ORIGIN,
    // Generous by default so unrelated tests never trip a limiter; limiter tests override these.
    RATE_LIMIT_ENQUIRY_MAX: "1000",
    RATE_LIMIT_GLOBAL_MAX: "100000",
    ...overrides,
  });
}

/** Mailer that records messages instead of sending them, and can be told to fail. */
export class RecordingMailer implements Mailer {
  sent: MailMessage[] = [];
  failWith: Error | undefined;

  async send(message: MailMessage): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.sent.push(message);
  }
}

export function buildApp(overrides: Record<string, string> = {}, mailer = new RecordingMailer()) {
  const env = testEnv(overrides);
  const app: ApiHandler = createApi({ env, mailer });
  return { app, env, mailer };
}

export function validEnquiry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    fullName: "Alex Driver",
    email: "Alex@Example.test",
    phone: "+1 (555) 010-0199",
    vehicle: "2021 Example Estate",
    radioType: "",
    issueCategory: "activation",
    message: "My radio shows an activation message and I would like some help.",
    preferredContact: "phone",
    consent: true,
    website: "",
    startedAt: Date.now() - 10_000,
    submissionId: randomUUID(),
    ...overrides,
  };
}
