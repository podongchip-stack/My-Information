import type { L10n } from "@/lib/i18n";

export type WorkKind = "research" | "ai" | "backend";

/** 수치 비교 한 줄. before가 있으면 "이전 → 이후"로 렌더링된다. */
export interface Metric {
  label: L10n;
  before?: string;
  after: string;
  note?: L10n;
}

export interface CaseStudy {
  /** 상세 페이지 최상단 한 문단 */
  lead: L10n;
  problem: L10n<string[]>;
  /** 팀 프로젝트에서 내가 실제로 맡은 범위 — 팀 성과와 섞어 쓰지 않는다 */
  role: L10n<string[]>;
  approach: L10n<string[]>;
  metrics?: Metric[];
  /** metrics 표 아래에 붙는 해설 */
  result?: L10n<string[]>;
  retrospective?: L10n<string[]>;
}

export interface WorkItem {
  slug: string;
  title: L10n;
  /** 목록 카드에 쓰는 한 줄 요약 */
  summary: L10n;
  period: string;
  ongoing: boolean;
  kind: WorkKind;
  /** 팀 규모. 없으면 개인 프로젝트로 표시 */
  team?: number;
  tech: string[];
  links: { label: string; href: string }[];
  /** 상세 기록 — metrics는 타임라인 카드의 전후 차트에 쓰인다 */
  study?: CaseStudy;
}

export const work: WorkItem[] = [
  {
    slug: "goldenlink-ocr",
    title: {
      ko: "골든링크 — 병원 서류 인식 파이프라인",
      en: "GoldenLink — Hospital Document Recognition Pipeline",
    },
    summary: {
      ko: "응급이송 지원 플랫폼의 문서 인식 모듈. 영역별 분리 라우팅으로 재현율 68% → 88%, VRAM은 1/4로.",
      en: "The document recognition module of an emergency transport platform. Region-level routing lifted recall from 68% to 88% at a quarter of the VRAM.",
    },
    period: "2026.07",
    ongoing: true,
    kind: "ai",
    team: 6,
    tech: [
      "Python",
      "ONNX Runtime",
      "PaddleOCR-VL",
      "DocLayout-YOLO",
      "Hugging Face",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/podongchip-stack/AIRookie/tree/feature/info/ocr",
      },
      {
        label: "Hugging Face",
        href: "https://huggingface.co/podongchip/DocLayout-YOLO-DocStructBench-ONNX",
      },
    ],
    study: {
      lead: {
        ko: "2026 AI ROOKIE 대회 출품작 '골든링크'는 응급이송 과정의 정보를 자동으로 구조화해 병원 수용 판단을 돕는 플랫폼입니다. 저는 6인 팀에서 병원 서류 이미지를 텍스트로 바꾸는 온프레미스 OCR 모듈(feature/info)을 맡았습니다.",
        en: "GoldenLink, our entry for the 2026 AI ROOKIE competition, structures information during emergency transport so hospitals can decide faster. On a team of six I owned the on-premise OCR module (feature/info) that turns hospital document images into text.",
      },
      problem: {
        ko: [
          "구급대원이 병원에 순차적으로 전화를 돌리는 이른바 '뺑뺑이' 때문에 골든타임이 새어 나갑니다. 골든링크는 첫 통화 내용을 구조화해 존(Zone) 내 후보 병원 전체에 동시에 전달하는 것으로 이 문제를 풉니다.",
          "그러려면 병원이 발급하는 서류 이미지를 기계가 읽을 수 있어야 합니다. 다만 환자 정보를 다루므로 외부 상용 API로 데이터를 내보낼 수 없고, 모든 처리가 로컬에서 끝나야 한다는 제약이 있었습니다.",
          "처음에는 페이지 전체를 인식 모델에 한 번에 넣었습니다. 재현율이 68%에 그쳤고, 팩스로 들어온 저품질 문서에서는 5%까지 떨어졌습니다. VRAM은 8GB를 넘겼고 같은 문장을 무한히 반복 생성하는 루프도 잦았습니다.",
        ],
        en: [
          "Paramedics call hospitals one after another, and the golden hour drains away in the process. GoldenLink attacks this by structuring the first call and broadcasting it to every candidate hospital in the zone at once.",
          "That requires machine-readable hospital documents. Because the data is patient information, nothing may leave for a commercial API — every step has to finish locally.",
          "My first attempt pushed the whole page through the recognition model in one prompt. Recall stalled at 68%, and on low-quality faxed documents it collapsed to 5%. VRAM peaked above 8GB and the model frequently fell into infinite repetition loops.",
        ],
      },
      role: {
        ko: [
          "OCR 모듈 전체 설계와 구현 (레이아웃 검출 · 라우팅 · 인식 · 검증).",
          "라이선스 검토와 ONNX 변환본 재배포.",
          "한글 실물 문서 15장(핵심 문자열 268개)으로 정답지를 만들고 성능을 측정.",
          "저장소 초기 구조와 브랜치 전략 수립.",
          "음성 STT·매칭 엔진·대시보드는 다른 팀원이 맡았고, 아래 수치는 OCR 모듈에 한정된 것입니다.",
        ],
        en: [
          "Designed and implemented the whole OCR module — layout detection, routing, recognition, validation.",
          "Reviewed licensing and republished an ONNX conversion of the layout model.",
          "Built the ground truth set (15 real Korean documents, 268 key strings) and measured against it.",
          "Set up the repository structure and branching strategy.",
          "Speech-to-text, the matching engine and the dashboard were owned by teammates; every number below is scoped to the OCR module.",
        ],
      },
      approach: {
        ko: [
          "페이지를 통째로 넘기는 대신 네 단계로 쪼갰습니다. ① 레이아웃 검출(AI)로 영역 위치와 종류 10종을 분류하고, ② 규칙 기반으로 중복을 제거해 읽기 순서를 잡은 뒤 종류별 태스크를 배분하고, ③ 영역별로 인식(AI)하되 표는 표 모드, 본문은 OCR 모드로 프롬프트를 나누고, ④ 반복 생성이나 토큰 한도 도달을 규칙으로 잡아 needs_review 플래그를 답니다.",
          "인식 모델은 그대로 두고 입력 방식만 바꾼 것이 핵심입니다. 잘라낸 조각이 작아지니 VRAM이 오히려 크게 줄었고, 페이지 전체를 하나의 프롬프트로 밀어 넣을 때 생기던 무한 반복도 사라졌습니다.",
          "팀 원칙상 어떤 단계가 AI 처리이고 어떤 단계가 규칙 기반인지 구분되어야 해서, 결과 JSON에도 단계별로 source 필드를 남깁니다. 매칭 판단이 설명 가능해야 하기 때문입니다.",
        ],
        en: [
          "Instead of one pass over the page, I split it into four stages: (1) an AI layout detector locates regions and classifies them into ten types; (2) a rule-based pass removes duplicates, fixes reading order and routes each region to a task; (3) an AI recognizer reads each region — tables in table mode, body text in OCR mode; (4) rules catch runaway repetition and token-limit hits and flag them as needs_review.",
          "The recognition model never changed — only how it is fed. Smaller crops cut VRAM sharply, and the infinite repetition that came from stuffing a whole page into one prompt disappeared.",
          "Our team rule is that every step must declare whether it is AI or deterministic, so the output JSON carries a source field per stage. Matching decisions have to stay explainable.",
        ],
      },
      metrics: [
        {
          label: {
            ko: "핵심 문자열 재현율",
            en: "Key-string recall",
          },
          before: "68%",
          after: "88%",
          note: {
            ko: "한글 실물 문서 15장 · 핵심 문자열 268개 기준",
            en: "Measured on 15 real Korean documents, 268 key strings",
          },
        },
        {
          label: { ko: "VRAM 피크", en: "Peak VRAM" },
          before: "8,312MB",
          after: "2,078MB",
          note: {
            ko: "영역을 나누자 조각이 작아져 4분의 1로 감소",
            en: "Smaller crops brought it down to a quarter",
          },
        },
        {
          label: {
            ko: "저품질(팩스) 문서 재현율",
            en: "Recall on low-quality faxes",
          },
          before: "5%",
          after: "68%",
        },
        {
          label: {
            ko: "ONNX 전환 후 재현율",
            en: "Recall after the ONNX switch",
          },
          before: "87%",
          after: "88%",
          note: {
            ko: "라이선스 회피를 위한 전환이었지만 정확도 손실은 없었음",
            en: "The switch was for licensing, and it cost no accuracy",
          },
        },
      ],
      result: {
        ko: [
          "성능만큼 중요했던 건 라이선스 판단이었습니다. 레이아웃 검출에 쓰려던 DocLayout-YOLO는 가중치가 Apache-2.0인데 실행 패키지는 AGPL-3.0이었습니다. 패키지를 그대로 쓰면 AGPL이 전염되어, 서버로 서비스할 때 우리 소스까지 공개해야 합니다.",
          "그래서 Apache-2.0인 가중치만 ONNX로 변환해 onnxruntime(MIT)으로 실행하도록 바꿨습니다. 저장소에 AGPL 코드도, 그에 의존하는 스크립트도 남기지 않았습니다. 변환본은 원본 출처와 변경 사항, 라이선스를 명시해 Hugging Face에 재배포했습니다.",
          "재현성을 위해 모델 가중치는 저장소에 커밋하지 않고, 저장소 ID와 커밋 SHA를 configs/models.yaml에 고정한 뒤 스크립트로 내려받습니다. 원본이 갱신되어도 같은 결과가 나옵니다.",
        ],
        en: [
          "The licensing call mattered as much as the numbers. DocLayout-YOLO ships Apache-2.0 weights inside an AGPL-3.0 runtime package. Using the package as-is would make AGPL infectious — serving it would force us to open our own source.",
          "So I converted only the Apache-2.0 weights to ONNX and ran them through onnxruntime (MIT). No AGPL code, and nothing depending on it, remains in the repository. I republished the conversion on Hugging Face with the original source, the changes and the license spelled out.",
          "For reproducibility the weights are never committed. configs/models.yaml pins the repository ID and commit SHA, and a script fetches them — so the result stays identical even if upstream moves.",
        ],
      },
      retrospective: {
        ko: [
          "모델을 바꾸기 전에 입력을 의심하는 편이 빨랐습니다. 같은 모델인데 입력 단위만 바꿔 재현율이 20%p 올랐고, 흔히 트레이드오프라고 여기는 정확도와 메모리가 이번엔 같은 방향으로 움직였습니다.",
          "현재 범위는 '글자 추출'까지입니다. 추출된 텍스트에서 병원 정보 필드를 뽑아 HospitalInfo 포맷으로 만드는 단계는 아직 구현하지 않았습니다.",
        ],
        en: [
          "Suspecting the input before the model was the faster path. The same model gained 20 percentage points of recall purely from a change in input granularity, and accuracy and memory — usually a trade-off — moved together.",
          "The module currently stops at text extraction. Turning that text into HospitalInfo fields is not implemented yet.",
        ],
      },
    },
  },
  {
    slug: "bms-soc-soh",
    title: {
      ko: "ESS 배터리 SoC · SoH 예측 연구",
      en: "SoC / SoH Prediction for ESS Batteries",
    },
    summary: {
      ko: "EDCL 랩에서 진행 중인 배터리 상태 추정 연구. 시계열 모델로 충전 상태와 수명을 예측합니다.",
      en: "Ongoing battery state estimation research at EDCL Lab, predicting charge state and health with sequence models.",
    },
    period: "2026.03",
    ongoing: true,
    kind: "research",
    tech: ["LSTM", "Transformer", "Ansys", "MATLAB"],
    links: [],
  },
  {
    slug: "stock-agent",
    title: {
      ko: "Stock Agent — 주식 분석 에이전트",
      en: "Stock Agent — Stock Analysis Agents",
    },
    summary: {
      ko: "FastAPI 추론 서버와 React 콘솔로 만든 주식 에이전트. 뉴스 감성·재무·차트·공시 에이전트가 매일 데이터를 쌓고 모의투자까지 실행합니다.",
      en: "A FastAPI inference server with a React console — news-sentiment, financials, chart and disclosure agents accumulate data daily and run simulated trading.",
    },
    period: "2025.12",
    ongoing: true,
    kind: "ai",
    tech: ["Python", "FastAPI", "React", "Gemini", "DART · KIS API"],
    links: [
      {
        label: "Dataset",
        href: "https://huggingface.co/datasets/podongchip/kospi-daily-stock-features-2021-2026",
      },
    ],
  },
  {
    slug: "llm-prompt-routing",
    title: {
      ko: "LLM 파인튜닝 · 프롬프트 라우팅",
      en: "LLM Fine-tuning and Prompt Routing",
    },
    summary: {
      ko: "직접 구성한 데이터셋으로 모델을 학습시키고, 사용자 입력을 생성형 AI별 강점에 맞게 다시 쓰는 실험.",
      en: "Fine-tuning on a self-built dataset, then rewriting user input to match the strengths of each generative model.",
    },
    period: "2026.01 – 2026.05",
    ongoing: false,
    kind: "ai",
    tech: ["Python", "Ollama", "Qwen 2.5"],
    links: [
      {
        label: "Dataset",
        href: "https://huggingface.co/datasets/podongchip/korean-ai-prompt-style-dataset",
      },
    ],
  },
  {
    slug: "lab-website",
    title: {
      ko: "연구실 웹사이트 개발 · 운영",
      en: "Lab Website — Development and Operations",
    },
    summary: {
      ko: "EDCL 연구실 웹사이트를 Firebase와 연동해 개발하고 유지보수하고 있습니다.",
      en: "Building and maintaining the EDCL lab website, wired up to Firebase.",
    },
    period: "2026.04",
    ongoing: true,
    kind: "backend",
    tech: ["HTML", "CSS", "JavaScript", "Firebase"],
    links: [],
  },
];

export const workBySlug = new Map(work.map((w) => [w.slug, w]));
