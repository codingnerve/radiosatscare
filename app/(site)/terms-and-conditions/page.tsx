import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, operatorLine } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms and conditions",
  description:
    "The terms for using the RadioSatCare website and enquiry service, including what we do, what we don't, and your responsibilities.",
  path: "/terms-and-conditions",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      path="/terms-and-conditions"
      lead="Plain-language terms for using this website and sending us an enquiry."
    >
      <h2>About these terms</h2>
      <p>
        These terms apply when you use this website or send an enquiry through it. The service is provided by{" "}
        {operatorLine()}. By using the website you agree to these terms. If you do not agree, please do not use it.
      </p>

      <h2>What the service is</h2>
      <p>
        RadioSatCare is an independent assistance service for in-car satellite radio. We provide information and
        guidance about activation, signal, channel and subscription questions, and help you prepare for conversations
        with your provider or installer.
      </p>
      <p>
        We are not a satellite radio provider, manufacturer, installer or dealer, and we are not affiliated with,
        endorsed by or authorised by any of them. See the <Link href="/disclaimer">disclaimer</Link>.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>Activate, change, cancel or refund a satellite radio subscription. Only your provider can</li>
        <li>Repair or modify a receiver or antenna remotely</li>
        <li>Guarantee any outcome, timing or compatibility with a particular vehicle</li>
        <li>Take payments, or ask for card details or account passwords, through this website</li>
      </ul>

      <h2>Fees</h2>
      <p>
        Sending an enquiry through this website is free. If we ever offer a service that carries a charge, we will state
        the price and what it covers clearly before you agree to anything, and we will not take payment through the
        enquiry form.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Give accurate information so that we can help you properly</li>
        <li>Do not include payment card numbers, passwords or other sensitive credentials in an enquiry</li>
        <li>Do not misuse the website, for example by sending spam, automated submissions or unlawful content</li>
        <li>Make your own decisions about your subscription and equipment; any step you take is your choice</li>
      </ul>

      <h2>Third parties</h2>
      <p>
        Your subscription, billing, activation and account are governed by your provider&apos;s own terms. Any repair or
        installation work is a matter between you and your dealer or installer. We are not responsible for their
        actions, services or policies, or for the content of any third-party website we link to.
      </p>

      <h2>Accuracy and availability</h2>
      <p>
        We work to keep the information on this website accurate, but satellite radio services, equipment and provider
        processes change and vary. Information here is general guidance and not professional, technical or legal
        advice. We do not promise that the website will always be available or error-free.
      </p>

      <h2>Our liability</h2>
      <p>
        Nothing in these terms excludes or limits liability that cannot be excluded or limited by law, including for
        fraud or for death or personal injury caused by negligence. Subject to that, we are not liable for indirect or
        consequential loss, or for loss caused by relying on general guidance, by actions of third parties, or by
        interruptions to satellite or provider services outside our control.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The content, design and logo of this website belong to us or our licensors. You may view and print pages for your
        own use. Please do not copy or republish them without permission. Third-party names and marks belong to their
        owners.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle personal information is set out in our <Link href="/privacy-policy">privacy policy</Link>.
      </p>

      <h2>Changes and governing law</h2>
      <p>
        We may update these terms from time to time; the latest version and its date will always be on this page.
        {site.jurisdiction && <> These terms are governed by the laws of {site.jurisdiction}.</>}
      </p>
    </LegalPage>
  );
}
