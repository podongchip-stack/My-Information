import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6">
      <p className="font-mono text-xs text-faint">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-muted">
        요청한 페이지가 없습니다. / This page does not exist.
      </p>
      <p className="mt-8 flex gap-6 text-sm">
        <Link
          href="/ko"
          className="text-accent underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
        >
          한국어
        </Link>
        <Link
          href="/en"
          className="text-accent underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent"
        >
          English
        </Link>
      </p>
    </div>
  );
}
