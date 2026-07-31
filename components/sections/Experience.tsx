import Link from "next/link";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import { sortedTimeline, type TimelineKind } from "@/data/timeline";
import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

/** 종류별 점 색 — 수상만 채워진 원으로 구분한다 */
const DOT: Record<TimelineKind, string> = {
  work: "bg-accent",
  project: "bg-foreground",
  award: "bg-transparent ring-1 ring-accent",
};

export default function Experience({ lang }: { lang: Lang }) {
  const ui = getUI(lang);

  return (
    <Section
      id="experience"
      index="02"
      label={ui.experience.label}
      title={ui.experience.title}
      lead={ui.experience.lead}
    >
      <ol className="relative">
        {/* 세로 축 */}
        <span
          className="absolute top-2 bottom-2 left-[5px] w-px bg-line"
          aria-hidden
        />

        {sortedTimeline.map((item, i) => {
          const period = item.ongoing
            ? `${item.start} — ${ui.experience.present}`
            : item.end
              ? `${item.start} — ${item.end}`
              : item.start;

          return (
            <li key={item.id} className="relative pl-8 pb-10 last:pb-0">
              <Reveal delay={Math.min(i, 4) * 0.05} distance={16}>
                <span
                  className={`absolute top-[7px] left-0 h-[11px] w-[11px] rounded-full ${DOT[item.kind]}`}
                  aria-hidden
                />

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-faint">{period}</span>
                  <span className="font-mono text-[10px] tracking-wider text-accent uppercase">
                    {ui.experience.kinds[item.kind]}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {item.workSlug ? (
                    <Link
                      href={`/${lang}#work`}
                      className="transition-colors hover:text-accent"
                    >
                      {item.title[lang]}
                    </Link>
                  ) : (
                    item.title[lang]
                  )}
                </h3>

                <p className="mt-1 text-sm text-faint">{item.org[lang]}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  {item.detail[lang]}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
