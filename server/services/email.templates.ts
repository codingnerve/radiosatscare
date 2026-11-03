import type { Enquiry, IssueCategory } from "../enquiry-types";
import type { MailMessage } from "./mailer";
import { escapeHtml, escapeHtmlMultiline, singleLine } from "../utils/text";

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  activation: "Radio activation",
  signal: "Signal and reception",
  channels: "Missing channels",
  subscription: "Subscription enquiry",
  other: "Other",
};

const row = (label: string, value: string) =>
  `<tr><td style="padding:6px 12px 6px 0;color:#5b6577;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
  `<td style="padding:6px 0;color:#0b1b34">${value}</td></tr>`;

/** Email to the business inbox. Every user-supplied value is HTML-escaped. */
export function renderBusinessNotification(enquiry: Enquiry): Omit<MailMessage, "to"> {
  const category = CATEGORY_LABELS[enquiry.issueCategory];
  const prefers = enquiry.preferredContact === "phone" ? "A phone call" : "Email";
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#0b1b34">` +
    `<h2 style="margin:0 0 12px;font-size:18px">New enquiry ${escapeHtml(enquiry.reference)}</h2>` +
    `<table style="border-collapse:collapse">` +
    row("Category", escapeHtml(category)) +
    row("Name", escapeHtml(enquiry.fullName)) +
    row("Email", escapeHtml(enquiry.email)) +
    row("Phone", escapeHtml(enquiry.phone)) +
    row("Prefers", escapeHtml(prefers)) +
    (enquiry.vehicle ? row("Vehicle", escapeHtml(enquiry.vehicle)) : "") +
    (enquiry.radioType ? row("Radio / provider", escapeHtml(enquiry.radioType)) : "") +
    `</table>` +
    `<p style="margin:16px 0 4px;color:#5b6577">Message</p>` +
    `<div style="padding:12px;border:1px solid #d9dee7;border-radius:6px;background:#f7f9fc">${escapeHtmlMultiline(enquiry.message)}</div>` +
    `<p style="margin:16px 0 0;color:#5b6577">Reply to this email to answer the customer. The website does not keep a copy of this enquiry.</p>` +
    `</div>`;

  const text = [
    `New enquiry ${enquiry.reference}`,
    `Category: ${category}`,
    `Name: ${singleLine(enquiry.fullName)}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Prefers: ${prefers}`,
    enquiry.vehicle ? `Vehicle: ${singleLine(enquiry.vehicle)}` : "",
    enquiry.radioType ? `Radio / provider: ${singleLine(enquiry.radioType)}` : "",
    "",
    "Message:",
    enquiry.message,
    "",
    "Reply to this email to answer the customer. The website does not keep a copy of this enquiry.",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  return {
    // Only the reference and a fixed label go in the subject, never free text from the visitor.
    subject: `New enquiry ${enquiry.reference}: ${category}`,
    html,
    text,
    replyTo: { email: enquiry.email, name: singleLine(enquiry.fullName) },
  };
}
