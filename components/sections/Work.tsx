import Link from "next/link";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import { work } from "@/data/work";
import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

export default function Work({ lang }: { lang: Lang }) {
  const ui = getUI(lang);

  return (
    <Section
      id="work"
      index="03"
      label={ui.work.label}
      title={ui.work.title}
      lead={ui.work.lead}
    >
      <ul className="border-t border-line">
        {work.map((item, i) => (
          <li key={item.slug}>
            <Reveal delay={Math.min(i, 4) * 0.05} distance={16}>
              <article className="group border-b border-line py-8 transition-colors sm:py-10">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs text-faint">
                  <span>
                    {item.period}
                    {item.ongoing ? " —" : ""}
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    {item.team
                      ? ui.work.teamNote(item.team)
                      : ui.work.soloNote}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                  {item.study ? (
                    <Link
                      href={`/${lang}/work/${item.slug}`}
                      className="transition-colors group-hover:text-accent"
                    >
                      {item.title[lang]}
                      <span
                        className="ml-2 inline-block transition-transform group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  ) : (
                    item.title[lang]
                  )}
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  {item.summary[lang]}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {item.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-faint"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
                  {item.study ? (
                    <Link
                      href={`/${lang}/work/${item.slug}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {ui.work.readCase}
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-faint">
                      {ui.work.noCase}
                    </span>
                  )}

                  {item.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted transition-colors hover:text-foreground"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
