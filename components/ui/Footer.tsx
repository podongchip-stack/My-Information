import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

const SOURCE_URL = "https://github.com/podongchip-stack/My-Information";

export default function Footer({ lang }: { lang: Lang }) {
  const ui = getUI(lang);

  return (
    <footer className="mt-20 flex flex-wrap items-baseline justify-end gap-x-6 gap-y-2 border-t border-line pt-6 text-xs text-faint">
      <a
        href={SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
      >
        {ui.footer.source} ↗
      </a>
    </footer>
  );
}
