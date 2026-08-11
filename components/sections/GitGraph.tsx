import type { ReactNode } from "react";
import Image from "next/image";
import Dumbbell, { num } from "@/components/charts/Dumbbell";
import Reveal from "@/components/ui/Reveal";
import ModalCard from "@/components/ui/ModalCard";
import { renderEm } from "@/components/ui/em";
import { timeline, type TimelineItem } from "@/data/timeline";
import { workBySlug } from "@/data/work";
import {
  getOpenSourceStats,
  groupArtifacts,
  PLATFORM_LABEL,
  type ArtifactStat,
  type ReleaseGroup,
} from "@/lib/stats";
import { getUI, type UIDict } from "@/lib/content/ui";
import type { Lang } from "@/lib/i18n";

/** 커밋 점 — 줄기(모바일 left-4, 데스크톱 중앙) 위에 얹는다 */
function CommitDot({
  color = "bg-accent",
  hollow = false,
}: {
  color?: string;
  hollow?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`absolute top-1 left-4 z-10 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-background sm:left-1/2 ${
        hollow ? "border-2 border-accent bg-background" : color
      }`}
    />
  );
}

/** 릴리즈 노드 — 커밋과 구분되는 마름모 */
function ReleaseDot() {
  return (
    <span
      aria-hidden
      className="absolute top-1.5 left-4 z-10 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-release ring-4 ring-background sm:left-1/2"
    />
  );
}

/** 가지 연결선 — 줄기에서 카드 쪽으로 뻗는다. 데스크톱은 짧게 */
function BranchLine({
  side,
  color = "bg-accent-dim",
}: {
  side: "left" | "right";
  color?: string;
}) {
  return (
    <span
      aria-hidden
      className={`absolute top-[9px] left-4 h-px w-8 sm:left-1/2 sm:w-5 ${color} ${
        side === "left" ? "sm:-translate-x-full" : ""
      }`}
    />
  );
}

/** 기간 문자열 — "2026.01 — 2026.05" / "2026.07 —" */
function period(item: TimelineItem): string {
  if (item.ongoing) return `${item.start} —`;
  return item.end ? `${item.start} — ${item.end}` : item.start;
}

/** ISO 시각 → "YYYY.MM" */
function toYearMonth(iso: string): string {
  return iso.slice(0, 7).replace("-", ".");
}

/**
 * 브랜치 카드 — 연구·개발·수상 공통. 골든링크에는 전후 차트가 함께 붙는다.
 * ModalCard로 감싸여 카드 전체를 클릭하면 상세 모달이 뜬다.
 */
function BranchCard({
  item,
  ui,
  lang,
}: {
  item: TimelineItem;
  ui: UIDict;
  lang: Lang;
}) {
  const work = item.workSlug ? workBySlug.get(item.workSlug) : undefined;
  const isAward = item.kind === "award";

  return (
    <article
      className={`rounded-lg border-2 bg-surface p-4 transition-all duration-200 motion-safe:hover:-translate-y-1 ${
        isAward
          ? "border-award/45 hover:border-award/80"
          : "border-accent/35 hover:border-accent/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-faint">
            <span className="font-mono tabular-nums">{period(item)}</span>
            {item.ongoing && (
              <span className="text-accent">{ui.timeline.ongoing}</span>
            )}
            {isAward ? (
              <span className="rounded-sm border border-award/60 px-1.5 py-0.5 text-award">
                {ui.timeline.kinds.award}
              </span>
            ) : (
              <span>· {ui.timeline.kinds[item.kind]}</span>
            )}
          </p>

          <h3 className="mt-2 text-sm font-semibold">{item.title[lang]}</h3>
          <p className="mt-0.5 text-xs text-faint">{item.org[lang]}</p>
        </div>

        {item.image && (
          <Image
            src={item.image}
            alt={`${item.title[lang]} ${
              item.imageKind === "graphic"
                ? ui.timeline.graphic
                : ui.timeline.poster
            }`}
            sizes="56px"
            className="w-14 shrink-0 rounded-sm border border-line"
          />
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">
        {renderEm(work ? work.summary[lang] : item.detail[lang])}
      </p>

      {item.highlights && (
        <ul className="mt-2.5 space-y-1.5">
          {item.highlights[lang].map((h) => (
            <li
              key={h}
              className="flex gap-2 text-xs leading-relaxed text-muted"
            >
              <span
                className="mt-[7px] h-px w-2.5 shrink-0 bg-accent-dim"
                aria-hidden
              />
              <span>{renderEm(h)}</span>
            </li>
          ))}
        </ul>
      )}

      {work && (
        <p className="mt-2.5 font-mono text-xs text-faint">
          {work.tech.join(" · ")}
        </p>
      )}

      {/* 카드 전체가 모달을 여는 버튼임을 알리는 힌트 */}
      <p
        className={`mt-3 text-right text-xs ${
          isAward ? "text-award" : "text-accent"
        }`}
      >
        {ui.modal.more} →
      </p>
    </article>
  );
}

/** 모달 본문 — 카드를 클릭하면 뜨는 상세 설명 */
function CardDetail({
  item,
  ui,
  lang,
}: {
  item: TimelineItem;
  ui: UIDict;
  lang: Lang;
}) {
  const work = item.workSlug ? workBySlug.get(item.workSlug) : undefined;
  const metrics = work?.study?.metrics;
  const vram = metrics?.find((m) => m.after.includes("MB"));
  const isAward = item.kind === "award";

  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-2 pr-8 text-xs text-faint">
        <span className="font-mono tabular-nums">{period(item)}</span>
        {item.ongoing && (
          <span className="text-accent">{ui.timeline.ongoing}</span>
        )}
        {isAward ? (
          <span className="rounded-sm border border-award/60 px-1.5 py-0.5 text-award">
            {ui.timeline.kinds.award}
          </span>
        ) : (
          <span>· {ui.timeline.kinds[item.kind]}</span>
        )}
      </p>

      <h3 className="mt-2 pr-8 text-lg font-semibold">{item.title[lang]}</h3>
      <p className="mt-0.5 text-xs text-faint">{item.org[lang]}</p>

      <p className="mt-4 text-sm leading-[1.85] text-muted">
        {renderEm(work ? work.summary[lang] : item.detail[lang])}
      </p>

      {work?.study && (
        <p className="mt-3 text-sm leading-[1.85] text-muted">
          {renderEm(work.study.lead[lang])}
        </p>
      )}

      {item.highlights && (
        <ul className="mt-3 space-y-1.5">
          {item.highlights[lang].map((h) => (
            <li
              key={h}
              className="flex gap-2 text-sm leading-relaxed text-muted"
            >
              <span
                className={`mt-[9px] h-px w-2.5 shrink-0 ${
                  isAward ? "bg-award" : "bg-accent-dim"
                }`}
                aria-hidden
              />
              <span>{renderEm(h)}</span>
            </li>
          ))}
        </ul>
      )}

      {item.image &&
        (item.imageKind === "graphic" ? (
          <Image
            src={item.image}
            alt={`${item.title[lang]} ${ui.timeline.graphic}`}
            sizes="18rem"
            className="mt-4 w-72 max-w-full rounded-md border border-line"
          />
        ) : (
          <Image
            src={item.image}
            alt={`${item.title[lang]} ${ui.timeline.poster}`}
            sizes="(min-width: 640px) 28rem, 100vw"
            className="mt-4 w-full rounded-md border border-line"
          />
        ))}

      {metrics && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs font-medium">{ui.ocr.title}</p>
            <p className="text-[10px] text-faint">{ui.ocr.note}</p>
          </div>
          <div className="mt-3">
            <Dumbbell metrics={metrics} lang={lang} />
          </div>
          {vram && (
            <p className="mt-2 text-xs">
              <span className="text-muted">{ui.ocr.vram}</span>{" "}
              <span className="tabular-nums">
                <span className="text-faint">{vram.before}</span>
                <span className="text-faint" aria-hidden>
                  {" → "}
                </span>
                <span className="font-semibold">{vram.after}</span>
              </span>{" "}
              <span className="text-accent">
                −{Math.round((1 - num(vram.after) / num(vram.before!)) * 100)}%
              </span>
            </p>
          )}
        </div>
      )}

      {work && (
        <p className="mt-4 font-mono text-xs text-faint">
          {work.tech.join(" · ")}
        </p>
      )}

      {Boolean(work?.links.length) && (
        <p className="mt-5 flex flex-wrap gap-2">
          {work?.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-line-strong px-2.5 py-1.5 text-xs text-muted transition-all duration-200 hover:border-accent hover:text-foreground motion-safe:hover:-translate-y-0.5"
            >
              {link.label} <span aria-hidden className="text-faint">↗</span>
            </a>
          ))}
        </p>
      )}
    </div>
  );
}

/** 다운로드 비례 바 너비(px) — 0건도 흔적은 남긴다 */
function barWidth(downloads: number, max: number): number {
  return Math.max(Math.round((downloads / max) * 72), downloads > 0 ? 6 : 2);
}

/** 가지 이음선 — 릴리즈 노드 아래에서 플랫폼별로 갈라지는 ├ / └ */
function ForkConnector({
  side,
  last,
}: {
  side: "left" | "right";
  last: boolean;
}) {
  // 모바일은 항상 왼쪽에서, 데스크톱 왼쪽 열에서는 오른쪽에서 뻗는다
  const edge = side === "left" ? "left-0 sm:left-auto sm:right-0" : "left-0";
  return (
    <span aria-hidden className="relative block h-5 w-3 shrink-0">
      <span
        className={`absolute top-0 w-px bg-release/45 ${
          last ? "h-[10px]" : "h-full"
        } ${edge}`}
      />
      <span className={`absolute top-[10px] h-px w-3 bg-release/45 ${edge}`} />
    </span>
  );
}

/** 플랫폼 가지 한 줄 — 같은 공개물이 어디에 올라가 있는지 */
function PlatformBranch({
  source,
  side,
  max,
  last,
}: {
  source: ArtifactStat;
  side: "left" | "right";
  max: number;
  last: boolean;
}) {
  return (
    <span
      className={`flex h-5 items-center gap-2 ${
        side === "left" ? "sm:flex-row-reverse" : ""
      }`}
    >
      <ForkConnector side={side} last={last} />
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted transition-colors hover:text-accent"
      >
        {PLATFORM_LABEL[source.platform]}{" "}
        <span aria-hidden className="text-faint">
          ↗
        </span>
      </a>
      <span
        aria-hidden
        className="h-1.5 rounded-full bg-release"
        style={{ width: `${barWidth(source.downloads, max)}px` }}
      />
      <span className="font-mono text-xs text-muted tabular-nums">
        {source.downloads.toLocaleString()}
      </span>
    </span>
  );
}

/**
 * 릴리즈 행 — 공개한 데이터셋·모델. 카드 없이 git tag처럼 붙는다.
 * 같은 공개물을 두 플랫폼에 올렸으면 한 노드에서 플랫폼별로 갈라진다.
 */
function ReleaseRow({
  group,
  side,
  max,
  ui,
}: {
  group: ReleaseGroup;
  side: "left" | "right";
  max: number;
  ui: UIDict;
}) {
  const alignEnd = side === "left" ? "sm:items-end sm:text-right" : "";
  const justifyEnd = side === "left" ? "sm:justify-end" : "";
  const [only] = group.sources;
  const single = group.sources.length === 1;

  return (
    <div className={`flex flex-col ${alignEnd}`}>
      <p
        className={`flex flex-wrap items-center gap-x-2 text-xs text-faint ${justifyEnd}`}
      >
        <span className="font-mono tabular-nums">
          {toYearMonth(group.createdAt)}
        </span>
        <span className="rounded-sm border border-release/60 px-1.5 py-0.5 text-release">
          {ui.downloads.kinds[group.kind]}
        </span>
        {single ? (
          <span>· {PLATFORM_LABEL[only.platform]}</span>
        ) : (
          <span className="tabular-nums">
            · {ui.downloads.total(group.downloads.toLocaleString())}
          </span>
        )}
      </p>

      <p className="mt-1.5 text-sm font-medium">
        {single ? (
          <a
            href={only.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            {group.title}{" "}
            <span aria-hidden className="text-faint">
              ↗
            </span>
          </a>
        ) : (
          group.title
        )}
      </p>

      {single ? (
        <p className={`mt-1.5 flex items-center gap-2 ${justifyEnd}`}>
          <span
            aria-hidden
            className="h-1.5 rounded-full bg-release"
            style={{ width: `${barWidth(only.downloads, max)}px` }}
          />
          <span className="font-mono text-xs text-muted tabular-nums">
            {only.downloads.toLocaleString()}
          </span>
        </p>
      ) : (
        <ul
          className={`mt-1 flex flex-col ${
            side === "left" ? "sm:items-end" : ""
          }`}
        >
          {group.sources.map((source, i) => (
            <li key={`${source.platform}-${source.id}`}>
              <PlatformBranch
                source={source}
                side={side}
                max={max}
                last={i === group.sources.length - 1}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** 그래프에 얹는 항목 — 타임라인 카드 또는 릴리즈 */
type Entry =
  | { type: "item"; date: string; item: TimelineItem }
  | { type: "release"; date: string; group: ReleaseGroup };

/**
 * git 그래프 타임라인 — 가운데 main 줄기를 두고 위(과거)에서 아래(현재)로
 * 내려온다. 연구·개발·수상은 브랜치 카드, 공개물은 올린 날짜 위치에 릴리즈
 * 행으로 얹히고, 맨 아래 HEAD에 누적 다운로드 합계가 붙는다.
 * 모바일에서는 줄기가 왼쪽에 붙는다.
 */
export default async function GitGraph({ lang }: { lang: Lang }) {
  const ui = getUI(lang);
  const { artifacts } = await getOpenSourceStats();

  // 같은 공개물의 플랫폼별 배포는 한 노드로 묶어 세로 길이를 줄인다
  const groups = groupArtifacts(artifacts);
  const max = Math.max(
    ...groups.flatMap((g) => g.sources.map((s) => s.downloads)),
    1
  );

  // 내릴수록 최신 — 오래된 것부터. 같은 달이면 카드가 릴리즈보다 먼저.
  const entries: Entry[] = [
    ...timeline.map(
      (item): Entry => ({ type: "item", date: item.start, item })
    ),
    ...groups.map(
      (group): Entry => ({
        type: "release",
        date: toYearMonth(group.createdAt),
        group,
      })
    ),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const rows: ReactNode[] = [];
  let prevYear = "";
  let sideIndex = 0;
  // 직전 행이 연도 마커나 (높이가 낮은) 릴리즈 행이면 위로 끌어올리지 않는다
  let noPull = true;

  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    if (year !== prevYear) {
      prevYear = year;
      noPull = true;
      rows.push(
        <li key={`year-${year}`} className="relative flex pb-8 sm:justify-center">
          <span className="z-10 ml-4 -translate-x-1/2 bg-background px-2 py-0.5 font-mono text-xs text-faint sm:ml-0 sm:translate-x-0">
            {year}
          </span>
        </li>
      );
    }

    const side: "left" | "right" = sideIndex % 2 === 0 ? "left" : "right";
    sideIndex += 1;

    const key =
      entry.type === "item" ? entry.item.id : `release-${entry.group.key}`;

    const isAward = entry.type === "item" && entry.item.kind === "award";

    rows.push(
      <li key={key} className={`relative pb-8 ${noPull ? "" : "sm:-mt-24"}`}>
        <Reveal>
          {entry.type === "item" ? (
            <CommitDot color={isAward ? "bg-award" : "bg-accent"} />
          ) : (
            <ReleaseDot />
          )}
          <BranchLine
            side={side}
            color={
              entry.type === "release"
                ? "bg-release/50"
                : isAward
                  ? "bg-award/50"
                  : "bg-accent-dim"
            }
          />
          <div
            className={`ml-12 sm:ml-0 sm:w-[calc(50%-1.75rem)] ${
              side === "left" ? "sm:mr-auto" : "sm:ml-auto"
            }`}
          >
            {entry.type === "item" ? (
              <ModalCard
                label={entry.item.title[lang]}
                closeLabel={ui.modal.close}
                panelClassName={
                  isAward ? "border-award/60" : "border-accent/50"
                }
                card={<BranchCard item={entry.item} ui={ui} lang={lang} />}
                modal={<CardDetail item={entry.item} ui={ui} lang={lang} />}
              />
            ) : (
              <ReleaseRow
                group={entry.group}
                side={side}
                max={max}
                ui={ui}
              />
            )}
          </div>
        </Reveal>
      </li>
    );

    noPull = entry.type === "release";
  }

  return (
    <section className="relative">
      {/* main 줄기 */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-4 w-0.5 -translate-x-1/2 bg-accent-dim sm:left-1/2"
      />

      <ol>
        {rows}

        {/* HEAD — 그래프의 현재 지점 */}
        <li className="relative pb-2">
          <Reveal>
            <CommitDot hollow />
            <p className="ml-12 pt-0.5 text-xs text-accent sm:ml-0 sm:text-center">
              <span className="font-mono">HEAD</span> → {ui.timeline.present}
            </p>
          </Reveal>
        </li>
      </ol>
    </section>
  );
}
