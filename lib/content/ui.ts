import type { Lang } from "@/lib/i18n";

/**
 * UI 문자열 사전. 프로젝트/타임라인 같은 "콘텐츠"는 data/ 아래에서
 * 항목마다 ko/en을 함께 들고 있고, 여기에는 화면 껍데기 문구만 둔다.
 */
export interface UIDict {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  hero: {
    name: string;
    role: string;
    affiliation: string;
    claim: string;
    switchLang: string;
  };
  kpi: {
    downloads: string;
    downloadsNote: (date: string) => string;
    certs: string;
    certsNote: (date: string) => string;
    certsEmpty: string;
    projects: string;
    projectsNote: (ongoing: number) => string;
    awards: string;
    awardsNote: string;
  };
  ocr: {
    title: string;
    note: string;
    vram: string;
    vramNote: string;
  };
  timeline: {
    present: string;
    ongoing: string;
    poster: string;
    kinds: { work: string; project: string; award: string };
  };
  downloads: {
    empty: string;
    kinds: { dataset: string; model: string };
  };
  modal: {
    close: string;
    more: string;
  };
  footer: {
    source: string;
  };
}

const ko: UIDict = {
  meta: {
    title: "김동현 — 백엔드 · AI 엔지니어",
    description:
      "온프레미스 문서 인식 파이프라인, BMS SoC/SoH 예측 연구, 백엔드 개발. 경상국립대 전자공학부 · EDCL 랩.",
    ogTitle: "김동현 — 백엔드 · AI 엔지니어",
    ogDescription:
      "측정 가능한 결과로 말하는 포트폴리오 — 문서 인식 파이프라인 재현율 68% → 88%, VRAM 1/4.",
  },
  hero: {
    name: "KIM DONG HYEON",
    role: "백엔드 · AI 엔지니어",
    affiliation: "경상국립대학교 전자공학부 · BNIT EDCL LAB",
    claim:
      "전자공학을 기반으로 백엔드와 AI를 오가며, 모든 결과를 측정 가능한 숫자로 남기는 개발자입니다.",
    switchLang: "English로 보기",
  },
  kpi: {
    downloads: "오픈소스 누적 다운로드",
    downloadsNote: (date) => `${date} 기준 · 실시간`,
    certs: "자격증 보유",
    certsNote: (date) => `최근 취득 ${date}`,
    certsEmpty: "목록 준비 중",
    projects: "프로젝트",
    projectsNote: (ongoing) => `${ongoing}건 진행 중`,
    awards: "수상",
    awardsNote: "해커톤 · 공모전",
  },
  ocr: {
    title: "개선 전후",
    note: "한글 실물 문서 15장 · 핵심 문자열 268개 기준",
    vram: "VRAM 피크",
    vramNote: "영역 분리 라우팅으로 4분의 1",
  },
  timeline: {
    present: "현재",
    ongoing: "진행 중",
    poster: "포스터",
    kinds: { work: "연구", project: "개발", award: "수상" },
  },
  downloads: {
    empty: "통계를 불러오지 못했습니다.",
    kinds: { dataset: "데이터셋", model: "모델" },
  },
  modal: {
    close: "닫기",
    more: "자세히",
  },
  footer: {
    source: "소스 보기",
  },
};

const en: UIDict = {
  meta: {
    title: "Donghyeon Kim — Backend · AI Engineer",
    description:
      "On-premise document recognition pipelines, battery SoC/SoH prediction research, backend development. Gyeongsang National University, EDCL Lab.",
    ogTitle: "Donghyeon Kim — Backend · AI Engineer",
    ogDescription:
      "A portfolio that argues with numbers — document recognition recall 68% → 88% at a quarter of the VRAM.",
  },
  hero: {
    name: "KIM DONG HYEON",
    role: "Backend · AI Engineer",
    affiliation:
      "Dept. of Electronic Engineering, Gyeongsang National University · BNIT EDCL LAB",
    claim:
      "An engineer moving across electronics, backend and AI — leaving every result as a measurable number.",
    switchLang: "한국어로 보기",
  },
  kpi: {
    downloads: "Open-source downloads",
    downloadsNote: (date) => `as of ${date} · live`,
    certs: "Certifications",
    certsNote: (date) => `latest ${date}`,
    certsEmpty: "List in progress",
    projects: "Projects",
    projectsNote: (ongoing) => `${ongoing} ongoing`,
    awards: "Awards",
    awardsNote: "Hackathon · competition",
  },
  ocr: {
    title: "Before & after",
    note: "Measured on 15 real Korean documents, 268 key strings",
    vram: "Peak VRAM",
    vramNote: "Down to a quarter via region routing",
  },
  timeline: {
    present: "Now",
    ongoing: "Ongoing",
    poster: "poster",
    kinds: { work: "Research", project: "Engineering", award: "Award" },
  },
  downloads: {
    empty: "Could not load statistics.",
    kinds: { dataset: "Dataset", model: "Model" },
  },
  modal: {
    close: "Close",
    more: "Details",
  },
  footer: {
    source: "View source",
  },
};

export const UI: Record<Lang, UIDict> = { ko, en };

export function getUI(lang: Lang): UIDict {
  return UI[lang];
}
