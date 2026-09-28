import type { L10n } from "@/lib/i18n";

/**
 * 히어로 아래 결과 창 — 대표 성과 하나를 크게 보여준다.
 * 출처: C:\Dev\HMM (Qwen-ASR·HMM 기술문서, BANCHMARK/results/benchmark_run.log).
 * 속도 비교 대상은 생성형 Qwen3-1.7B다. note에 반드시 남길 것.
 */
export interface HighlightBar {
  label: L10n;
  before: number;
  after: number;
  unit: L10n;
}

export const highlight = {
  window: {
    ko: "골든링크 · 응급 통화 → 환자 정보 6개 필드",
    en: "GoldenLink · emergency call → 6 patient fields",
  } as L10n,
  label: { ko: "구조화 응답 시간 (p50)", en: "Structuring latency (p50)" } as L10n,
  before: "9,264ms",
  after: "39ms",
  note: {
    ko: "생성형 Qwen3-1.7B 대비 · RTX 5080 · 평가 355건",
    en: "vs. generative Qwen3-1.7B · RTX 5080 · 355 eval calls",
  } as L10n,
  bars: [
    {
      label: { ko: "처리량", en: "Throughput" },
      before: 0.09,
      after: 24.8,
      unit: { ko: "건/초", en: " req/s" },
    },
    {
      label: { ko: "VRAM 피크", en: "Peak VRAM" },
      before: 4.31,
      after: 3.01,
      unit: { ko: "GB", en: " GB" },
    },
    {
      label: { ko: "통화 종료 → 결과", en: "Call end → result" },
      before: 61.1,
      after: 3.7,
      unit: { ko: "초", en: " s" },
    },
  ] satisfies HighlightBar[],
};
