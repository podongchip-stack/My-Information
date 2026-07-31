import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

export default function Now({ lang }: { lang: Lang }) {
  const ui = getUI(lang);

  const rows = [
    { label: ui.now.affiliationLabel, value: ui.now.affiliation },
    { label: ui.now.labLabel, value: ui.now.lab },
  ];

  return (
    <Section
      id="now"
      index="01"
      label={ui.now.label}
      title={ui.now.title}
      lead={ui.now.lead}
    >
      <dl className="divide-y divide-line border-y border-line">
        {rows.map((row, i) => (
          <Reveal key={row.label} delay={i * 0.06}>
            <div className="flex flex-col gap-1 py-5 sm:flex-row sm:gap-10">
              <dt className="w-32 shrink-0 font-mono text-xs tracking-wider text-faint uppercase">
                {row.label}
              </dt>
              <dd className="text-base leading-relaxed">{row.value}</dd>
            </div>
          </Reveal>
        ))}

        <Reveal delay={rows.length * 0.06}>
          <div className="flex flex-col gap-1 py-5 sm:flex-row sm:gap-10">
            <dt className="w-32 shrink-0 font-mono text-xs tracking-wider text-faint uppercase">
              {ui.now.focusLabel}
            </dt>
            <dd>
              <ul className="space-y-2">
                {ui.now.focus.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span className="mt-2.5 h-px w-3 shrink-0 bg-accent" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </Reveal>
      </dl>
    </Section>
  );
}
