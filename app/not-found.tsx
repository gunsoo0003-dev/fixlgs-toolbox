import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <div className="space-y-4 rounded-[2rem] border border-border bg-surface p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-foreground dark:text-white">404</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white">Page not found</h1>
        <p className="text-sm leading-7 text-muted">
          The page you are looking for does not exist in this toolbox.
        </p>
        <Link href="/ko" className="inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background dark:bg-white dark:text-black">
          Back to TOOLBOX
        </Link>
      </div>
    </main>
  );
}
