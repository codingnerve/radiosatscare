export const ISSUE_CATEGORIES = ["activation", "signal", "channels", "subscription", "other"] as const;
export const PREFERRED_CONTACT = ["phone", "email"] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];
export type PreferredContact = (typeof PREFERRED_CONTACT)[number];

/** A validated enquiry, as it is turned into an email. Nothing about it is stored on the website. */
export interface Enquiry {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  vehicle?: string;
  radioType?: string;
  issueCategory: IssueCategory;
  message: string;
  preferredContact: PreferredContact;
}
