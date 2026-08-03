'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-6 py-16">
      <div className="space-y-5 rounded-[2rem] border border-border bg-surface p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-accent">Runtime error</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
        <p className="text-sm leading-7 text-muted">
          The page could not be rendered. Please try again or return to the main TOOLBOX page.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 dark:bg-white dark:text-black"
          >
            Try again
          </button>
          <Link
            href="/ko"
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground hover:bg-surface-2 dark:border-white/12 dark:text-white dark:hover:bg-white/10"
          >
            Back to TOOLBOX
          </Link>
        </div>
        <p className="text-xs text-muted/80 break-all">{error?.digest ?? error?.message ?? 'Unknown error'}</p>
      </div>
    </div>
  );
}
