import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-6">
      <p className="font-mono text-xs tracking-[0.28em] text-accent">404</p>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-4 text-muted">
        요청한 페이지가 없습니다. / This page does not exist.
      </p>
      <div className="mt-10 flex gap-3">
        <Link
          href="/ko"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
        >
          한국어
        </Link>
        <Link
          href="/en"
          className="rounded-full border border-line-strong px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          English
        </Link>
      </div>
    </div>
  );
}
