import type { Metric } from "@/data/work";
import type { Lang } from "@/lib/i18n";

/** "68%" / "8,312MB" 같은 표기 문자열에서 숫자만 꺼낸다 */
export function num(s: string): number {
  return parseFloat(s.replace(/[^\d.]/g, ""));
}

/**
 * 전후 비교 덤벨 — 0–100% 축 하나에 "전"(어두운 그린)과 "후"(그린)를 찍는다.
 * 카드 안에서 쓰는 컴팩트 변형이라 라벨·값을 위, 축을 아래 줄에 둔다.
 */
export default function Dumbbell({
  metrics,
  lang,
}: {
  metrics: Metric[];
  lang: Lang;
}) {
  const rows = metrics.filter(
    (m) => m.before && m.after.includes("%") && m.before.includes("%")
  );
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      {rows.map((m) => {
        const before = num(m.before!);
        const after = num(m.after);
        const lo = Math.min(before, after);
        const span = Math.abs(after - before);

        return (
          <div key={m.label[lang]}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-muted">{m.label[lang]}</span>
              <span className="shrink-0 tabular-nums">
                <span className="text-faint">{m.before}</span>
                <span className="text-faint" aria-hidden>
                  {" → "}
                </span>
                <span className="font-semibold">{m.after}</span>
              </span>
            </div>

            <div className="relative mt-1.5 h-4" aria-hidden>
              {/* 0–100% 축 트랙 */}
              <span className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
              {/* 전→후 연결선 */}
              <span
                className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-accent-dim"
                style={{ left: `${lo}%`, width: `${span}%` }}
              />
              {/* 전(어두운 그린) · 후(그린) — 겹칠 때를 대비해 배경색 링 */}
              <span
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-dim ring-2 ring-surface"
                style={{ left: `${before}%` }}
              />
              <span
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface"
                style={{ left: `${after}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* 축 눈금 */}
      <div className="relative h-3 font-mono text-[10px] text-faint" aria-hidden>
        <span className="absolute left-0">0</span>
        <span className="absolute left-1/2 -translate-x-1/2">50</span>
        <span className="absolute right-0">100%</span>
      </div>
    </div>
  );
}
