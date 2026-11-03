import nodemailer from "nodemailer";
import type { Env } from "../config/env";
import type { Logger } from "../utils/logger";

export interface MailMessage {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: { email: string; name?: string };
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

const SEND_TIMEOUT_MS = 8000;

/** Development transport: records that an email would have been sent, never its content. */
function createLogMailer(logger: Logger): Mailer {
  return {
    async send(message) {
      logger.info("email (log provider, not delivered)", {
        subject: message.subject,
        recipientCount: message.to.length,
      });
    },
  };
}

function createBrevoMailer(env: Env): Mailer {
  const apiKey = env.brevoApiKey ?? "";
  return {
    async send(message) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: env.emailFromName, email: env.emailFrom },
          to: message.to.map((email) => ({ email })),
          ...(message.replyTo ? { replyTo: { email: message.replyTo.email, name: message.replyTo.name } } : {}),
          subject: message.subject,
          htmlContent: message.html,
          textContent: message.text,
        }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });
      if (!response.ok) {
        // Only the status code is kept: the response body can echo recipient details.
        throw new Error(`Brevo API responded with status ${response.status}`);
      }
    },
  };
}

function createSmtpMailer(env: Env): Mailer {
  const transport = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass ?? "" } : undefined,
    connectionTimeout: SEND_TIMEOUT_MS,
    greetingTimeout: SEND_TIMEOUT_MS,
    socketTimeout: SEND_TIMEOUT_MS,
  });
  return {
    async send(message) {
      await transport.sendMail({
        from: { name: env.emailFromName, address: env.emailFrom },
        to: message.to,
        replyTo: message.replyTo ? { name: message.replyTo.name ?? "", address: message.replyTo.email } : undefined,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
    },
  };
}

export function createMailer(env: Env, logger: Logger): Mailer {
  switch (env.emailProvider) {
    case "brevo":
      return createBrevoMailer(env);
    case "smtp":
      return createSmtpMailer(env);
    default:
      return createLogMailer(logger);
  }
}
