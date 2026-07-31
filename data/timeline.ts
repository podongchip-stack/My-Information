import type { L10n } from "@/lib/i18n";

export type TimelineKind = "work" | "project" | "award";

export interface TimelineItem {
  id: string;
  /** 정렬 기준. YYYY.MM 형식 문자열 비교로 내림차순 정렬한다. */
  start: string;
  /** 표시용 기간 문자열. 진행 중이면 end를 비운다. */
  end?: string;
  ongoing?: boolean;
  kind: TimelineKind;
  title: L10n;
  org: L10n;
  detail: L10n;
  /** 카드에 불릿으로 표시할 상세 성과·역할 목록 (선택) */
  highlights?: L10n<string[]>;
  /** 있으면 해당 케이스 스터디로 링크된다 */
  workSlug?: string;
}

export const timeline: TimelineItem[] = [
  {
    id: "ai-rookie",
    start: "2026.07",
    ongoing: true,
    kind: "project",
    title: {
      ko: "2026 AI ROOKIE 대회 — 골든링크",
      en: "2026 AI ROOKIE — GoldenLink",
    },
    org: { ko: "6인 팀 · OCR 파트 담당", en: "Team of 6 · OCR module" },
    detail: {
      ko: "응급이송 지원 플랫폼의 온프레미스 문서 인식 모듈을 설계·구현했습니다.",
      en: "Designed and built the on-premise document recognition module for an emergency transport platform.",
    },
    workSlug: "goldenlink-ocr",
  },
  {
    id: "lab-web",
    start: "2026.04",
    ongoing: true,
    kind: "project",
    title: { ko: "연구실 웹사이트 개발 · 운영", en: "Lab website" },
    org: { ko: "EDCL Lab", en: "EDCL Lab" },
    detail: {
      ko: "Firebase 연동 웹사이트를 개발하고 유지보수하고 있습니다.",
      en: "Building and maintaining the lab site, integrated with Firebase.",
    },
    workSlug: "lab-website",
  },
  {
    id: "bms",
    start: "2026.03",
    ongoing: true,
    kind: "work",
    title: { ko: "ESS 배터리 SoC · SoH 연구", en: "ESS battery SoC / SoH research" },
    org: {
      ko: "경상국립대학교 BNIT EDCL Lab",
      en: "BNIT EDCL Lab, Gyeongsang National University",
    },
    detail: {
      ko: "시계열 모델로 배터리 충전 상태와 수명을 추정하는 연구를 진행 중입니다.",
      en: "Estimating battery charge state and health with sequence models.",
    },
    workSlug: "bms-soc-soh",
  },
  {
    id: "llm-ft",
    start: "2026.01",
    end: "2026.05",
    kind: "project",
    title: { ko: "LLM 파인튜닝 · 프롬프트 라우팅", en: "LLM fine-tuning and prompt routing" },
    org: { ko: "개인 프로젝트", en: "Solo project" },
    detail: {
      ko: "데이터셋을 직접 구성해 모델을 학습시키고, 입력을 모델별 강점에 맞게 다시 쓰는 실험을 했습니다.",
      en: "Built a dataset, fine-tuned on it, and rewrote prompts to fit each model's strengths.",
    },
    workSlug: "llm-prompt-routing",
  },
  {
    id: "stock-agent",
    start: "2025.12",
    ongoing: true,
    kind: "project",
    title: { ko: "Stock Agent", en: "Stock Agent" },
    org: { ko: "개인 프로젝트", en: "Solo project" },
    detail: {
      ko: "FastAPI 추론 서버 + React 콘솔. 뉴스 감성·재무·차트 분석 에이전트가 매일 데이터를 쌓고 모의투자를 실행합니다.",
      en: "A FastAPI inference server with a React console — sentiment, financials and chart agents accumulate data daily and run simulated trading.",
    },
    workSlug: "stock-agent",
  },
  {
    id: "busan-hackathon",
    start: "2025.09",
    kind: "award",
    title: {
      ko: "제2회 부산 글로벌허브도시 청년 해커톤",
      en: "2nd Busan Global Hub City Youth Hackathon",
    },
    org: { ko: "부산광역시", en: "Busan Metropolitan City" },
    detail: {
      ko: "구도심의 **늘어나는 공실을 활용**한 글로벌 미디어 타운을 제안했습니다.",
      en: "Proposed a global media town built out of the **growing vacancy** in Busan's old downtown.",
    },
  },
  {
    id: "gnu-esg",
    start: "2025.06",
    kind: "award",
    title: { ko: "GNU-SDGs / ESG 공모전", en: "GNU-SDGs / ESG Competition" },
    org: { ko: "경상국립대학교", en: "Gyeongsang National University" },
    detail: {
      ko: "유리병 반환 시 **현금 대신 포인트를 지급해 참여도**를 끌어올리는 방안을 제안했습니다.",
      en: "Proposed **paying points instead of cash** for returned glass bottles to lift participation.",
    },
  },
];

/** 최신순 */
export const sortedTimeline = [...timeline].sort((a, b) =>
  b.start.localeCompare(a.start)
);
