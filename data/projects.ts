export type ProjectCategory = "hardware" | "backend" | "ai" | "web";

export interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  github: string;
  demo: string;
  image?: string; // 선택 — 비워두거나 생략하면 썸네일 영역이 표시되지 않음
  period: string;
  category: ProjectCategory;
}

// TODO: 아래는 기획서의 "예상 프로젝트 목록" 기반 플레이스홀더입니다.
// 실제 프로젝트명/설명/기간/링크/이미지로 교체하세요.
export const projects: Project[] = [
  {
    id: 1,
    title: "BMS Research Project",
    description: "ESS 에서 SoC 및 SoH 관련 연구",
    tech: ["LSTM", "Transformer", "Ansys"],
    github: "",
    demo: "",
    image: "",
    period: "2026.03 ~ 현재",
    category: "hardware",
  },
  {
    id: 2,
    title: "Lab Page Dev",
    description: "HTML/CSS/JS 기반 페이지 Firebase 연동, 연구실 페이지 개발 및 유지 보수",
    tech: ["HTML", "CSS", "JavaScript", "Firebase Realtime Rules"],
    github: "",
    demo: "",
    image: "",
    period: "2026.04 ~ 현재",
    category: "backend",
  },
  {
    id: 3,
    title: "LLM Model Learning ( Fine Tuning ) Project",
    description: "직접 데이터셋을 구성해 LLM 모델을 학습 후, User Input 을 가지고 학습 모델이 여러 생성형 AI의 강점에 맞게 Prompt Engineering",
    tech: ["LLM", "Python"],
    github: "",
    demo: "",
    image: "",
    period: "2026.01 ~ 05",
    category: "ai",
  },
  {
    id: 4,
    title: "Stock Agent",
    description: "LSTM, LLM 등을 활용하여 나온 값을 Ensemble Learning 하여 자동으로, 분석 보고서 제작 및 매수 매도 실행",
    tech: ["LSTM", "LLM", "json", "Python"],
    github: "",
    demo: "", 
    image: "",
    period: "2025.12 ~ 현재",
    category: "web",
  },
];
