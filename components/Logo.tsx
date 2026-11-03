import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function LogoMark({
  className = "h-9 w-auto",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Image
      src={light ? "/logo-mark-white.png" : "/logo-mark.png"}
      alt=""
      aria-hidden="true"
      width={397}
      height={313}
      className={`object-contain ${className}`}
    />
  );
}

export function Logo({
  light = false,
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${className}`}
      aria-label={`${site.name} home`}
    >
      <Image
        src={light ? "/logo-white.png" : "/logo.png"}
        alt={site.name}
        width={1636}
        height={313}
        priority
        className="h-8 sm:h-9 md:h-10 w-auto object-contain"
      />
    </Link>
  );
}

