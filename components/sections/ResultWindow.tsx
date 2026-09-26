import ZoomOnScroll from "@/components/ui/ZoomOnScroll";
import { highlight } from "@/data/highlight";
import type { Lang } from "@/lib/i18n";

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * 히어로 아래 대표 성과 — 앱 창 모양의 패널에 전후 수치를 담는다.
 * 막대는 항목마다 전·후 중 큰 값을 100%로 잡는다(항목끼리는 비교하지 않음).
 */
export default function ResultWindow({ lang }: { lang: Lang }) {
  return (
    <ZoomOnScroll className="rounded-2xl border border-line bg-surface p-4 sm:p-10">
      <figure className="mx-auto max-w-[720px] rounded-xl border border-line bg-background shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_rgb(0_0_0/0.06)]">
        <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden className="h-2.5 w-2.5 rounded-full bg-line" />
          ))}
          <figcaption className="ml-2 truncate text-xs text-faint">
            {highlight.window[lang]}
          </figcaption>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-7">
          <p className="text-[0.8125rem] font-medium text-muted">
            {highlight.label[lang]}
          </p>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3.5 font-mono tabular-nums">
            <span className="text-[clamp(1.75rem,7vw,2.75rem)] text-faint">
              {highlight.before}
            </span>
            <span aria-hidden className="text-faint">→</span>
            <span className="text-[clamp(2.5rem,11vw,4.5rem)] leading-none font-semibold text-accent-ink">
              {highlight.after}
            </span>
          </p>
          <p className="mt-2 text-xs text-faint">{highlight.note[lang]}</p>

          <dl className="mt-6 grid gap-4">
            {highlight.bars.map((b) => {
              const max = Math.max(b.before, b.after);
              const pct = (v: number) => `${Math.max((v / max) * 100, 1)}%`;
              return (
                <div
                  key={b.label.en}
                  className="grid gap-1.5 sm:grid-cols-[9.5em_1fr] sm:items-center sm:gap-4"
                >
                  <dt className="text-[0.8125rem] text-muted">{b.label[lang]}</dt>
                  <dd className="relative h-[38px]">
                    <span className="absolute top-0 right-0 font-mono text-[0.6875rem] leading-[14px] text-muted tabular-nums">
                      {fmt(b.before)} → {fmt(b.after)}
                      {b.unit[lang]}
                    </span>
                    <span
                      aria-hidden
                      className="absolute top-4 left-0 h-2.5 rounded-[3px] bg-line"
                      style={{ width: pct(b.before) }}
                    />
                    <span
                      aria-hidden
                      className="absolute top-7 left-0 h-2.5 rounded-[3px] bg-accent"
                      style={{ width: pct(b.after) }}
                    />
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </figure>
    </ZoomOnScroll>
  );
}
