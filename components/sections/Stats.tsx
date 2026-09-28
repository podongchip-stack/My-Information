import { getOpenSourceStats, groupArtifacts } from "@/lib/stats";
import { work } from "@/data/work";
import { timeline } from "@/data/timeline";
import { certifications } from "@/data/certifications";
import { getUI } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

/**
 * 핵심 수치 한 줄 — 모바일 2열, 데스크톱은 항목 수만큼 한 줄.
 * 자격증은 목록이 비어 있으면 칸을 만들지 않는다.
 */
export default async function Stats({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const { artifacts, totalDownloads } = await getOpenSourceStats();
  const live = artifacts.length > 0;

  const latestCert = [...certifications].sort((a, b) =>
    b.date.localeCompare(a.date)
  )[0];

  const items = [
    {
      value: live ? totalDownloads.toLocaleString("en-US") : "—",
      label: ui.kpi.downloads,
      note: live ? ui.kpi.downloadsNote : ui.downloads.empty,
    },
    {
      value: String(work.length),
      label: ui.kpi.projects,
      note: ui.kpi.projectsNote(work.filter((w) => w.ongoing).length),
    },
    {
      value: live ? String(groupArtifacts(artifacts).length) : "—",
      label: ui.kpi.releases,
      note: ui.kpi.releasesNote,
    },
    ...(latestCert
      ? [
          {
            value: String(certifications.length),
            label: ui.kpi.certs,
            note: ui.kpi.certsNote(latestCert.date),
          },
        ]
      : []),
    {
      value: String(timeline.filter((t) => t.kind === "award").length),
      label: ui.kpi.awards,
      note: ui.kpi.awardsNote,
    },
  ];

  return (
    <dl
      className="mt-8 grid grid-cols-2 border-t border-line md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
      style={{ "--cols": items.length } as React.CSSProperties}
    >
      {items.map((it) => (
        <div key={it.label} className="flex flex-col border-b border-line py-5">
          <dd className="order-1 font-sans text-[clamp(1.625rem,5vw,2.125rem)] font-semibold tracking-tight tabular-nums">
            {it.value}
          </dd>
          <dt className="order-2 text-[0.8125rem] text-muted">{it.label}</dt>
          <dd className="order-3 text-xs text-faint">{it.note}</dd>
        </div>
      ))}
    </dl>
  );
}
