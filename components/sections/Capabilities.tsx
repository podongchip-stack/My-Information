import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

export default function Capabilities({ lang }: { lang: Lang }) {
  const { capabilities } = getUI(lang);

  return (
    <section aria-labelledby="capabilities-title">
      <h2
        id="capabilities-title"
        className="pb-4 text-sm font-semibold text-foreground"
      >
        {capabilities.title}
      </h2>

      <ul className="grid gap-8 md:grid-cols-3 md:gap-10">
        {capabilities.items.map((item) => (
          <li key={item.title} className="py-3">
            <p className="text-xs font-semibold tracking-[0.08em] text-accent-ink uppercase">
              {item.title}
            </p>
            <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
