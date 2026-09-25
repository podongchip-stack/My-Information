import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";
import { EMAIL, SOCIALS } from "@/lib/links";

const SOURCE_URL = "https://github.com/podongchip-stack/My-Information";

export default function Footer({ lang }: { lang: Lang }) {
  const ui = getUI(lang);

  return (
    <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 pb-12">
      <p className="text-sm text-faint">
        © {new Date().getFullYear()} {ui.hero.name} ·{" "}
        <span className="select-all">{EMAIL}</span>
        <span aria-hidden> · </span>
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-accent"
        >
          {ui.footer.source} ↗
        </a>
      </p>
      <ul className="flex flex-wrap gap-2">
        {SOCIALS.map((s) => (
          <li key={s.href}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
            >
              {s.label}
              <span aria-hidden>&nbsp;↗</span>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
