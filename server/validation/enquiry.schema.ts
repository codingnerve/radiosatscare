import { z } from "zod";
import { ISSUE_CATEGORIES, PREFERRED_CONTACT } from "../enquiry-types";
import { blankToUndefined, noControlChars, noControlCharsMultiline } from "./common";

const MAX_LINKS = 2;

const countLinks = (text: string): number => (text.match(/https?:\/\/|www\./gi) ?? []).length;

const optionalSingleLine = (max: number, label: string) =>
  z.preprocess(
    blankToUndefined,
    z
      .string({ error: `${label} must be text` })
      .trim()
      .max(max, `${label} must be ${max} characters or fewer`)
      .refine(noControlChars, { error: `${label} contains invalid characters` })
      .optional(),
  );

export const enquirySchema = z.object({
  fullName: z
    .string({ error: "Enter your full name" })
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name must be 100 characters or fewer")
    .refine(noControlChars, { error: "Name contains invalid characters" }),
  email: z
    .string({ error: "Enter your email address" })
    .trim()
    .toLowerCase()
    .max(254, "Email address is too long")
    .pipe(z.email("Enter a valid email address")),
  phone: z
    .string({ error: "Enter a phone number" })
    .trim()
    .min(7, "Phone number must be 7 to 20 characters")
    .max(20, "Phone number must be 7 to 20 characters")
    .regex(/^[0-9+\-() ]+$/, "Phone number can only contain digits, spaces and + - ( )")
    .refine((v) => (v.match(/\d/g) ?? []).length >= 7, { error: "Enter a valid phone number" }),
  vehicle: optionalSingleLine(120, "Vehicle"),
  radioType: optionalSingleLine(80, "Radio or provider type"),
  issueCategory: z.enum(ISSUE_CATEGORIES, { error: "Choose an issue category" }),
  message: z
    .string({ error: "Describe the problem" })
    .trim()
    .min(10, "Please describe the problem in at least 10 characters")
    .max(2000, "Description must be 2000 characters or fewer")
    .refine(noControlCharsMultiline, { error: "Description contains invalid characters" })
    .refine((v) => countLinks(v) <= MAX_LINKS, { error: `Please include no more than ${MAX_LINKS} links` }),
  preferredContact: z.enum(PREFERRED_CONTACT, { error: "Choose how you would like to be contacted" }),
  consent: z.literal(true, { error: "You must agree to the privacy notice to send your enquiry" }),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().optional(),
  /** Epoch ms when the form was rendered (time trap). */
  startedAt: z
    .number({ error: "Invalid form timestamp" })
    .finite("Invalid form timestamp")
    .positive("Invalid form timestamp"),
  /** Client-generated idempotency key. */
  submissionId: z.uuid({ error: "Invalid submission id" }),
});

export type EnquiryInput = z.output<typeof enquirySchema>;

