"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { DatasetStat } from "@/lib/stats";

function CountUp({
  to,
  duration = 1400,
  className = "",
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * to));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  // 최종 숫자로 폭을 미리 확보해 두지 않으면 카운트 중 자릿수가 늘 때마다
  // 레이아웃이 출렁여 스크롤이 덜덜거린다 (스크롤 앵커링 충돌)
  // 주의: bg-clip-text는 절대배치된 자손 텍스트를 클립 영역에 포함하지 않으므로
  // 그라데이션 클래스는 조상 래퍼가 아닌 여기 className으로 받아 숫자 span에 직접 입힌다
  return (
    <span ref={ref} className="relative inline-block whitespace-nowrap tabular-nums">
      <span className="invisible" aria-hidden>
        {to.toLocaleString()}
      </span>
      <span className={`absolute inset-0 ${className}`}>
        {value.toLocaleString()}
      </span>
    </span>
  );
}

const PLATFORM_LABEL: Record<DatasetStat["platform"], string> = {
  huggingface: "🤗 Hugging Face",
  kaggle: "📊 Kaggle",
};

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

// 순위(0=1순위)별 막대 높이 — 1순위가 가장 높고 3순위가 가장 낮다
const RANK_HEIGHT = [
  "h-[326px] sm:h-[358px]",
  "h-[262px] sm:h-[294px]",
  "h-[198px] sm:h-[230px]",
];

export default function StatsGrid({
  datasets,
  totalDownloads,
}: {
  datasets: DatasetStat[];
  totalDownloads: number;
}) {
  if (datasets.length === 0) {
    return (
      <p className="text-sm text-muted">
        통계를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
      </p>
    );
  }

  return (
    <>
      <ScrollReveal delay={0.1}>
        <p className="mb-12 text-5xl font-bold sm:text-6xl">
          <CountUp
            to={totalDownloads}
            className="bg-gradient-to-r from-accent to-accent-purple bg-clip-text text-transparent"
          />
          <span className="ml-3 text-xl font-medium text-muted">
            누적 다운로드
          </span>
        </p>
      </ScrollReveal>

      {/* 오른쪽으로 올라가는 막대 그래프: 왼쪽부터 3순위 → 2순위 → 1순위 */}
      <div className="flex items-end justify-center gap-3 sm:gap-6">
        {datasets
          .slice(0, 3)
          .map((d, i) => ({ d, rank: i }))
          .reverse()
          .map(({ d, rank }) => (
            <ScrollReveal
              key={`${d.platform}-${d.id}`}
              delay={0.1 + (2 - rank) * 0.12}
            >
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex ${RANK_HEIGHT[rank]} w-28 flex-col justify-between rounded-t-2xl border border-b-0 border-border-subtle bg-gradient-to-b from-card to-card/40 p-4 transition-colors hover:border-accent/50 sm:w-44 sm:p-5`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-accent to-accent-purple px-2 py-0.5 text-[11px] font-semibold text-white sm:px-2.5 sm:text-xs">
                    <span aria-hidden>{RANK_MEDAL[rank]}</span>
                    {rank + 1}순위
                  </span>
                  {/* 모바일 폭에선 뱃지와 한 줄에 안 들어가 줄바꿈을 일으키므로 sm 이상에서만 표시 */}
                  <span className="hidden text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:inline">
                    ↗
                  </span>
                </div>

                <div>
                  <span className="mb-1 block text-[11px] font-medium text-muted">
                    {PLATFORM_LABEL[d.platform]}
                  </span>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                    {d.title}
                  </h3>
                  <p className="text-xl font-bold sm:text-2xl">
                    <CountUp
                      to={d.downloads}
                      className="bg-gradient-to-r from-accent to-accent-purple bg-clip-text text-transparent"
                    />
                  </p>
                  <span className="text-[11px] font-medium text-muted">
                    downloads
                  </span>
                </div>
              </a>
            </ScrollReveal>
          ))}
      </div>
      {/* 그래프 바닥선 */}
      <div className="mx-auto h-px max-w-3xl bg-border-subtle" />
    </>
  );
}
