import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import ModalCard from "@/components/ui/ModalCard";
import { renderEm } from "@/components/ui/em";
import {
  getOpenSourceStats,
  asOfDate,
  PLATFORM_LABEL,
  type ArtifactStat,
  type Platform,
} from "@/lib/stats";
import { work } from "@/data/work";
import { timeline } from "@/data/timeline";
import { certifications } from "@/data/certifications";
import { getUI, type UIDict } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

/** 모달 상단 — 카테고리 점 + 라벨 + 보조 정보 */
function ListHeader({
  dot,
  label,
  note,
}: {
  dot: string;
  label: string;
  note?: string;
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 pr-8 text-xs text-faint">
      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span className="font-medium text-muted">{label}</span>
      {note && <span>· {note}</span>}
    </p>
  );
}

/** 플랫폼 몫을 나타내는 스택 바 색 — HF 진한 블루, Kaggle 연한 블루 */
const PLATFORM_BAR: Record<Platform, string> = {
  huggingface: "bg-release",
  kaggle: "bg-release/45",
};

/**
 * 오픈소스 목록 — 총합 + 플랫폼 분할 바, 공개물별 비례 바.
 * 타임라인 릴리즈 행과 같은 시각 문법(날짜·칩·바)을 쓴다. 행 클릭 시 해당 페이지로.
 */
function DownloadsList({
  artifacts,
  total,
  ui,
}: {
  artifacts: ArtifactStat[];
  total: number;
  ui: UIDict;
}) {
  if (artifacts.length === 0) {
    return <p className="mt-4 text-sm text-muted">{ui.downloads.empty}</p>;
  }

  const max = Math.max(...artifacts.map((a) => a.downloads), 1);
  const platforms = (Object.keys(PLATFORM_LABEL) as Platform[])
    .map((platform) => ({
      platform,
      sum: artifacts
        .filter((a) => a.platform === platform)
        .reduce((s, a) => s + a.downloads, 0),
    }))
    .filter((p) => p.sum > 0);

  return (
    <div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {total.toLocaleString()}
      </p>

      <div
        aria-hidden
        className="mt-2.5 flex h-1.5 gap-0.5 overflow-hidden rounded-full"
      >
        {platforms.map((p) => (
          <span
            key={p.platform}
            className={PLATFORM_BAR[p.platform]}
            style={{ width: `${(p.sum / total) * 100}%`, minWidth: 4 }}
          />
        ))}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-faint">
        {platforms.map((p) => (
          <span key={p.platform} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${PLATFORM_BAR[p.platform]}`}
            />
            {PLATFORM_LABEL[p.platform]}
            <span className="font-mono text-muted tabular-nums">
              {p.sum.toLocaleString()}
            </span>
          </span>
        ))}
      </p>

      <ul className="mt-4 divide-y divide-line border-t border-line">
        {artifacts.map((a) => (
          <li key={`${a.platform}-${a.kind}-${a.id}`}>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-3"
            >
              <p className="flex flex-wrap items-center gap-x-2 text-xs text-faint">
                {a.createdAt && (
                  <span className="font-mono tabular-nums">
                    {a.createdAt.slice(0, 7).replace("-", ".")}
                  </span>
                )}
                <span className="rounded-sm border border-release/60 px-1.5 py-0.5 text-release">
                  {ui.downloads.kinds[a.kind]}
                </span>
                <span>· {PLATFORM_LABEL[a.platform]}</span>
              </p>

              <p className="mt-1.5 text-sm font-medium text-muted transition-colors group-hover:text-foreground">
                {a.title}{" "}
                <span aria-hidden className="text-xs text-faint">
                  ↗
                </span>
              </p>

              <p className="mt-2 flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
                >
                  <span
                    className="block h-full rounded-full bg-release"
                    style={{
                      width: `${Math.max(
                        (a.downloads / max) * 100,
                        a.downloads > 0 ? 2 : 0
                      )}%`,
                    }}
                  />
                </span>
                <span className="w-14 shrink-0 text-right font-mono text-xs text-muted tabular-nums">
                  {a.downloads.toLocaleString()}
                </span>
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 자격증 목록 */
function CertsList({ ui, lang }: { ui: UIDict; lang: Lang }) {
  if (certifications.length === 0) {
    return <p className="mt-4 text-sm text-muted">{ui.kpi.certsEmpty}</p>;
  }
  const sorted = [...certifications].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return (
    <ul className="mt-3 divide-y divide-line">
      {sorted.map((c, i) => (
        <li key={i} className="py-2.5">
          <p className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">{c.name[lang]}</span>
            <span className="shrink-0 font-mono text-xs text-faint tabular-nums">
              {c.date}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-faint">{c.issuer[lang]}</p>
        </li>
      ))}
    </ul>
  );
}

/** 프로젝트 목록 — 최신순 */
function ProjectsList({ ui, lang }: { ui: UIDict; lang: Lang }) {
  const sorted = [...work].sort((a, b) => b.period.localeCompare(a.period));
  return (
    <ul className="mt-3 divide-y divide-line">
      {sorted.map((item) => (
        <li key={item.slug} className="py-3">
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-faint">
            <span className="font-mono tabular-nums">
              {item.period}
              {item.ongoing ? " —" : ""}
            </span>
            {item.ongoing && (
              <span className="text-accent">{ui.timeline.ongoing}</span>
            )}
          </p>
          <p className="mt-1 text-sm font-medium">{item.title[lang]}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            {item.summary[lang]}
          </p>
        </li>
      ))}
    </ul>
  );
}

/** 수상 목록 — 최신순 */
function AwardsList({ ui, lang }: { ui: UIDict; lang: Lang }) {
  const awards = timeline
    .filter((t) => t.kind === "award")
    .sort((a, b) => b.start.localeCompare(a.start));
  return (
    <ul className="mt-3 divide-y divide-line">
      {awards.map((a) => (
        <li key={a.id} className="py-3">
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-faint">
            <span className="font-mono tabular-nums">{a.start}</span>
            <span className="rounded-sm border border-award/60 px-1.5 py-0.5 text-award">
              {ui.timeline.kinds.award}
            </span>
            <span>· {a.org[lang]}</span>
          </p>
          <p className="mt-1 text-sm font-medium">{a.title[lang]}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            {renderEm(a.detail[lang])}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * 한눈에 읽는 핵심 수치 4개 — 타일을 클릭하면 해당 카테고리의 목록 모달이 뜬다.
 * 카드 테두리·점 색은 아래 그래프의 카테고리 색과 같다.
 */
export default async function Kpis({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const { artifacts, totalDownloads } = await getOpenSourceStats();

  const ongoing = work.filter((w) => w.ongoing).length;
  const awards = timeline.filter((t) => t.kind === "award").length;
  const live = artifacts.length > 0;
  const latestCert = [...certifications].sort((a, b) =>
    b.date.localeCompare(a.date)
  )[0];

  const tiles: {
    label: string;
    value: string;
    note: string;
    border: string;
    panel: string;
    dot: string;
    list: ReactNode;
  }[] = [
    {
      label: ui.kpi.downloads,
      value: live ? totalDownloads.toLocaleString() : "—",
      note: live ? ui.kpi.downloadsNote(asOfDate()) : ui.downloads.empty,
      border: "border-release/40",
      panel: "border-release/60",
      dot: "bg-release",
      list: <DownloadsList artifacts={artifacts} total={totalDownloads} ui={ui} />,
    },
    {
      label: ui.kpi.certs,
      value: certifications.length > 0 ? String(certifications.length) : "—",
      note: latestCert ? ui.kpi.certsNote(latestCert.date) : ui.kpi.certsEmpty,
      border: "border-cert/40",
      panel: "border-cert/60",
      dot: "bg-cert",
      list: <CertsList ui={ui} lang={lang} />,
    },
    {
      label: ui.kpi.projects,
      value: String(work.length),
      note: ui.kpi.projectsNote(ongoing),
      border: "border-accent/40",
      panel: "border-accent/50",
      dot: "bg-accent",
      list: <ProjectsList ui={ui} lang={lang} />,
    },
    {
      label: ui.kpi.awards,
      value: String(awards),
      note: ui.kpi.awardsNote,
      border: "border-award/40",
      panel: "border-award/60",
      dot: "bg-award",
      list: <AwardsList ui={ui} lang={lang} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {tiles.map((tile, i) => (
        <Reveal key={tile.label} delay={i * 80} className="h-full">
          <ModalCard
            label={tile.label}
            closeLabel={ui.modal.close}
            panelClassName={tile.panel}
            card={
              <div
                className={`h-full rounded-lg border-2 ${tile.border} bg-surface px-4 py-4 transition-transform duration-200 motion-safe:hover:-translate-y-1`}
              >
                <p className="flex items-center gap-1.5 text-xs text-faint">
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${tile.dot}`}
                  />
                  {tile.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  {tile.value}
                </p>
                <p className="mt-1.5 text-xs text-faint">{tile.note}</p>
              </div>
            }
            modal={
              <div>
                <ListHeader dot={tile.dot} label={tile.label} note={tile.note} />
                {tile.list}
              </div>
            }
          />
        </Reveal>
      ))}
    </div>
  );
}
