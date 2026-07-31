import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import { getOpenSourceStats, type Platform } from "@/lib/stats";
import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

const PLATFORM_LABEL: Record<Platform, string> = {
  huggingface: "Hugging Face",
  kaggle: "Kaggle",
};

export default async function OpenSource({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const { artifacts, totalDownloads } = await getOpenSourceStats();

  return (
    <Section
      id="opensource"
      index="04"
      label={ui.opensource.label}
      title={ui.opensource.title}
      lead={ui.opensource.lead}
    >
      {artifacts.length === 0 ? (
        <p className="text-sm text-muted">{ui.opensource.empty}</p>
      ) : (
        <>
          <Reveal>
            <div className="border-y border-line py-8">
              <p className="font-mono text-xs tracking-wider text-faint uppercase">
                {ui.opensource.totalLabel}
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">
                <CountUp to={totalDownloads} className="text-accent" />
              </p>
            </div>
          </Reveal>

          <ul className="mt-2 divide-y divide-line border-b border-line">
            {artifacts.map((a, i) => (
              <li key={`${a.platform}-${a.kind}-${a.id}`}>
                <Reveal delay={Math.min(i, 4) * 0.05} distance={14}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-faint">
                        <span>{PLATFORM_LABEL[a.platform]}</span>
                        <span aria-hidden>·</span>
                        <span className="text-accent">
                          {ui.opensource.kinds[a.kind]}
                        </span>
                      </div>
                      <h3 className="mt-1.5 truncate text-base font-medium transition-colors group-hover:text-accent">
                        {a.title}
                        <span
                          className="ml-1.5 inline-block text-faint transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        >
                          ↗
                        </span>
                      </h3>
                    </div>

                    <p className="shrink-0 font-mono text-sm text-muted tabular-nums">
                      {a.downloads.toLocaleString()}{" "}
                      <span className="text-faint">
                        {ui.opensource.downloads}
                      </span>
                    </p>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}
