"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-page py-24">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-2 max-w-xl text-4xl">This page hit a problem</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        It&apos;s on our side, not yours. Try again, or come back in a few minutes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Go to homepage
        </Link>
      </div>
    </main>
  );
}
