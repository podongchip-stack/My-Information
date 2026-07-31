import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

const SOURCE_URL = "https://github.com/podongchip-stack/My-Information";

export default function Footer({ lang }: { lang: Lang }) {
  const ui = getUI(lang);

  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-10 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>{ui.footer.builtWith}</p>
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent"
        >
          {ui.footer.source} ↗
        </a>
      </div>
    </footer>
  );
}
