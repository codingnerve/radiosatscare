import { z } from "zod";

export const issueCategories = [
  { value: "activation", label: "Radio activation or reactivation" },
  { value: "signal", label: "Signal or reception problem" },
  { value: "channels", label: "Missing channels or refresh" },
  { value: "subscription", label: "Subscription question" },
  { value: "other", label: "Something else" },
] as const;

export const contactMethods = [
  { value: "phone", label: "Call direct" },
] as const;


const linkCount = (text: string) => (text.match(/https?:\/\/|www\./gi) ?? []).length;

/**
 * Client-side mirror of the backend rules in docs/api-contract.md. The backend is the source of
 * truth: this schema exists to give instant feedback, not to be trusted.
 */
export const enquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .max(254, "Email address is too long")
    .pipe(z.email("Enter a valid email address")),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number with at least 7 digits")
    .max(20, "Phone number must be 20 characters or fewer")
    .regex(/^[0-9 +()\-]+$/, "Use digits, spaces and + - ( ) only"),
  vehicle: z.string().trim().max(120, "Keep this under 120 characters").optional(),
  radioType: z.string().trim().max(80, "Keep this under 80 characters").optional(),
  issueCategory: z.enum(["activation", "signal", "channels", "subscription", "other"], {
    error: "Choose what your enquiry is about",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please describe the problem in at least 10 characters")
    .max(2000, "Description must be 2,000 characters or fewer")
    .refine((v) => linkCount(v) <= 2, "Please include no more than 2 links"),
  preferredContact: z.enum(["phone", "email"], { error: "Choose how you'd like us to reply" }),
  consent: z.literal(true, { error: "Please confirm you've read the privacy notice" }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryField = keyof EnquiryInput;

/** Flatten a zod error into one message per field. */
export function fieldErrors(error: z.ZodError): Partial<Record<EnquiryField, string>> {
  const out: Partial<Record<EnquiryField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as EnquiryField | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
