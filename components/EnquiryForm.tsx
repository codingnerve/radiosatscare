"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";
import {
  contactMethods,
  type EnquiryField,
  type EnquiryInput,
  enquirySchema,
  fieldErrors,
  issueCategories,
} from "@/lib/enquiry-schema";
import { site, telHref } from "@/lib/site";

type Values = {
  fullName: string;
  email: string;
  phone: string;
  vehicle: string;
  radioType: string;
  issueCategory: string;
  message: string;
  preferredContact: string;
  consent: boolean;
};

const emptyValues: Values = {
  fullName: "",
  email: "",
  phone: "",
  vehicle: "",
  radioType: "",
  issueCategory: "",
  message: "",
  preferredContact: "phone",
  consent: false,
};

type Errors = Partial<Record<EnquiryField, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const fieldOrder: EnquiryField[] = [
  "fullName",
  "email",
  "phone",
  "issueCategory",
  "message",
  "vehicle",
  "radioType",
  "preferredContact",
  "consent",
];

function newSubmissionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

type Props = {
  /** "compact" tucks the optional vehicle/radio fields into a disclosure. */
  variant?: "compact" | "full";
  /** Pre-select an issue category (used on service pages). */
  defaultCategory?: EnquiryInput["issueCategory"];
};

export function EnquiryForm({ variant = "full", defaultCategory }: Props) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [values, setValues] = useState<Values>({ ...emptyValues, issueCategory: defaultCategory ?? "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [reference, setReference] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const startedAt = useRef(0);
  const submissionId = useRef("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    submissionId.current = newSubmissionId();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as EnquiryField]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateField = (key: EnquiryField) => {
    const parsed = enquirySchema.safeParse(normalise(values));
    const msg = parsed.success ? undefined : fieldErrors(parsed.error)[key];
    setErrors((e) => ({ ...e, [key]: msg }));
  };

  const focusFirst = (errs: Errors) => {
    const first = fieldOrder.find((k) => errs[k]);
    if (!first) return;
    if (first === "vehicle" || first === "radioType") {
      if (detailsRef.current) detailsRef.current.open = true;
    }
    requestAnimationFrame(() => document.getElementById(id(first))?.focus());
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return; // prevent double submission

    const parsed = enquirySchema.safeParse(normalise(values));
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      setStatus("idle");
      setServerMessage("");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus("submitting");
    setServerMessage("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          website: honeypot,
          startedAt: startedAt.current,
          submissionId: submissionId.current,
        }),
        signal: controller.signal,
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        reference?: string;
        error?: { code?: string; message?: string; fields?: Errors };
      } | null;

      if (res.ok && body?.ok) {
        setReference(body.reference ?? "");
        setStatus("success");
        return;
      }

      if (res.status === 400 && body?.error?.code === "VALIDATION_ERROR" && body.error.fields) {
        setErrors(body.error.fields);
        setServerMessage("Please check the highlighted fields and try again.");
        setStatus("error");
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      if (res.status === 429) {
        setServerMessage("You've sent several enquiries recently. Please wait a while before trying again.");
      } else if (body?.error?.code === "TOO_FAST" || body?.error?.code === "SEND_FAILED") {
        // Both messages are written for visitors and tell them what to do next.
        setServerMessage(body.error.message ?? "Please review your message and send it again.");
      } else {
        setServerMessage("Something went wrong on our side and your enquiry was not sent. Please try again shortly.");
      }
      setStatus("error");
    } catch {
      setServerMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }

  function reset() {
    setValues({ ...emptyValues, issueCategory: defaultCategory ?? "" });
    setErrors({});
    setServerMessage("");
    setReference("");
    setHoneypot("");
    startedAt.current = Date.now();
    submissionId.current = newSubmissionId();
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-green-700/30 bg-green-50 p-6 outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-700 text-white">
            <Icon name="check" />
          </span>
          <h3 className="text-xl text-green-900">Enquiry received</h3>
        </div>
        <p className="mt-3 text-green-950">
          Thank you. We&apos;ll call you directly at{" "}
          <strong className="font-semibold text-navy-950">{values.phone || "your number"}</strong> as soon as we can.
          {reference && (
            <>
              {" "}
              Your reference is <strong className="font-mono">{reference}</strong>.
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-green-900">
          Please keep any account passwords and card numbers to yourself. We&apos;ll never ask for them.
        </p>
        <button type="button" onClick={reset} className="btn btn-secondary mt-5">
          Send another enquiry
        </button>
      </div>
    );
  }

  const errorList = fieldOrder.filter((k) => errors[k]);
  const sending = status === "submitting";

  const fieldProps = (key: EnquiryField) => ({
    id: id(key),
    "aria-invalid": errors[key] ? (true as const) : undefined,
    "aria-describedby": errors[key] ? id(`${key}-error`) : undefined,
    onBlur: () => validateField(key),
  });
  const err = (key: EnquiryField) =>
    errors[key] ? (
      <p id={id(`${key}-error`)} className="field-error">
        {errors[key]}
      </p>
    ) : null;

  const vehicleFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={id("vehicle")} className="field-label">
          Vehicle make and model <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          {...fieldProps("vehicle")}
          type="text"
          className="field-input"
          autoComplete="off"
          maxLength={120}
          placeholder="e.g. make, model, year"
          value={values.vehicle}
          onChange={(e) => set("vehicle", e.target.value)}
        />
        {err("vehicle")}
      </div>
      <div>
        <label htmlFor={id("radioType")} className="field-label">
          Radio or provider <span className="font-normal text-muted">(if known)</span>
        </label>
        <input
          {...fieldProps("radioType")}
          type="text"
          className="field-input"
          autoComplete="off"
          maxLength={80}
          placeholder="Factory radio, aftermarket tuner…"
          value={values.radioType}
          onChange={(e) => set("radioType", e.target.value)}
        />
        {err("radioType")}
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Service request" className="space-y-4">
      {telHref && (
        <div className="flex flex-col gap-3 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-50 to-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
              <Icon name="phone" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-navy-950 sm:text-base">Prefer to call directly?</p>
              <p className="text-xs text-muted">Skip the form and talk to our team right away</p>
            </div>
          </div>
          <a
            href={telHref}
            className="btn btn-primary !min-h-10 !px-4 text-sm font-bold flex items-center justify-center gap-2 shrink-0 shadow-sm"
            aria-label={`Call us directly on ${site.phoneDisplay}`}
          >
            <Icon name="phone" className="h-4 w-4" />
            <span>Call {site.phoneDisplay}</span>
          </a>
        </div>
      )}

      {(errorList.length > 0 || serverMessage) && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-red-700/40 bg-red-50 p-4 text-sm text-red-900 outline-none"
        >
          <p className="font-bold">{serverMessage || "Please fix the following:"}</p>
          {errorList.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errorList.map((k) => (
                <li key={k}>
                  <a
                    href={`#${id(k)}`}
                    className="underline"
                    onClick={(ev) => {
                      ev.preventDefault();
                      focusFirst({ [k]: errors[k] });
                    }}
                  >
                    {errors[k]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id("fullName")} className="field-label">
            Full name
          </label>
          <input
            {...fieldProps("fullName")}
            type="text"
            className="field-input"
            autoComplete="name"
            maxLength={100}
            required
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
          {err("fullName")}
        </div>
        <div>
          <label htmlFor={id("email")} className="field-label">
            Email address
          </label>
          <input
            {...fieldProps("email")}
            type="email"
            className="field-input"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            required
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {err("email")}
        </div>
        <div>
          <label htmlFor={id("phone")} className="field-label">
            Phone number
          </label>
          <input
            {...fieldProps("phone")}
            type="tel"
            className="field-input"
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            required
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          {err("phone")}
        </div>
        <div>
          <label htmlFor={id("issueCategory")} className="field-label">
            What is it about?
          </label>
          <select
            {...fieldProps("issueCategory")}
            className="field-input"
            required
            value={values.issueCategory}
            onChange={(e) => set("issueCategory", e.target.value)}
          >
            <option value="" disabled>
              Choose one…
            </option>
            {issueCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {err("issueCategory")}
        </div>
      </div>

      <div>
        <label htmlFor={id("message")} className="field-label">
          What&apos;s happening?
        </label>
        <textarea
          {...fieldProps("message")}
          className="field-input min-h-32 resize-y"
          rows={5}
          maxLength={2000}
          required
          placeholder="Tell us the message on the radio screen, when it started and what you've already tried."
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
        />
        <div className="mt-1 flex justify-between gap-4 text-xs text-muted">
          <span>Please don&apos;t include card numbers or passwords.</span>
          <span aria-live="off">{values.message.length}/2000</span>
        </div>
        {err("message")}
      </div>

      {variant === "compact" ? (
        <details ref={detailsRef} className="rounded-xl border border-line bg-navy-50/60 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-navy-900">
            Add vehicle details (optional)
          </summary>
          <div className="mt-4">{vehicleFields}</div>
        </details>
      ) : (
        vehicleFields
      )}

      <fieldset>
        <legend className="field-label">How should we reply?</legend>
        <div className="flex flex-wrap gap-3">
          {contactMethods.map((m) => (
            <label
              key={m.value}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-navy-900 bg-navy-50 px-4 py-2 text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-orange-500"
            >
              <input
                type="radio"
                name={id("preferredContact")}
                value={m.value}
                checked={values.preferredContact === m.value}
                onChange={() => set("preferredContact", m.value)}
                className="h-4 w-4 accent-navy-900"
              />
              <Icon name="phone" className="h-4 w-4 text-orange-700" />
              {m.label}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Our team will call you directly at the phone number provided above.
        </p>
        {err("preferredContact")}
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
          <input
            {...fieldProps("consent")}
            type="checkbox"
            className="mt-1 h-5 w-5 flex-none accent-navy-900"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
          />
          <span>
            I&apos;ve read the{" "}
            <Link href="/privacy-policy" className="font-semibold text-orange-700 underline underline-offset-2">
              privacy policy
            </Link>{" "}
            and agree that RadioSatCare may use these details to reply to my enquiry.
          </span>
        </label>
        {err("consent")}
      </div>

      {/* Honeypot: invisible to people and assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={sending} aria-busy={sending}>
        {sending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950 border-t-transparent" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Icon name="phone" className="h-4 w-4" />
            Request direct call
          </>
        )}
      </button>
    </form>
  );
}

/** Convert empty optional strings to undefined and keep consent as a boolean for zod. */
function normalise(v: Values) {
  return {
    ...v,
    vehicle: v.vehicle.trim() || undefined,
    radioType: v.radioType.trim() || undefined,
    issueCategory: v.issueCategory || undefined,
    consent: v.consent ? (true as const) : false,
  };
}
