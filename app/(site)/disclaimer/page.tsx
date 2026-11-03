import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description:
    "RadioSatCare is an independent assistance service. Read what that means, how we use third-party names, and the limits of our guidance.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      path="/disclaimer"
      lead="Where our role starts and stops, in plain words."
    >
      <h2>We are independent</h2>
      <p>
        RadioSatCare is an independent assistance service. We are not a satellite radio provider, manufacturer, dealer or
        installer. We are not affiliated with, endorsed by, sponsored by or authorised by any satellite radio provider
        or manufacturer, and we do not act on their behalf.
      </p>

      <h2>Trademarks and names</h2>
      <p>
        Product, provider and brand names mentioned on this website, including satellite radio service names and vehicle
        makes, are trademarks of their respective owners. They are used only to describe the subject of a question and do
        not imply any relationship or approval.
      </p>

      <h2>Guidance, not control</h2>
      <p>
        We cannot activate, modify, cancel or refund a subscription, send signals to a radio, change a channel lineup or
        remotely repair equipment. Those actions belong to your provider or to a qualified installer. Nothing on this
        website lets us, or you, change a subscription directly.
      </p>

      <h2>No guarantees</h2>
      <p>
        Satellite reception depends on your location, the sky view, your equipment and your provider&apos;s network. Our
        guidance is general and based on the information you give us. We cannot promise that following it will resolve
        a problem, how long a provider will take, or that a particular receiver works in a particular vehicle.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Information on this website is for general information only. It is not technical, financial or legal advice.
        Check important details, including prices, plan contents, renewal and cancellation terms, with your provider
        before you decide.
      </p>

      <h2>Your information</h2>
      <p>
        We never ask for payment card numbers or account passwords. If someone contacts you claiming to be from
        RadioSatCare and asks for them, do not share them and <Link href="/contact">tell us</Link>.
      </p>

      <h2>External links</h2>
      <p>We are not responsible for the content or practices of other websites we may link to.</p>
    </LegalPage>
  );
}
