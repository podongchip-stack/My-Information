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
    lab: string;
    /** 히어로 문장 — em 부분만 그린으로 강조된다 */
    claim: { lead: string; em: string; tail: string };
    email: string;
    switchLang: string;
    theme: string;
  };
  kpi: {
    downloads: string;
    downloadsNote: string;
    releases: string;
    releasesNote: string;
    certs: string;
    certsNote: (date: string) => string;
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
    /** 여러 플랫폼에 올린 공개물의 합계 표기 */
    total: (count: string) => string;
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
    title: "김동현 — Backend Developer · AI System Engineer",
    description:
      "생성형 LLM이 하던 응급 통화 구조화를 직접 설계한 분류 모델로 바꿔 응답 39ms, 문서 인식 재현율 68% → 88%. 경상국립대 전자공학부 · EDCL 랩.",
    ogTitle: "김동현 — Backend Developer · AI System Engineer",
    ogDescription:
      "14B LLM이 하던 일을, 직접 설계한 모델로 39ms에.",
  },
  hero: {
    name: "김동현",
    role: "Backend Developer · AI System Engineer",
    affiliation: "경상국립대학교 전자공학부",
    lab: "BNIT EDCL LAB",
    claim: {
      lead: "14B LLM이 하던 일을, 직접 설계한 모델로 ",
      em: "39ms",
      tail: "에.",
    },
    email: "이메일 보내기",
    switchLang: "English로 보기",
    theme: "밝은 화면과 어두운 화면 전환",
  },
  kpi: {
    downloads: "오픈소스 누적 다운로드",
    downloadsNote: "Hugging Face · Kaggle 실시간",
    releases: "공개 데이터셋 · 모델",
    releasesNote: "Hugging Face · Kaggle",
    certs: "자격증 보유",
    certsNote: (date) => `최근 취득 ${date}`,
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
    total: (count) => `누적 ${count}`,
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
    title: "Donghyeon Kim — Backend Developer · AI System Engineer",
    description:
      "Replaced a generative LLM in emergency-call structuring with a classifier I designed, answering in 39 ms; lifted document recognition recall from 68% to 88%. Gyeongsang National University, EDCL Lab.",
    ogTitle: "Donghyeon Kim — Backend Developer · AI System Engineer",
    ogDescription:
      "The job a 14B LLM did, done by a model I designed in 39 ms.",
  },
  hero: {
    name: "Donghyeon Kim",
    role: "Backend Developer · AI System Engineer",
    affiliation:
      "Dept. of Electronic Engineering, Gyeongsang National University",
    lab: "BNIT EDCL LAB",
    claim: {
      lead: "The job a 14B LLM did, done by a model I designed in ",
      em: "39 ms",
      tail: ".",
    },
    email: "Email me",
    switchLang: "한국어로 보기",
    theme: "Switch between light and dark",
  },
  kpi: {
    downloads: "Open-source downloads",
    downloadsNote: "Hugging Face · Kaggle, live",
    releases: "Public datasets · models",
    releasesNote: "Hugging Face · Kaggle",
    certs: "Certifications",
    certsNote: (date) => `latest ${date}`,
    projects: "Projects",
    projectsNote: (ongoing) => `${ongoing} ongoing`,
    awards: "Awards",
    awardsNote: "Hackathons · competitions",
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
    total: (count) => `${count} total`,
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
