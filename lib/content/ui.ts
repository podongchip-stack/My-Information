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
  nav: {
    home: string;
    now: string;
    experience: string;
    work: string;
    opensource: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
    switchLang: string;
  };
  hero: {
    role: string;
    headline: string[];
    tagline: string;
    ctaWork: string;
    ctaContact: string;
    scroll: string;
  };
  now: {
    label: string;
    title: string;
    lead: string;
    affiliationLabel: string;
    affiliation: string;
    labLabel: string;
    lab: string;
    focusLabel: string;
    focus: string[];
  };
  experience: {
    label: string;
    title: string;
    lead: string;
    kinds: { work: string; project: string; award: string };
    present: string;
  };
  work: {
    label: string;
    title: string;
    lead: string;
    readCase: string;
    teamNote: (size: number) => string;
    soloNote: string;
    noCase: string;
  };
  opensource: {
    label: string;
    title: string;
    lead: string;
    totalLabel: string;
    downloads: string;
    empty: string;
    kinds: { dataset: string; model: string };
  };
  contact: {
    label: string;
    title: string;
    lead: string;
    thanks: string;
    greetingAlt: string;
  };
  caseStudy: {
    back: string;
    overview: string;
    problem: string;
    myRole: string;
    approach: string;
    result: string;
    retrospective: string;
    stack: string;
    period: string;
    links: string;
    notFound: string;
  };
  footer: {
    builtWith: string;
    source: string;
  };
}

const ko: UIDict = {
  meta: {
    title: "김동현 — 백엔드 · AI 엔지니어",
    description:
      "온프레미스 문서 인식 파이프라인, BMS SoC/SoH 예측 연구, 백엔드 개발. 경상국립대 전자공학부 · EDCL 랩.",
    ogTitle: "DONG HYEON — 백엔드 · AI 엔지니어",
    ogDescription:
      "측정 가능한 결과로 말하는 포트폴리오 — 문서 인식 파이프라인 재현율 68% → 88%, VRAM 1/4.",
  },
  nav: {
    home: "홈",
    now: "지금",
    experience: "경력",
    work: "작업",
    opensource: "오픈소스",
    contact: "연락",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    switchLang: "English로 보기",
  },
  hero: {
    role: "BACKEND · AI ENGINEER",
    headline: ["측정할 수 있는", "결과로 만듭니다"],
    tagline:
      "백엔드와 AI를 다루고, 전자공학 전공이라 하드웨어까지 읽습니다.",
    ctaWork: "작업 보기",
    ctaContact: "연락하기",
    scroll: "스크롤",
  },
  now: {
    label: "지금",
    title: "Now",
    lead: "2026년 현재 하고 있는 일.",
    affiliationLabel: "소속",
    affiliation: "경상국립대학교 전자공학부",
    labLabel: "연구실",
    lab: "BNIT Electronic Design Circuit Lab (EDCL)",
    focusLabel: "집중",
    focus: [
      "ESS 배터리 SoC/SoH 예측 모델 연구",
      "온프레미스 문서 인식 파이프라인 설계",
      "Java/Spring 기반 서버 설계",
    ],
  },
  experience: {
    label: "경력",
    title: "Experience",
    lead: "연구·개발·수상을 시간순으로.",
    kinds: { work: "연구", project: "개발", award: "수상" },
    present: "현재",
  },
  work: {
    label: "작업",
    title: "Work",
    lead: "무엇을 왜 만들었고, 무엇이 달라졌는지.",
    readCase: "케이스 스터디 읽기",
    teamNote: (size) => `${size}인 팀 프로젝트`,
    soloNote: "개인 프로젝트",
    noCase: "상세 기록 준비 중",
  },
  opensource: {
    label: "오픈소스",
    title: "Open Source",
    lead: "Hugging Face · Kaggle에 공개한 데이터셋과 모델.",
    totalLabel: "누적 다운로드",
    downloads: "다운로드",
    empty: "통계를 불러오지 못했습니다.",
    kinds: { dataset: "데이터셋", model: "모델" },
  },
  contact: {
    label: "연락",
    title: "Contact",
    lead: "협업이나 문의는 언제든 환영합니다.",
    thanks: "끝까지 봐주셔서 감사합니다.",
    greetingAlt: "인사하는 고양이 캐릭터 애니메이션",
  },
  caseStudy: {
    back: "작업 목록으로",
    overview: "개요",
    problem: "문제",
    myRole: "맡은 범위",
    approach: "접근",
    result: "결과",
    retrospective: "회고",
    stack: "기술 스택",
    period: "기간",
    links: "링크",
    notFound: "요청한 케이스 스터디를 찾을 수 없습니다.",
  },
  footer: {
    builtWith: "Next.js · React Three Fiber로 제작",
    source: "소스 보기",
  },
};

const en: UIDict = {
  meta: {
    title: "Donghyeon Kim — Backend · AI Engineer",
    description:
      "On-premise document recognition pipelines, battery SoC/SoH prediction research, backend development. Gyeongsang National University, EDCL Lab.",
    ogTitle: "DONG HYEON — Backend · AI Engineer",
    ogDescription:
      "A portfolio that argues with numbers — document recognition recall 68% → 88% at a quarter of the VRAM.",
  },
  nav: {
    home: "Home",
    now: "Now",
    experience: "Experience",
    work: "Work",
    opensource: "Open Source",
    contact: "Contact",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchLang: "한국어로 보기",
  },
  hero: {
    role: "BACKEND · AI ENGINEER",
    headline: ["Built to be", "measured"],
    tagline:
      "I work across backend and AI, and my electronics background lets me read the hardware too.",
    ctaWork: "See the work",
    ctaContact: "Get in touch",
    scroll: "SCROLL",
  },
  now: {
    label: "Now",
    title: "Now",
    lead: "What I am working on in 2026.",
    affiliationLabel: "School",
    affiliation:
      "Gyeongsang National University, Dept. of Electronic Engineering",
    labLabel: "Lab",
    lab: "BNIT Electronic Design Circuit Lab (EDCL)",
    focusLabel: "Focus",
    focus: [
      "SoC/SoH prediction models for ESS batteries",
      "On-premise document recognition pipelines",
      "Server design with Java/Spring",
    ],
  },
  experience: {
    label: "Experience",
    title: "Experience",
    lead: "Research, engineering and awards, in order.",
    kinds: { work: "Research", project: "Engineering", award: "Award" },
    present: "Present",
  },
  work: {
    label: "Work",
    title: "Work",
    lead: "What I built, why, and what changed because of it.",
    readCase: "Read the case study",
    teamNote: (size) => `Team of ${size}`,
    soloNote: "Solo project",
    noCase: "Write-up in progress",
  },
  opensource: {
    label: "Open Source",
    title: "Open Source",
    lead: "Datasets and models published on Hugging Face and Kaggle.",
    totalLabel: "Total downloads",
    downloads: "downloads",
    empty: "Could not load statistics.",
    kinds: { dataset: "Dataset", model: "Model" },
  },
  contact: {
    label: "Contact",
    title: "Contact",
    lead: "Always open to collaboration and questions.",
    thanks: "Thanks for reading all the way down.",
    greetingAlt: "Animation of a cat waving hello",
  },
  caseStudy: {
    back: "Back to work",
    overview: "Overview",
    problem: "Problem",
    myRole: "My scope",
    approach: "Approach",
    result: "Result",
    retrospective: "Retrospective",
    stack: "Stack",
    period: "Period",
    links: "Links",
    notFound: "That case study does not exist.",
  },
  footer: {
    builtWith: "Built with Next.js and React Three Fiber",
    source: "View source",
  },
};

export const UI: Record<Lang, UIDict> = { ko, en };

export function getUI(lang: Lang): UIDict {
  return UI[lang];
}
