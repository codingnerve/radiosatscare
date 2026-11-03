import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, operatorLine } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "How RadioSatCare collects, uses and deletes the personal information you send through the enquiry form.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      path="/privacy-policy"
      lead="What we collect when you contact us, why, who sees it, how long we keep it and the choices you have."
    >
      <h2>Who we are</h2>
      <p>
        This website, {site.url.replace("https://", "")}, is run by {operatorLine()}. We are an independent assistance
        service for in-car satellite radio. We are not a satellite radio provider. For this policy, we are the
        organisation that decides how your enquiry details are used.
      </p>

      <h2>What we collect</h2>
      <p>When you send an enquiry we collect only what you type into the form:</p>
      <ul>
        <li>Your full name, email address and phone number</li>
        <li>Your vehicle make and model and radio or provider type, if you choose to give them</li>
        <li>The issue category, your description of the problem and your preferred contact method</li>
        <li>Your confirmation that you have read this policy</li>
      </ul>
      <p>
        <strong>We do not collect payment card details or radio account passwords</strong>, and the form has no field for
        them. Please do not include them in your message. If you do, tell us and we will delete them.
      </p>
      <h3>Technical information</h3>
      <p>
        To protect the form from spam and abuse, our server briefly holds your IP address in memory to count how many
        enquiries come from it. It is not written to a database and is not included in the email we receive. Our
        web server and hosting provider may keep standard access logs.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        This website does not set cookies, and it does not use advertising or analytics trackers or follow you across
        other sites.
      </p>

      <h2>Why we use your information</h2>
      <ul>
        <li>To read and reply to your enquiry, by the method you chose</li>
        <li>To keep a record of what we advised in our support inbox, so a follow-up conversation makes sense</li>
        <li>To prevent spam and misuse of the form and keep the service secure</li>
      </ul>
      <p>
        Where data-protection law such as the GDPR or UK GDPR applies, we rely on your consent (given by ticking the
        box on the form) and on our legitimate interest in running a secure service and answering enquiries.
      </p>

      <h2>Who we share it with</h2>
      <p>We do not sell your information or use it for marketing. We share it only with service providers that help us run the service:</p>
      <ul>
        <li>An email delivery provider, so that your enquiry reaches our team</li>
        <li>Our email and hosting providers, which run our support inbox and this website</li>
      </ul>
      <p>
        These providers act on our instructions. Some may process data outside your country; where the law requires, we
        rely on appropriate safeguards. We may disclose information if the law requires it.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Your enquiry reaches us as an email; this website does not keep a copy. We keep that email in our support inbox
        while we are dealing with it and for up to 12 months after we have finished, then delete it. You can ask us to
        delete it sooner.
      </p>

      <h2>Your choices and rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>Ask for a copy of the information we hold about you</li>
        <li>Ask us to correct it or delete it</li>
        <li>Object to or ask us to restrict how we use it</li>
        <li>Withdraw your consent at any time, without affecting what we did before</li>
        <li>Complain to your local data-protection authority</li>
      </ul>
      <p>
        To use any of these rights, <Link href="/contact">contact us</Link>
        {site.email && <> or email {site.email}</>} and quote your enquiry reference if you have it. We may need to
        confirm it is really you before we act.
      </p>

      <h2>Security</h2>
      <p>
        Enquiries are sent over an encrypted connection and delivered to a mailbox that only our team can open. No
        system is perfectly secure, but we take reasonable steps to protect your information.
      </p>

      <h2>Children</h2>
      <p>This service is for adults who own or use a vehicle. We do not knowingly collect information from children.</p>

      <h2>Changes to this policy</h2>
      <p>We will update this page if our practices change and show the date of the latest update at the top.</p>
    </LegalPage>
  );
}
